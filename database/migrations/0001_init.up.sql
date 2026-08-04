-- 0001_init.up.sql
-- Schema per database/ERD.md v4. Apply as jz_owner.

BEGIN;

-- ---------------------------------------------------------------------------
-- Lookups
-- ---------------------------------------------------------------------------

CREATE TABLE client_statuses (
  code text PRIMARY KEY,
  label text NOT NULL,
  sort_order integer NOT NULL,
  color text,
  CONSTRAINT client_statuses_code_len CHECK (char_length(code) >= 1 AND char_length(code) <= 64),
  CONSTRAINT client_statuses_label_len CHECK (char_length(label) >= 1 AND char_length(label) <= 128)
);

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

CREATE TABLE sale_statuses (
  code text PRIMARY KEY,
  label text NOT NULL,
  sort_order integer NOT NULL,
  color text,
  CONSTRAINT sale_statuses_code_len CHECK (char_length(code) >= 1 AND char_length(code) <= 64),
  CONSTRAINT sale_statuses_label_len CHECK (char_length(label) >= 1 AND char_length(label) <= 128)
);

CREATE TABLE lead_statuses (
  code text PRIMARY KEY,
  label text NOT NULL,
  sort_order integer NOT NULL,
  color text,
  CONSTRAINT lead_statuses_code_len CHECK (char_length(code) >= 1 AND char_length(code) <= 64),
  CONSTRAINT lead_statuses_label_len CHECK (char_length(label) >= 1 AND char_length(label) <= 128)
);

CREATE TABLE callback_statuses (
  code text PRIMARY KEY,
  label text NOT NULL,
  sort_order integer NOT NULL,
  color text,
  CONSTRAINT callback_statuses_code_len CHECK (char_length(code) >= 1 AND char_length(code) <= 64),
  CONSTRAINT callback_statuses_label_len CHECK (char_length(label) >= 1 AND char_length(label) <= 128)
);

CREATE TABLE contact_message_statuses (
  code text PRIMARY KEY,
  label text NOT NULL,
  sort_order integer NOT NULL,
  color text,
  CONSTRAINT contact_message_statuses_code_len CHECK (char_length(code) >= 1 AND char_length(code) <= 64),
  CONSTRAINT contact_message_statuses_label_len CHECK (char_length(label) >= 1 AND char_length(label) <= 128)
);

INSERT INTO client_statuses (code, label, sort_order) VALUES
  ('active', 'Active', 10),
  ('paused', 'Paused', 20);

INSERT INTO project_statuses (code, label, sort_order) VALUES
  ('requested', 'Requested', 10),
  ('approved', 'Approved', 20),
  ('in_progress', 'In progress', 30),
  ('completed', 'Completed', 40);

INSERT INTO invoice_statuses (code, label, sort_order) VALUES
  ('draft', 'Draft', 10),
  ('sent', 'Sent', 20),
  ('paid', 'Paid', 30);

INSERT INTO sale_statuses (code, label, sort_order) VALUES
  ('draft', 'Draft', 10),
  ('quoted', 'Quoted', 20),
  ('won', 'Won', 30),
  ('lost', 'Lost', 40);

INSERT INTO lead_statuses (code, label, sort_order) VALUES
  ('new', 'New', 10),
  ('contacted', 'Contacted', 20),
  ('qualified', 'Qualified', 30),
  ('converted', 'Converted', 40),
  ('closed', 'Closed', 50);

INSERT INTO callback_statuses (code, label, sort_order) VALUES
  ('new', 'New', 10),
  ('resolved', 'Resolved', 20);

INSERT INTO contact_message_statuses (code, label, sort_order) VALUES
  ('new', 'New', 10),
  ('read', 'Read', 20);

-- ---------------------------------------------------------------------------
-- Identity
-- ---------------------------------------------------------------------------

CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT uuidv7(),
  email text NOT NULL,
  password_hash text NOT NULL,
  name text NOT NULL,
  title text,
  role text NOT NULL,
  version integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  archived_at timestamptz,
  CONSTRAINT users_email_len CHECK (char_length(email) >= 3 AND char_length(email) <= 320),
  CONSTRAINT users_password_hash_len CHECK (char_length(password_hash) >= 20 AND char_length(password_hash) <= 255),
  CONSTRAINT users_name_len CHECK (char_length(name) >= 1 AND char_length(name) <= 200),
  CONSTRAINT users_title_len CHECK (title IS NULL OR (char_length(title) >= 1 AND char_length(title) <= 200)),
  CONSTRAINT users_role_check CHECK (role IN ('admin', 'client', 'employee')),
  CONSTRAINT users_version_pos CHECK (version >= 1)
);

