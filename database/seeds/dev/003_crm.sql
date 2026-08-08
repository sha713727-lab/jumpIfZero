-- Dev seeds for Phase 4 CRM domain. Synthetic only.
-- Requires 001_identity.sql users/employees already present.
-- No carriers/sales (tax ciphertext created via API probe).

BEGIN;

INSERT INTO users (email, password_hash, name, title, role)
SELECT
  'sales2@jumpifzero.example',
  '$argon2id$v=19$m=65536,t=3,p=1$ElS96OhLmGOx7Lb8W2FpBw$ReVyRPm6MSJ0ew4vyO+F5W45w9AqXeG2INWNulEJAhQ',
  'Dev Sales Two',
  'Sales Rep',
  'employee'
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'sales2@jumpifzero.example'
);

INSERT INTO employees (user_id, title, department, kind, image_path)
SELECT u.id, 'Sales Rep', 'Sales', 'sales', ''
FROM users u
WHERE u.email = 'sales2@jumpifzero.example'
  AND NOT EXISTS (
    SELECT 1 FROM employees e WHERE e.user_id = u.id
  );

INSERT INTO parties (kind, name, phone, street, city_state_zip, email)
SELECT 'insurance', 'Example Insurance Co', '+1-555-0201', '100 Policy Ave', 'Dallas, TX 75201', 'claims@example-insurance.example'
WHERE NOT EXISTS (
  SELECT 1 FROM parties p
  WHERE p.kind = 'insurance' AND p.name = 'Example Insurance Co' AND p.archived_at IS NULL
);

INSERT INTO parties (kind, name, phone, street, city_state_zip, email)
SELECT 'factoring', 'Example Factoring LLC', '+1-555-0202', '200 Capital Blvd', 'Chicago, IL 60601', 'ops@example-factoring.example'
WHERE NOT EXISTS (
  SELECT 1 FROM parties p
  WHERE p.kind = 'factoring' AND p.name = 'Example Factoring LLC' AND p.archived_at IS NULL
);

INSERT INTO leads (
  rep_id, company, contact_name, phone, email, source, status_code, notes
)
SELECT
  e.id,
  'Midwest Freight Prospects',
  'Jordan Lee',
  '+1-555-0300',
  'jordan@midwest-freight.example',
  'referral',
  'new',
  'Interested in factoring after Q3 review.'
FROM users u
JOIN employees e ON e.user_id = u.id AND e.archived_at IS NULL
WHERE u.email = 'sales@jumpifzero.example'
  AND NOT EXISTS (
    SELECT 1 FROM leads l
    WHERE l.company = 'Midwest Freight Prospects' AND l.archived_at IS NULL
  );

INSERT INTO lead_follow_ups (lead_id, occurred_at, note, outcome)
SELECT
  l.id,
  now() - interval '2 days',
  'Initial call — left voicemail.',
  'no_answer'
FROM leads l
WHERE l.company = 'Midwest Freight Prospects'
  AND l.archived_at IS NULL
  AND NOT EXISTS (
    SELECT 1 FROM lead_follow_ups f
    WHERE f.lead_id = l.id AND f.outcome = 'no_answer'
  );

INSERT INTO sales_messages (from_rep_id, to_rep_id, body, sent_at)
SELECT
  e1.id,
  e2.id,
  'Can you cover the Midwest Freight lead while I am out Thursday?',
  now() - interval '1 day'
FROM users u1
JOIN employees e1 ON e1.user_id = u1.id AND e1.archived_at IS NULL
JOIN users u2 ON u2.email = 'sales2@jumpifzero.example'
JOIN employees e2 ON e2.user_id = u2.id AND e2.archived_at IS NULL
WHERE u1.email = 'sales@jumpifzero.example'
  AND NOT EXISTS (
    SELECT 1 FROM sales_messages m
    WHERE m.body = 'Can you cover the Midwest Freight lead while I am out Thursday?'
  );

COMMIT;
