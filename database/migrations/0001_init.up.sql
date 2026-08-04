-- 0001_init.up.sql
-- Core schema (content, clients, projects, invoices, messages, files, employees, auth infra).
-- Sales/leads module is 0002. Apply as jz_owner.

BEGIN;

CREATE TABLE schema_migrations (
  version text PRIMARY KEY,
  checksum text NOT NULL,
  applied_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE sessions (
  id uuid PRIMARY KEY DEFAULT uuidv7(),
  subject_id uuid NOT NULL,
  role text NOT NULL,
  employee_kind text,
  token_hash text NOT NULL,
  expires_at timestamptz NOT NULL,
  revoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT sessions_role_check CHECK (role IN ('admin', 'client', 'employee')),
  CONSTRAINT sessions_employee_kind_check CHECK (
    (role = 'employee' AND employee_kind IN ('delivery', 'sales'))
    OR (role <> 'employee' AND employee_kind IS NULL)
  ),
  CONSTRAINT sessions_token_hash_key UNIQUE (token_hash)
);

CREATE INDEX sessions_subject_id_idx ON sessions (subject_id);
CREATE INDEX sessions_expires_at_idx ON sessions (expires_at);

CREATE TABLE hmac_nonces (
  nonce text PRIMARY KEY,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT hmac_nonces_nonce_len CHECK (char_length(nonce) >= 16 AND char_length(nonce) <= 128)
);

CREATE INDEX hmac_nonces_expires_at_idx ON hmac_nonces (expires_at);

CREATE TABLE rate_limit_buckets (
  bucket_key text PRIMARY KEY,
  tokens numeric(12, 4) NOT NULL,
  last_refill_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT rate_limit_buckets_key_len CHECK (char_length(bucket_key) >= 1 AND char_length(bucket_key) <= 256),
  CONSTRAINT rate_limit_buckets_tokens_nonneg CHECK (tokens >= 0)
);

CREATE TABLE idempotency_keys (
  id uuid PRIMARY KEY DEFAULT uuidv7(),
  idempotency_key text NOT NULL,
  method text NOT NULL,
  path text NOT NULL,
  subject_id uuid,
  response_status integer NOT NULL,
  response_body jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  CONSTRAINT idempotency_keys_key_len CHECK (char_length(idempotency_key) >= 1 AND char_length(idempotency_key) <= 128),
  CONSTRAINT idempotency_keys_method_len CHECK (char_length(method) >= 1 AND char_length(method) <= 16),
  CONSTRAINT idempotency_keys_path_len CHECK (char_length(path) >= 1 AND char_length(path) <= 512),
  CONSTRAINT idempotency_keys_status_check CHECK (response_status >= 100 AND response_status <= 599)
);

CREATE UNIQUE INDEX idempotency_keys_lookup_idx
  ON idempotency_keys (idempotency_key, method, path, subject_id);
CREATE INDEX idempotency_keys_expires_at_idx ON idempotency_keys (expires_at);

CREATE TABLE project_statuses (
  code text PRIMARY KEY,
  label text NOT NULL,
  sort_order integer NOT NULL,
  color text,
  CONSTRAINT project_statuses_code_len CHECK (char_length(code) >= 1 AND char_length(code) <= 64),
  CONSTRAINT project_statuses_label_len CHECK (char_length(label) >= 1 AND char_length(label) <= 128)
);

CREATE TABLE invoice_statuses (
  code text PRIMARY KEY,
  label text NOT NULL,
  sort_order integer NOT NULL,
  color text,
  CONSTRAINT invoice_statuses_code_len CHECK (char_length(code) >= 1 AND char_length(code) <= 64),
  CONSTRAINT invoice_statuses_label_len CHECK (char_length(label) >= 1 AND char_length(label) <= 128)
);

INSERT INTO project_statuses (code, label, sort_order) VALUES
  ('requested', 'Requested', 10),
  ('approved', 'Approved', 20),
  ('in_progress', 'In progress', 30),
  ('completed', 'Completed', 40);

INSERT INTO invoice_statuses (code, label, sort_order) VALUES
  ('draft', 'Draft', 10),
  ('sent', 'Sent', 20),
  ('paid', 'Paid', 30);

CREATE TABLE admins (
  id uuid PRIMARY KEY DEFAULT uuidv7(),
  email text NOT NULL,
  password_hash text NOT NULL,
  name text NOT NULL,
  version integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  archived_at timestamptz,
  CONSTRAINT admins_email_len CHECK (char_length(email) >= 3 AND char_length(email) <= 320),
  CONSTRAINT admins_password_hash_len CHECK (char_length(password_hash) >= 20 AND char_length(password_hash) <= 255),
  CONSTRAINT admins_name_len CHECK (char_length(name) >= 1 AND char_length(name) <= 200),
  CONSTRAINT admins_version_pos CHECK (version >= 1)
);

CREATE UNIQUE INDEX admins_email_active_key ON admins (email) WHERE archived_at IS NULL;

CREATE TABLE employees (
  id uuid PRIMARY KEY DEFAULT uuidv7(),
  email text NOT NULL,
  password_hash text NOT NULL,
  name text NOT NULL,
  title text NOT NULL DEFAULT '',
  department text NOT NULL DEFAULT '',
  kind text NOT NULL,
  image_path text NOT NULL DEFAULT '',
  team_member_id uuid,
  version integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  archived_at timestamptz,
  CONSTRAINT employees_email_len CHECK (char_length(email) >= 3 AND char_length(email) <= 320),
  CONSTRAINT employees_password_hash_len CHECK (char_length(password_hash) >= 20 AND char_length(password_hash) <= 255),
  CONSTRAINT employees_name_len CHECK (char_length(name) >= 1 AND char_length(name) <= 200),
  CONSTRAINT employees_kind_check CHECK (kind IN ('delivery', 'sales')),
  CONSTRAINT employees_version_pos CHECK (version >= 1)
);

CREATE UNIQUE INDEX employees_email_active_key ON employees (email) WHERE archived_at IS NULL;
CREATE INDEX employees_kind_idx ON employees (kind) WHERE archived_at IS NULL;

CREATE TABLE clients (
  id uuid PRIMARY KEY DEFAULT uuidv7(),
  email text NOT NULL,
  password_hash text NOT NULL,
  name text NOT NULL,
  company text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'active',
  initials text NOT NULL DEFAULT '',
  member_since date NOT NULL DEFAULT (CURRENT_DATE),
  version integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  archived_at timestamptz,
  CONSTRAINT clients_email_len CHECK (char_length(email) >= 3 AND char_length(email) <= 320),
  CONSTRAINT clients_password_hash_len CHECK (char_length(password_hash) >= 20 AND char_length(password_hash) <= 255),
  CONSTRAINT clients_name_len CHECK (char_length(name) >= 1 AND char_length(name) <= 200),
  CONSTRAINT clients_status_check CHECK (status IN ('active', 'paused')),
  CONSTRAINT clients_version_pos CHECK (version >= 1)
);

CREATE UNIQUE INDEX clients_email_active_key ON clients (email) WHERE archived_at IS NULL;

CREATE TABLE client_employee_assignments (
  client_id uuid NOT NULL REFERENCES clients (id) ON DELETE CASCADE,
  employee_id uuid NOT NULL REFERENCES employees (id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (client_id, employee_id)
);

CREATE INDEX client_employee_assignments_employee_id_idx ON client_employee_assignments (employee_id);

CREATE TABLE services (
  id uuid PRIMARY KEY DEFAULT uuidv7(),
  title text NOT NULL,
  slug text NOT NULL,
  description text NOT NULL DEFAULT '',
  path text NOT NULL DEFAULT '',
  image_path text NOT NULL DEFAULT '',
  version integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  archived_at timestamptz,
  CONSTRAINT services_title_len CHECK (char_length(title) >= 1 AND char_length(title) <= 200),
  CONSTRAINT services_slug_len CHECK (char_length(slug) >= 1 AND char_length(slug) <= 200),
  CONSTRAINT services_version_pos CHECK (version >= 1)
);

CREATE UNIQUE INDEX services_slug_active_key ON services (slug) WHERE archived_at IS NULL;

CREATE TABLE portfolio_items (
  id uuid PRIMARY KEY DEFAULT uuidv7(),
  title text NOT NULL,
  category text NOT NULL DEFAULT '',
  summary text NOT NULL DEFAULT '',
  image_path text NOT NULL DEFAULT '',
  version integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  archived_at timestamptz,
  CONSTRAINT portfolio_items_title_len CHECK (char_length(title) >= 1 AND char_length(title) <= 200),
  CONSTRAINT portfolio_items_version_pos CHECK (version >= 1)
);

CREATE TABLE blog_posts (
  id uuid PRIMARY KEY DEFAULT uuidv7(),
  title text NOT NULL,
  slug text NOT NULL,
  excerpt text NOT NULL DEFAULT '',
  image_path text NOT NULL DEFAULT '',
  version integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  archived_at timestamptz,
  CONSTRAINT blog_posts_title_len CHECK (char_length(title) >= 1 AND char_length(title) <= 200),
  CONSTRAINT blog_posts_slug_len CHECK (char_length(slug) >= 1 AND char_length(slug) <= 200),
  CONSTRAINT blog_posts_version_pos CHECK (version >= 1)
);

CREATE UNIQUE INDEX blog_posts_slug_active_key ON blog_posts (slug) WHERE archived_at IS NULL;

CREATE TABLE faqs (
  id uuid PRIMARY KEY DEFAULT uuidv7(),
  question text NOT NULL,
  answer text NOT NULL,
  version integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  archived_at timestamptz,
  CONSTRAINT faqs_question_len CHECK (char_length(question) >= 1 AND char_length(question) <= 500),
  CONSTRAINT faqs_answer_len CHECK (char_length(answer) >= 1 AND char_length(answer) <= 10000),
  CONSTRAINT faqs_version_pos CHECK (version >= 1)
);

CREATE TABLE team_members (
  id uuid PRIMARY KEY DEFAULT uuidv7(),
  name text NOT NULL,
  role_title text NOT NULL DEFAULT '',
  bio text NOT NULL DEFAULT '',
  image_path text NOT NULL DEFAULT '',
  employee_id uuid REFERENCES employees (id) ON DELETE SET NULL,
  version integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  archived_at timestamptz,
  CONSTRAINT team_members_name_len CHECK (char_length(name) >= 1 AND char_length(name) <= 200),
  CONSTRAINT team_members_version_pos CHECK (version >= 1)
);

ALTER TABLE employees
  ADD CONSTRAINT employees_team_member_id_fkey
  FOREIGN KEY (team_member_id) REFERENCES team_members (id) ON DELETE SET NULL;

CREATE TABLE projects (
  id uuid PRIMARY KEY DEFAULT uuidv7(),
  client_id uuid NOT NULL REFERENCES clients (id) ON DELETE RESTRICT,
  title text NOT NULL,
  service text NOT NULL DEFAULT '',
  status text NOT NULL REFERENCES project_statuses (code) ON DELETE RESTRICT,
  notes text NOT NULL DEFAULT '',
  version integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  archived_at timestamptz,
  CONSTRAINT projects_title_len CHECK (char_length(title) >= 1 AND char_length(title) <= 200),
  CONSTRAINT projects_version_pos CHECK (version >= 1)
);

CREATE INDEX projects_client_id_idx ON projects (client_id) WHERE archived_at IS NULL;
CREATE INDEX projects_status_idx ON projects (status) WHERE archived_at IS NULL;

CREATE TABLE invoices (
  id uuid PRIMARY KEY DEFAULT uuidv7(),
  client_id uuid NOT NULL REFERENCES clients (id) ON DELETE RESTRICT,
  number text NOT NULL,
  title text NOT NULL,
  amount numeric(14, 2) NOT NULL,
  currency char(3) NOT NULL,
  status text NOT NULL REFERENCES invoice_statuses (code) ON DELETE RESTRICT,
  due_date date,
  version integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  archived_at timestamptz,
  CONSTRAINT invoices_number_len CHECK (char_length(number) >= 1 AND char_length(number) <= 64),
  CONSTRAINT invoices_title_len CHECK (char_length(title) >= 1 AND char_length(title) <= 200),
  CONSTRAINT invoices_amount_nonneg CHECK (amount >= 0),
  CONSTRAINT invoices_currency_check CHECK (currency ~ '^[A-Z]{3}$'),
  CONSTRAINT invoices_version_pos CHECK (version >= 1)
);

CREATE UNIQUE INDEX invoices_number_active_key ON invoices (number) WHERE archived_at IS NULL;
CREATE INDEX invoices_client_id_idx ON invoices (client_id) WHERE archived_at IS NULL;

CREATE TABLE messages (
  id uuid PRIMARY KEY DEFAULT uuidv7(),
  client_id uuid NOT NULL REFERENCES clients (id) ON DELETE RESTRICT,
  sender_role text NOT NULL,
  body text NOT NULL,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  archived_at timestamptz,
  CONSTRAINT messages_sender_role_check CHECK (sender_role IN ('admin', 'client', 'employee')),
  CONSTRAINT messages_body_len CHECK (char_length(body) >= 1 AND char_length(body) <= 20000)
);

CREATE INDEX messages_client_id_idx ON messages (client_id) WHERE archived_at IS NULL;

CREATE TABLE files (
  id uuid PRIMARY KEY DEFAULT uuidv7(),
  client_id uuid NOT NULL REFERENCES clients (id) ON DELETE RESTRICT,
  original_name text NOT NULL,
  storage_key text NOT NULL,
  content_type text NOT NULL,
  size_bytes bigint NOT NULL,
  checksum_sha256 text NOT NULL,
  uploaded_by_subject_id uuid NOT NULL,
  uploaded_by_role text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  archived_at timestamptz,
  CONSTRAINT files_original_name_len CHECK (char_length(original_name) >= 1 AND char_length(original_name) <= 500),
  CONSTRAINT files_storage_key_len CHECK (char_length(storage_key) >= 1 AND char_length(storage_key) <= 1024),
  CONSTRAINT files_content_type_len CHECK (char_length(content_type) >= 1 AND char_length(content_type) <= 255),
  CONSTRAINT files_size_bytes_nonneg CHECK (size_bytes >= 0),
  CONSTRAINT files_checksum_sha256_len CHECK (char_length(checksum_sha256) = 64),
  CONSTRAINT files_uploaded_by_role_check CHECK (uploaded_by_role IN ('admin', 'client', 'employee')),
  CONSTRAINT files_storage_key_key UNIQUE (storage_key)
);

CREATE UNIQUE INDEX files_client_id_name_active_key
  ON files (client_id, original_name) WHERE archived_at IS NULL;
CREATE INDEX files_client_id_idx ON files (client_id) WHERE archived_at IS NULL;

CREATE TABLE callbacks (
  id uuid PRIMARY KEY DEFAULT uuidv7(),
  name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL DEFAULT '',
  note text NOT NULL DEFAULT '',
  status text NOT NULL DEFAULT 'new',
  version integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  archived_at timestamptz,
  CONSTRAINT callbacks_name_len CHECK (char_length(name) >= 1 AND char_length(name) <= 200),
  CONSTRAINT callbacks_email_len CHECK (char_length(email) >= 3 AND char_length(email) <= 320),
  CONSTRAINT callbacks_status_check CHECK (status IN ('new', 'resolved')),
  CONSTRAINT callbacks_version_pos CHECK (version >= 1)
);

CREATE TABLE contact_messages (
  id uuid PRIMARY KEY DEFAULT uuidv7(),
  name text NOT NULL,
  email text NOT NULL,
  subject text NOT NULL DEFAULT '',
  body text NOT NULL,
  status text NOT NULL DEFAULT 'new',
  version integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  archived_at timestamptz,
  CONSTRAINT contact_messages_name_len CHECK (char_length(name) >= 1 AND char_length(name) <= 200),
  CONSTRAINT contact_messages_email_len CHECK (char_length(email) >= 3 AND char_length(email) <= 320),
  CONSTRAINT contact_messages_body_len CHECK (char_length(body) >= 1 AND char_length(body) <= 20000),
  CONSTRAINT contact_messages_status_check CHECK (status IN ('new', 'read')),
  CONSTRAINT contact_messages_version_pos CHECK (version >= 1)
);

CREATE VIEW admins_active AS SELECT * FROM admins WHERE archived_at IS NULL;
CREATE VIEW employees_active AS SELECT * FROM employees WHERE archived_at IS NULL;
CREATE VIEW clients_active AS SELECT * FROM clients WHERE archived_at IS NULL;
CREATE VIEW services_active AS SELECT * FROM services WHERE archived_at IS NULL;
CREATE VIEW portfolio_items_active AS SELECT * FROM portfolio_items WHERE archived_at IS NULL;
CREATE VIEW blog_posts_active AS SELECT * FROM blog_posts WHERE archived_at IS NULL;
CREATE VIEW faqs_active AS SELECT * FROM faqs WHERE archived_at IS NULL;
CREATE VIEW team_members_active AS SELECT * FROM team_members WHERE archived_at IS NULL;
CREATE VIEW projects_active AS SELECT * FROM projects WHERE archived_at IS NULL;
CREATE VIEW invoices_active AS SELECT * FROM invoices WHERE archived_at IS NULL;
CREATE VIEW messages_active AS SELECT * FROM messages WHERE archived_at IS NULL;
CREATE VIEW files_active AS SELECT * FROM files WHERE archived_at IS NULL;
CREATE VIEW callbacks_active AS SELECT * FROM callbacks WHERE archived_at IS NULL;
CREATE VIEW contact_messages_active AS SELECT * FROM contact_messages WHERE archived_at IS NULL;

REVOKE ALL ON ALL TABLES IN SCHEMA public FROM PUBLIC;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM PUBLIC;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM PUBLIC;

GRANT SELECT, INSERT, UPDATE, DELETE ON schema_migrations TO jz_owner;

GRANT SELECT ON schema_migrations TO jz_app;
GRANT SELECT ON schema_migrations TO jz_readonly;

GRANT SELECT, INSERT, UPDATE, DELETE ON
  sessions,
  hmac_nonces,
  rate_limit_buckets,
  idempotency_keys,
  project_statuses,
  invoice_statuses,
  client_employee_assignments
TO jz_app;

GRANT SELECT ON
  sessions,
  hmac_nonces,
  rate_limit_buckets,
  idempotency_keys,
  project_statuses,
  invoice_statuses,
  client_employee_assignments
TO jz_readonly;

GRANT INSERT, UPDATE, DELETE ON
  admins,
  employees,
  clients,
  services,
  portfolio_items,
  blog_posts,
  faqs,
  team_members,
  projects,
  invoices,
  messages,
  files,
  callbacks,
  contact_messages
TO jz_app;

GRANT SELECT ON
  admins_active,
  employees_active,
  clients_active,
  services_active,
  portfolio_items_active,
  blog_posts_active,
  faqs_active,
  team_members_active,
  projects_active,
  invoices_active,
  messages_active,
  files_active,
  callbacks_active,
  contact_messages_active
TO jz_app;

GRANT SELECT ON
  admins,
  employees,
  clients,
  services,
  portfolio_items,
  blog_posts,
  faqs,
  team_members,
  projects,
  invoices,
  messages,
  files,
  callbacks,
  contact_messages,
  admins_active,
  employees_active,
  clients_active,
  services_active,
  portfolio_items_active,
  blog_posts_active,
  faqs_active,
  team_members_active,
  projects_active,
  invoices_active,
  messages_active,
  files_active,
  callbacks_active,
  contact_messages_active
TO jz_readonly;

ALTER DEFAULT PRIVILEGES FOR ROLE jz_owner IN SCHEMA public
  REVOKE ALL ON TABLES FROM PUBLIC;

COMMIT;
