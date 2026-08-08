-- Dev seeds for Phase 3 operational domain. Synthetic only.
-- Requires 001_identity.sql users/employees already present.
-- No binary files.

BEGIN;

INSERT INTO clients (
  user_id, company, phone, status_code, member_since,
  client_contact_title, location, plan
)
SELECT
  u.id,
  'Example Logistics LLC',
  '+1-555-0100',
  'active',
  CURRENT_DATE - 90,
  'Operations Contact',
  'Austin, TX',
  'Standard'
FROM users u
WHERE u.email = 'client@jumpifzero.example'
  AND u.archived_at IS NULL
  AND NOT EXISTS (
    SELECT 1 FROM clients c WHERE c.user_id = u.id
  );

INSERT INTO client_employee_assignments (client_id, employee_id)
SELECT c.id, e.id
FROM clients c
JOIN users cu ON cu.id = c.user_id AND cu.email = 'client@jumpifzero.example'
JOIN users eu ON eu.email = 'delivery@jumpifzero.example'
JOIN employees e ON e.user_id = eu.id AND e.archived_at IS NULL
WHERE c.archived_at IS NULL
  AND NOT EXISTS (
    SELECT 1
    FROM client_employee_assignments a
    WHERE a.client_id = c.id AND a.employee_id = e.id
  );

INSERT INTO projects (
  client_id, service_id, title, status_code, notes,
  manager_employee_id, next_milestone, next_milestone_date, progress
)
SELECT
  c.id,
  s.id,
  'Website redesign',
  'in_progress',
  'Kickoff complete. Design system in progress.',
  e.id,
  'Design review',
  CURRENT_DATE + 14,
  45
FROM clients c
JOIN users cu ON cu.id = c.user_id AND cu.email = 'client@jumpifzero.example'
JOIN services_active s ON s.slug = (
  SELECT slug FROM services_active ORDER BY created_at ASC LIMIT 1
)
JOIN users eu ON eu.email = 'delivery@jumpifzero.example'
JOIN employees e ON e.user_id = eu.id AND e.archived_at IS NULL
WHERE c.archived_at IS NULL
  AND NOT EXISTS (
    SELECT 1 FROM projects p
    WHERE p.client_id = c.id AND p.title = 'Website redesign' AND p.archived_at IS NULL
  )
  AND EXISTS (SELECT 1 FROM services_active LIMIT 1);

INSERT INTO invoices (
  client_id, number, title, amount, currency, status_code, due_date, issued_on,
  bill_to_company, bill_to_name, bill_to_email, bill_to_phone, bill_to_location,
  from_company, from_email, from_phone
)
SELECT
  c.id,
  'INV-DEV-1001',
  'Website redesign — deposit',
  2500.00,
  'USD',
  'sent',
  CURRENT_DATE + 30,
  CURRENT_DATE - 7,
  c.company,
  COALESCE(cu.name, ''),
  COALESCE(cu.email, ''),
  c.phone,
  c.location,
  'JZ Enterprises',
  'ikram@jumpifzero.com',
  '03079222055'
FROM clients c
JOIN users cu ON cu.id = c.user_id AND cu.email = 'client@jumpifzero.example'
WHERE c.archived_at IS NULL
  AND NOT EXISTS (
    SELECT 1 FROM invoices i WHERE i.number = 'INV-DEV-1001' AND i.archived_at IS NULL
  );

INSERT INTO messages (client_id, sender_role, sender_user_id, body)
SELECT
  c.id,
  'admin',
  au.id,
  'Welcome to Jump If Zero. Your project workspace is ready.'
FROM clients c
JOIN users cu ON cu.id = c.user_id AND cu.email = 'client@jumpifzero.example'
JOIN users au ON au.email = 'admin@jumpifzero.example' AND au.archived_at IS NULL
WHERE c.archived_at IS NULL
  AND NOT EXISTS (
    SELECT 1 FROM messages m
    WHERE m.client_id = c.id
      AND m.body = 'Welcome to Jump If Zero. Your project workspace is ready.'
      AND m.archived_at IS NULL
  );

COMMIT;
