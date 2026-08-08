-- Dev seeds only. Synthetic identities. Never load in production.
-- Passwords (argon2id): documented in database/seeds/dev/README.md

BEGIN;

INSERT INTO users (email, password_hash, name, title, role)
SELECT
  'admin@jumpifzero.example',
  '$argon2id$v=19$m=65536,t=3,p=1$DNvQ6zHBPy32P1sC3Yixqg$fHhFJFl7gXEXOu+FV8Kl7Q9WiXsX7PevyD29Gtmh7Dc',
  'Dev Owner',
  'Founder',
  'admin'
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'admin@jumpifzero.example'
);

INSERT INTO users (email, password_hash, name, title, role)
SELECT
  'delivery@jumpifzero.example',
  '$argon2id$v=19$m=65536,t=3,p=1$A+26HKoF8QC3FuE2nQrT4Q$8aNfa+JyYk2OHy0OYjVJ/LH/YvDPRHJfYVPjusMqlbU',
  'Dev Delivery',
  'Delivery Lead',
  'employee'
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'delivery@jumpifzero.example'
);

INSERT INTO users (email, password_hash, name, title, role)
SELECT
  'sales@jumpifzero.example',
  '$argon2id$v=19$m=65536,t=3,p=1$ElS96OhLmGOx7Lb8W2FpBw$ReVyRPm6MSJ0ew4vyO+F5W45w9AqXeG2INWNulEJAhQ',
  'Dev Sales',
  'Sales Lead',
  'employee'
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'sales@jumpifzero.example'
);

INSERT INTO users (email, password_hash, name, title, role)
SELECT
  'client@jumpifzero.example',
  '$argon2id$v=19$m=65536,t=3,p=1$Vw7lLNfQut+20E/PqbWBUQ$+X6y6WVf2ztMfW1wdQ25kN5m8hi//dDo4R/vAuSUvs4',
  'Dev Client',
  'Client Contact',
  'client'
WHERE NOT EXISTS (
  SELECT 1 FROM users WHERE email = 'client@jumpifzero.example'
);

INSERT INTO employees (user_id, title, department, kind, image_path)
SELECT u.id, 'Delivery Lead', 'Delivery', 'delivery', ''
FROM users u
WHERE u.email = 'delivery@jumpifzero.example'
  AND NOT EXISTS (
    SELECT 1 FROM employees e WHERE e.user_id = u.id
  );

INSERT INTO employees (user_id, title, department, kind, image_path)
SELECT u.id, 'Sales Lead', 'Sales', 'sales', ''
FROM users u
WHERE u.email = 'sales@jumpifzero.example'
  AND NOT EXISTS (
    SELECT 1 FROM employees e WHERE e.user_id = u.id
  );

COMMIT;