CREATE UNIQUE INDEX users_email_active_key ON users (email) WHERE archived_at IS NULL;

CREATE TABLE sessions (
  id uuid PRIMARY KEY DEFAULT uuidv7(),
  subject_id uuid NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  token_hash text NOT NULL,
  expires_at timestamptz NOT NULL,
  revoked_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT sessions_token_hash_len CHECK (char_length(token_hash) >= 32 AND char_length(token_hash) <= 128),
  CONSTRAINT sessions_token_hash_key UNIQUE (token_hash)
);

CREATE INDEX sessions_subject_id_idx ON sessions (subject_id);
CREATE INDEX sessions_expires_at_idx ON sessions (expires_at);

CREATE TABLE clients (
  id uuid PRIMARY KEY DEFAULT uuidv7(),
  user_id uuid NOT NULL REFERENCES users (id) ON DELETE RESTRICT,
  company text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  status_code text NOT NULL REFERENCES client_statuses (code) ON DELETE RESTRICT,
  member_since date NOT NULL DEFAULT (CURRENT_DATE),
  client_contact_title text NOT NULL DEFAULT '',
  location text NOT NULL DEFAULT '',
  plan text NOT NULL DEFAULT '',
  version integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  archived_at timestamptz,
  CONSTRAINT clients_user_id_key UNIQUE (user_id),
  CONSTRAINT clients_company_len CHECK (char_length(company) <= 200),
  CONSTRAINT clients_phone_len CHECK (char_length(phone) <= 64),
  CONSTRAINT clients_contact_title_len CHECK (char_length(client_contact_title) <= 200),
  CONSTRAINT clients_location_len CHECK (char_length(location) <= 200),
  CONSTRAINT clients_plan_len CHECK (char_length(plan) <= 200),
  CONSTRAINT clients_version_pos CHECK (version >= 1)
);

CREATE TABLE employees (
  id uuid PRIMARY KEY DEFAULT uuidv7(),
  user_id uuid NOT NULL REFERENCES users (id) ON DELETE RESTRICT,
  title text NOT NULL DEFAULT '',
  department text NOT NULL DEFAULT '',
  kind text NOT NULL,
  image_path text NOT NULL DEFAULT '',
  version integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  archived_at timestamptz,
  CONSTRAINT employees_user_id_key UNIQUE (user_id),
  CONSTRAINT employees_kind_check CHECK (kind IN ('delivery', 'sales')),
  CONSTRAINT employees_title_len CHECK (char_length(title) <= 200),
  CONSTRAINT employees_department_len CHECK (char_length(department) <= 200),
  CONSTRAINT employees_image_path_len CHECK (char_length(image_path) <= 1024),
  CONSTRAINT employees_version_pos CHECK (version >= 1)
);

CREATE INDEX employees_kind_active_idx ON employees (kind) WHERE archived_at IS NULL;

CREATE TABLE client_employee_assignments (
  client_id uuid NOT NULL REFERENCES clients (id) ON DELETE CASCADE,
  employee_id uuid NOT NULL REFERENCES employees (id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (client_id, employee_id)
);

CREATE INDEX client_employee_assignments_employee_id_idx ON client_employee_assignments (employee_id);

-- ---------------------------------------------------------------------------
-- Content
-- ---------------------------------------------------------------------------

CREATE TABLE services (
  id uuid PRIMARY KEY DEFAULT uuidv7(),
  title text NOT NULL,
  slug text NOT NULL,
  description text NOT NULL DEFAULT '',
  path text NOT NULL DEFAULT '',
  image_path text NOT NULL DEFAULT '',
  published_at timestamptz,
  version integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  archived_at timestamptz,
  CONSTRAINT services_title_len CHECK (char_length(title) >= 1 AND char_length(title) <= 200),
  CONSTRAINT services_slug_len CHECK (char_length(slug) >= 1 AND char_length(slug) <= 200),
  CONSTRAINT services_description_len CHECK (char_length(description) <= 10000),
  CONSTRAINT services_path_len CHECK (char_length(path) <= 512),
  CONSTRAINT services_image_path_len CHECK (char_length(image_path) <= 1024),
  CONSTRAINT services_version_pos CHECK (version >= 1)
);

CREATE UNIQUE INDEX services_slug_active_key ON services (slug) WHERE archived_at IS NULL;

CREATE TABLE portfolio_items (
  id uuid PRIMARY KEY DEFAULT uuidv7(),
  title text NOT NULL,
  category text NOT NULL DEFAULT '',
  summary text NOT NULL DEFAULT '',
  image_path text NOT NULL DEFAULT '',
  published_at timestamptz,
  version integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  archived_at timestamptz,
  CONSTRAINT portfolio_items_title_len CHECK (char_length(title) >= 1 AND char_length(title) <= 200),
  CONSTRAINT portfolio_items_category_len CHECK (char_length(category) <= 128),
  CONSTRAINT portfolio_items_summary_len CHECK (char_length(summary) <= 5000),
  CONSTRAINT portfolio_items_image_path_len CHECK (char_length(image_path) <= 1024),
  CONSTRAINT portfolio_items_version_pos CHECK (version >= 1)
);

CREATE TABLE blog_posts (
  id uuid PRIMARY KEY DEFAULT uuidv7(),
  title text NOT NULL,
  slug text NOT NULL,
  excerpt text NOT NULL DEFAULT '',
  body text NOT NULL DEFAULT '',
  image_path text NOT NULL DEFAULT '',
  category text NOT NULL DEFAULT '',
  published_at timestamptz,
  version integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  archived_at timestamptz,
  CONSTRAINT blog_posts_title_len CHECK (char_length(title) >= 1 AND char_length(title) <= 200),
  CONSTRAINT blog_posts_slug_len CHECK (char_length(slug) >= 1 AND char_length(slug) <= 200),
  CONSTRAINT blog_posts_excerpt_len CHECK (char_length(excerpt) <= 2000),
  CONSTRAINT blog_posts_body_len CHECK (char_length(body) <= 200000),
  CONSTRAINT blog_posts_image_path_len CHECK (char_length(image_path) <= 1024),
  CONSTRAINT blog_posts_category_len CHECK (char_length(category) <= 128),
  CONSTRAINT blog_posts_version_pos CHECK (version >= 1)
);

CREATE UNIQUE INDEX blog_posts_slug_active_key ON blog_posts (slug) WHERE archived_at IS NULL;

CREATE TABLE faqs (
  id uuid PRIMARY KEY DEFAULT uuidv7(),
  question text NOT NULL,
  answer text NOT NULL,
  published_at timestamptz,
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
  published_at timestamptz,
  version integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  archived_at timestamptz,
  CONSTRAINT team_members_name_len CHECK (char_length(name) >= 1 AND char_length(name) <= 200),
  CONSTRAINT team_members_role_title_len CHECK (char_length(role_title) <= 200),
  CONSTRAINT team_members_bio_len CHECK (char_length(bio) <= 10000),
  CONSTRAINT team_members_image_path_len CHECK (char_length(image_path) <= 1024),
  CONSTRAINT team_members_version_pos CHECK (version >= 1)
);

CREATE TABLE team_member_socials (
  id uuid PRIMARY KEY DEFAULT uuidv7(),
  team_member_id uuid NOT NULL REFERENCES team_members (id) ON DELETE CASCADE,
  network text NOT NULL,
  label text NOT NULL,
  href text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT team_member_socials_network_check CHECK (network IN ('linkedin', 'instagram', 'x')),
  CONSTRAINT team_member_socials_label_len CHECK (char_length(label) >= 1 AND char_length(label) <= 64),
  CONSTRAINT team_member_socials_href_len CHECK (char_length(href) >= 1 AND char_length(href) <= 2048)
);

CREATE INDEX team_member_socials_team_member_id_idx ON team_member_socials (team_member_id);

-- ---------------------------------------------------------------------------
-- Client delivery
-- ---------------------------------------------------------------------------

CREATE TABLE projects (
  id uuid PRIMARY KEY DEFAULT uuidv7(),
  client_id uuid NOT NULL REFERENCES clients (id) ON DELETE RESTRICT,
  service_id uuid NOT NULL REFERENCES services (id) ON DELETE RESTRICT,
  title text NOT NULL,
  status_code text NOT NULL REFERENCES project_statuses (code) ON DELETE RESTRICT,
  notes text NOT NULL DEFAULT '',
  manager_employee_id uuid REFERENCES employees (id) ON DELETE SET NULL,
  next_milestone text NOT NULL DEFAULT '',
  next_milestone_date date,
  progress smallint NOT NULL DEFAULT 0,
  version integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  archived_at timestamptz,
  CONSTRAINT projects_title_len CHECK (char_length(title) >= 1 AND char_length(title) <= 200),
  CONSTRAINT projects_notes_len CHECK (char_length(notes) <= 10000),
  CONSTRAINT projects_next_milestone_len CHECK (char_length(next_milestone) <= 500),
  CONSTRAINT projects_progress_check CHECK (progress >= 0 AND progress <= 100),
  CONSTRAINT projects_version_pos CHECK (version >= 1)
);

CREATE INDEX projects_client_id_active_idx ON projects (client_id) WHERE archived_at IS NULL;
CREATE INDEX projects_service_id_idx ON projects (service_id);
CREATE INDEX projects_status_code_active_idx ON projects (status_code) WHERE archived_at IS NULL;

CREATE TABLE invoices (
  id uuid PRIMARY KEY DEFAULT uuidv7(),
  client_id uuid NOT NULL REFERENCES clients (id) ON DELETE RESTRICT,
  number text NOT NULL,
  title text NOT NULL,
  amount numeric(14, 2) NOT NULL,
  currency char(3) NOT NULL,
  status_code text NOT NULL REFERENCES invoice_statuses (code) ON DELETE RESTRICT,
  due_date date,
  issued_on date,
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
CREATE INDEX invoices_client_id_active_idx ON invoices (client_id) WHERE archived_at IS NULL;

CREATE TABLE messages (
  id uuid PRIMARY KEY DEFAULT uuidv7(),
  client_id uuid NOT NULL REFERENCES clients (id) ON DELETE RESTRICT,
  sender_role text NOT NULL,
  sender_user_id uuid NOT NULL REFERENCES users (id) ON DELETE RESTRICT,
  body text NOT NULL,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  archived_at timestamptz,
  CONSTRAINT messages_sender_role_check CHECK (sender_role IN ('admin', 'client', 'employee')),
  CONSTRAINT messages_body_len CHECK (char_length(body) >= 1 AND char_length(body) <= 20000)
);

CREATE INDEX messages_client_id_created_at_idx ON messages (client_id, created_at, id) WHERE archived_at IS NULL;

CREATE TABLE files (
  id uuid PRIMARY KEY DEFAULT uuidv7(),
  client_id uuid NOT NULL REFERENCES clients (id) ON DELETE RESTRICT,
  original_name text NOT NULL,
  storage_key text NOT NULL,
  content_type text NOT NULL,
  size_bytes bigint NOT NULL,
  checksum_sha256 text NOT NULL,
  kind text NOT NULL DEFAULT '',
  uploaded_by_user_id uuid NOT NULL REFERENCES users (id) ON DELETE RESTRICT,
  uploaded_by_role text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  archived_at timestamptz,
  CONSTRAINT files_original_name_len CHECK (char_length(original_name) >= 1 AND char_length(original_name) <= 500),
  CONSTRAINT files_storage_key_len CHECK (char_length(storage_key) >= 1 AND char_length(storage_key) <= 1024),
  CONSTRAINT files_content_type_len CHECK (char_length(content_type) >= 1 AND char_length(content_type) <= 255),
  CONSTRAINT files_size_bytes_nonneg CHECK (size_bytes >= 0),
  CONSTRAINT files_checksum_sha256_len CHECK (char_length(checksum_sha256) = 64),
  CONSTRAINT files_kind_len CHECK (char_length(kind) <= 64),
  CONSTRAINT files_uploaded_by_role_check CHECK (uploaded_by_role IN ('admin', 'client', 'employee')),
  CONSTRAINT files_storage_key_key UNIQUE (storage_key)
);

CREATE UNIQUE INDEX files_client_id_name_active_key
  ON files (client_id, original_name) WHERE archived_at IS NULL;
CREATE INDEX files_client_id_active_idx ON files (client_id) WHERE archived_at IS NULL;

-- ---------------------------------------------------------------------------
-- Sales
-- ---------------------------------------------------------------------------

CREATE TABLE carriers (
  id uuid PRIMARY KEY DEFAULT uuidv7(),
  us_dot text NOT NULL,
  mc text NOT NULL,
  legal_name text NOT NULL,
  dba text NOT NULL DEFAULT '',
  business_address text NOT NULL DEFAULT '',
  owner_operator_driver text NOT NULL DEFAULT '',
  tax_id_ciphertext bytea NOT NULL,
  business_telephone text NOT NULL DEFAULT '',
  version integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  archived_at timestamptz,
  CONSTRAINT carriers_us_dot_len CHECK (char_length(us_dot) >= 1 AND char_length(us_dot) <= 32),
  CONSTRAINT carriers_mc_len CHECK (char_length(mc) >= 1 AND char_length(mc) <= 32),
  CONSTRAINT carriers_legal_name_len CHECK (char_length(legal_name) >= 1 AND char_length(legal_name) <= 300),
  CONSTRAINT carriers_dba_len CHECK (char_length(dba) <= 300),
  CONSTRAINT carriers_business_address_len CHECK (char_length(business_address) <= 500),
  CONSTRAINT carriers_owner_len CHECK (char_length(owner_operator_driver) <= 200),
  CONSTRAINT carriers_phone_len CHECK (char_length(business_telephone) <= 64),
  CONSTRAINT carriers_version_pos CHECK (version >= 1)
);

CREATE UNIQUE INDEX carriers_us_dot_active_key ON carriers (us_dot) WHERE archived_at IS NULL;
CREATE UNIQUE INDEX carriers_mc_active_key ON carriers (mc) WHERE archived_at IS NULL;

CREATE TABLE parties (
  id uuid PRIMARY KEY DEFAULT uuidv7(),
  kind text NOT NULL,
  name text NOT NULL,
  phone text NOT NULL DEFAULT '',
  street text NOT NULL DEFAULT '',
  city_state_zip text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  version integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  archived_at timestamptz,
  CONSTRAINT parties_kind_check CHECK (kind IN ('insurance', 'factoring')),
  CONSTRAINT parties_name_len CHECK (char_length(name) >= 1 AND char_length(name) <= 300),
  CONSTRAINT parties_phone_len CHECK (char_length(phone) <= 64),
  CONSTRAINT parties_street_len CHECK (char_length(street) <= 300),
  CONSTRAINT parties_city_state_zip_len CHECK (char_length(city_state_zip) <= 200),
  CONSTRAINT parties_email_len CHECK (char_length(email) <= 320),
  CONSTRAINT parties_version_pos CHECK (version >= 1)
);

CREATE TABLE sales (
  id uuid PRIMARY KEY DEFAULT uuidv7(),
  carrier_id uuid NOT NULL REFERENCES carriers (id) ON DELETE RESTRICT,
  rep_id uuid NOT NULL REFERENCES employees (id) ON DELETE RESTRICT,
  status_code text NOT NULL REFERENCES sale_statuses (code) ON DELETE RESTRICT,
  amount numeric(14, 2) NOT NULL,
  currency char(3) NOT NULL,
  truck_type text NOT NULL DEFAULT '',
  contact_name text NOT NULL DEFAULT '',
  contact_phone text NOT NULL DEFAULT '',
  contact_email text NOT NULL DEFAULT '',
  truck text NOT NULL DEFAULT '',
  trailer text NOT NULL DEFAULT '',
  insurance_party_id uuid REFERENCES parties (id) ON DELETE SET NULL,
  factoring_party_id uuid REFERENCES parties (id) ON DELETE SET NULL,
  approved_by_user_id uuid REFERENCES users (id) ON DELETE SET NULL,
  version integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  archived_at timestamptz,
  CONSTRAINT sales_amount_nonneg CHECK (amount >= 0),
  CONSTRAINT sales_currency_check CHECK (currency ~ '^[A-Z]{3}$'),
  CONSTRAINT sales_truck_type_len CHECK (char_length(truck_type) <= 128),
  CONSTRAINT sales_contact_name_len CHECK (char_length(contact_name) <= 200),
  CONSTRAINT sales_contact_phone_len CHECK (char_length(contact_phone) <= 64),
  CONSTRAINT sales_contact_email_len CHECK (char_length(contact_email) <= 320),
  CONSTRAINT sales_truck_len CHECK (char_length(truck) <= 200),
  CONSTRAINT sales_trailer_len CHECK (char_length(trailer) <= 200),
  CONSTRAINT sales_version_pos CHECK (version >= 1)
);

CREATE INDEX sales_carrier_id_idx ON sales (carrier_id);
CREATE INDEX sales_rep_id_active_idx ON sales (rep_id, id) WHERE archived_at IS NULL;
CREATE INDEX sales_status_code_active_idx ON sales (status_code) WHERE archived_at IS NULL;

CREATE TABLE leads (
  id uuid PRIMARY KEY DEFAULT uuidv7(),
  rep_id uuid NOT NULL REFERENCES employees (id) ON DELETE RESTRICT,
  company text NOT NULL,
  contact_name text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  source text NOT NULL DEFAULT '',
  status_code text NOT NULL REFERENCES lead_statuses (code) ON DELETE RESTRICT,
  notes text NOT NULL DEFAULT '',
  version integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  archived_at timestamptz,
  CONSTRAINT leads_company_len CHECK (char_length(company) >= 1 AND char_length(company) <= 300),
  CONSTRAINT leads_contact_name_len CHECK (char_length(contact_name) <= 200),
  CONSTRAINT leads_phone_len CHECK (char_length(phone) <= 64),
  CONSTRAINT leads_email_len CHECK (char_length(email) <= 320),
  CONSTRAINT leads_source_len CHECK (char_length(source) <= 128),
  CONSTRAINT leads_notes_len CHECK (char_length(notes) <= 10000),
  CONSTRAINT leads_version_pos CHECK (version >= 1)
);

CREATE INDEX leads_rep_id_active_idx ON leads (rep_id, id) WHERE archived_at IS NULL;

CREATE TABLE lead_follow_ups (
  id uuid PRIMARY KEY DEFAULT uuidv7(),
  lead_id uuid NOT NULL REFERENCES leads (id) ON DELETE CASCADE,
  occurred_at timestamptz NOT NULL,
  note text NOT NULL DEFAULT '',
  outcome text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT lead_follow_ups_note_len CHECK (char_length(note) <= 10000),
  CONSTRAINT lead_follow_ups_outcome_len CHECK (char_length(outcome) <= 500)
);

CREATE INDEX lead_follow_ups_lead_id_idx ON lead_follow_ups (lead_id, occurred_at);

CREATE TABLE sales_messages (
  id uuid PRIMARY KEY DEFAULT uuidv7(),
  from_rep_id uuid NOT NULL REFERENCES employees (id) ON DELETE RESTRICT,
  to_rep_id uuid NOT NULL REFERENCES employees (id) ON DELETE RESTRICT,
  body text NOT NULL,
  sent_at timestamptz NOT NULL DEFAULT now(),
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT sales_messages_body_len CHECK (char_length(body) >= 1 AND char_length(body) <= 20000)
);

CREATE INDEX sales_messages_to_rep_id_idx ON sales_messages (to_rep_id, sent_at);

CREATE TABLE tax_id_access_audit (
  id uuid PRIMARY KEY DEFAULT uuidv7(),
  carrier_id uuid,
  carrier_us_dot text NOT NULL,
  carrier_mc text NOT NULL,
  carrier_legal_name text NOT NULL,
  viewer_user_id uuid NOT NULL,
  viewer_role text NOT NULL,
  viewer_email text NOT NULL,
  viewed_at timestamptz NOT NULL DEFAULT now(),
  correlation_id text NOT NULL,
  CONSTRAINT tax_id_access_audit_us_dot_len CHECK (char_length(carrier_us_dot) >= 1 AND char_length(carrier_us_dot) <= 32),
  CONSTRAINT tax_id_access_audit_mc_len CHECK (char_length(carrier_mc) >= 1 AND char_length(carrier_mc) <= 32),
  CONSTRAINT tax_id_access_audit_legal_name_len CHECK (char_length(carrier_legal_name) >= 1 AND char_length(carrier_legal_name) <= 300),
  CONSTRAINT tax_id_access_audit_viewer_role_check CHECK (viewer_role IN ('admin', 'client', 'employee')),
  CONSTRAINT tax_id_access_audit_viewer_email_len CHECK (char_length(viewer_email) >= 3 AND char_length(viewer_email) <= 320),
  CONSTRAINT tax_id_access_audit_correlation_id_len CHECK (char_length(correlation_id) >= 1 AND char_length(correlation_id) <= 128)
);

CREATE INDEX tax_id_access_audit_viewed_at_idx ON tax_id_access_audit (viewed_at);
CREATE INDEX tax_id_access_audit_viewer_user_id_idx ON tax_id_access_audit (viewer_user_id);

-- ---------------------------------------------------------------------------
-- Inbound
-- ---------------------------------------------------------------------------

CREATE TABLE callbacks (
  id uuid PRIMARY KEY DEFAULT uuidv7(),
  name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL DEFAULT '',
  note text NOT NULL DEFAULT '',
  status_code text NOT NULL REFERENCES callback_statuses (code) ON DELETE RESTRICT,
  version integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  archived_at timestamptz,
  CONSTRAINT callbacks_name_len CHECK (char_length(name) >= 1 AND char_length(name) <= 200),
  CONSTRAINT callbacks_email_len CHECK (char_length(email) >= 3 AND char_length(email) <= 320),
  CONSTRAINT callbacks_phone_len CHECK (char_length(phone) <= 64),
  CONSTRAINT callbacks_note_len CHECK (char_length(note) <= 5000),
  CONSTRAINT callbacks_version_pos CHECK (version >= 1)
);

CREATE TABLE contact_messages (
  id uuid PRIMARY KEY DEFAULT uuidv7(),
  name text NOT NULL,
  email text NOT NULL,
  subject text NOT NULL DEFAULT '',
  body text NOT NULL,
  status_code text NOT NULL REFERENCES contact_message_statuses (code) ON DELETE RESTRICT,
  version integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  archived_at timestamptz,
  CONSTRAINT contact_messages_name_len CHECK (char_length(name) >= 1 AND char_length(name) <= 200),
  CONSTRAINT contact_messages_email_len CHECK (char_length(email) >= 3 AND char_length(email) <= 320),
  CONSTRAINT contact_messages_subject_len CHECK (char_length(subject) <= 300),
  CONSTRAINT contact_messages_body_len CHECK (char_length(body) >= 1 AND char_length(body) <= 20000),
  CONSTRAINT contact_messages_version_pos CHECK (version >= 1)
);

-- ---------------------------------------------------------------------------
-- Infrastructure
-- ---------------------------------------------------------------------------

CREATE TABLE schema_migrations (
  version text PRIMARY KEY,
  checksum text NOT NULL,
  applied_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT schema_migrations_version_len CHECK (char_length(version) >= 1 AND char_length(version) <= 128),
  CONSTRAINT schema_migrations_checksum_len CHECK (char_length(checksum) = 64)
);

CREATE TABLE hmac_nonces (
  nonce text PRIMARY KEY,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
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

CREATE INDEX rate_limit_buckets_last_refill_at_idx ON rate_limit_buckets (last_refill_at);

CREATE TABLE idempotency_keys (
  id uuid PRIMARY KEY DEFAULT uuidv7(),
  idempotency_key text NOT NULL,
  method text NOT NULL,
  path text NOT NULL,
  subject_id uuid,
  response_status integer NOT NULL,
  response_body jsonb NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL,
  CONSTRAINT idempotency_keys_key_len CHECK (char_length(idempotency_key) >= 1 AND char_length(idempotency_key) <= 128),
  CONSTRAINT idempotency_keys_method_len CHECK (char_length(method) >= 1 AND char_length(method) <= 16),
  CONSTRAINT idempotency_keys_path_len CHECK (char_length(path) >= 1 AND char_length(path) <= 512),
  CONSTRAINT idempotency_keys_status_check CHECK (response_status >= 100 AND response_status <= 599)
);

CREATE UNIQUE INDEX idempotency_keys_lookup_idx
  ON idempotency_keys (idempotency_key, method, path, subject_id) NULLS NOT DISTINCT;
CREATE INDEX idempotency_keys_expires_at_idx ON idempotency_keys (expires_at);

-- ---------------------------------------------------------------------------
-- Soft-delete active views
-- ---------------------------------------------------------------------------

CREATE VIEW users_active AS SELECT * FROM users WHERE archived_at IS NULL;
CREATE VIEW clients_active AS SELECT * FROM clients WHERE archived_at IS NULL;
CREATE VIEW employees_active AS SELECT * FROM employees WHERE archived_at IS NULL;
CREATE VIEW services_active AS SELECT * FROM services WHERE archived_at IS NULL;
CREATE VIEW portfolio_items_active AS SELECT * FROM portfolio_items WHERE archived_at IS NULL;
CREATE VIEW blog_posts_active AS SELECT * FROM blog_posts WHERE archived_at IS NULL;
CREATE VIEW faqs_active AS SELECT * FROM faqs WHERE archived_at IS NULL;
CREATE VIEW team_members_active AS SELECT * FROM team_members WHERE archived_at IS NULL;
CREATE VIEW projects_active AS SELECT * FROM projects WHERE archived_at IS NULL;
CREATE VIEW invoices_active AS SELECT * FROM invoices WHERE archived_at IS NULL;
CREATE VIEW messages_active AS SELECT * FROM messages WHERE archived_at IS NULL;
CREATE VIEW files_active AS SELECT * FROM files WHERE archived_at IS NULL;
CREATE VIEW carriers_active AS SELECT * FROM carriers WHERE archived_at IS NULL;
CREATE VIEW parties_active AS SELECT * FROM parties WHERE archived_at IS NULL;
CREATE VIEW sales_active AS SELECT * FROM sales WHERE archived_at IS NULL;
CREATE VIEW leads_active AS SELECT * FROM leads WHERE archived_at IS NULL;
CREATE VIEW callbacks_active AS SELECT * FROM callbacks WHERE archived_at IS NULL;
CREATE VIEW contact_messages_active AS SELECT * FROM contact_messages WHERE archived_at IS NULL;

-- ---------------------------------------------------------------------------
-- Privileges
-- ---------------------------------------------------------------------------

REVOKE ALL ON ALL TABLES IN SCHEMA public FROM PUBLIC;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM PUBLIC;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM PUBLIC;

GRANT SELECT, INSERT, UPDATE, DELETE ON schema_migrations TO jz_owner;
GRANT SELECT ON schema_migrations TO jz_app;
GRANT SELECT ON schema_migrations TO jz_readonly;

GRANT SELECT, INSERT, UPDATE, DELETE ON
  client_statuses,
  project_statuses,
  invoice_statuses,
  sale_statuses,
  lead_statuses,
  callback_statuses,
  contact_message_statuses,
  sessions,
  client_employee_assignments,
  team_member_socials,
  lead_follow_ups,
  sales_messages,
  tax_id_access_audit,
  hmac_nonces,
  rate_limit_buckets,
  idempotency_keys
TO jz_app;

GRANT SELECT ON
  client_statuses,
  project_statuses,
  invoice_statuses,
  sale_statuses,
  lead_statuses,
  callback_statuses,
  contact_message_statuses,
  sessions,
  client_employee_assignments,
  team_member_socials,
  lead_follow_ups,
  sales_messages,
  tax_id_access_audit,
  hmac_nonces,
  rate_limit_buckets,
  idempotency_keys
TO jz_readonly;

GRANT INSERT, UPDATE, DELETE ON
  users,
  clients,
  employees,
  services,
  portfolio_items,
  blog_posts,
  faqs,
  team_members,
  projects,
  invoices,
  messages,
  files,
  carriers,
  parties,
  sales,
  leads,
  callbacks,
  contact_messages
TO jz_app;

GRANT SELECT ON
  users_active,
  clients_active,
  employees_active,
  services_active,
  portfolio_items_active,
  blog_posts_active,
  faqs_active,
  team_members_active,
  projects_active,
  invoices_active,
  messages_active,
  files_active,
  carriers_active,
  parties_active,
  sales_active,
  leads_active,
  callbacks_active,
  contact_messages_active
TO jz_app;

GRANT SELECT ON
  users,
  clients,
  employees,
  services,
  portfolio_items,
  blog_posts,
  faqs,
  team_members,
  projects,
  invoices,
  messages,
  files,
  carriers,
  parties,
  sales,
  leads,
  callbacks,
  contact_messages,
  users_active,
  clients_active,
  employees_active,
  services_active,
  portfolio_items_active,
  blog_posts_active,
  faqs_active,
  team_members_active,
  projects_active,
  invoices_active,
  messages_active,
  files_active,
  carriers_active,
  parties_active,
  sales_active,
  leads_active,
  callbacks_active,
  contact_messages_active
TO jz_readonly;

ALTER DEFAULT PRIVILEGES FOR ROLE jz_owner IN SCHEMA public
  REVOKE ALL ON TABLES FROM PUBLIC;

COMMIT;
