-- 0012_salary_slips.up.sql
-- Admin salary slips for employees.
-- Apply as jz_owner.

BEGIN;

CREATE TABLE salary_slip_statuses (
  code text PRIMARY KEY,
  label text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  CONSTRAINT salary_slip_statuses_code_len CHECK (char_length(code) >= 1 AND char_length(code) <= 64),
  CONSTRAINT salary_slip_statuses_label_len CHECK (char_length(label) >= 1 AND char_length(label) <= 128)
);

INSERT INTO salary_slip_statuses (code, label, sort_order) VALUES
  ('draft', 'Draft', 1),
  ('issued', 'Issued', 2);

CREATE TABLE salary_slips (
  id uuid PRIMARY KEY DEFAULT uuidv7(),
  employee_id uuid NOT NULL REFERENCES employees (id) ON DELETE RESTRICT,
  employee_name text NOT NULL,
  designation text NOT NULL DEFAULT '',
  slip_date date NOT NULL,
  salary_month text NOT NULL,
  basic_salary numeric(14, 2) NOT NULL DEFAULT 0,
  punctuality numeric(14, 2) NOT NULL DEFAULT 0,
  medical_allowance numeric(14, 2) NOT NULL DEFAULT 0,
  incentives numeric(14, 2) NOT NULL DEFAULT 0,
  bonus numeric(14, 2) NOT NULL DEFAULT 0,
  advance numeric(14, 2) NOT NULL DEFAULT 0,
  income_tax numeric(14, 2) NOT NULL DEFAULT 0,
  wh_tax numeric(14, 2) NOT NULL DEFAULT 0,
  fuel_advances numeric(14, 2) NOT NULL DEFAULT 0,
  total_earnings numeric(14, 2) GENERATED ALWAYS AS (
    basic_salary + punctuality + medical_allowance + incentives + bonus
  ) STORED,
  total_deduction numeric(14, 2) GENERATED ALWAYS AS (
    advance + income_tax + wh_tax + fuel_advances
  ) STORED,
  net_salary numeric(14, 2) GENERATED ALWAYS AS (
    (basic_salary + punctuality + medical_allowance + incentives + bonus)
    - (advance + income_tax + wh_tax + fuel_advances)
  ) STORED,
  currency char(3) NOT NULL DEFAULT 'PKR',
  status_code text NOT NULL REFERENCES salary_slip_statuses (code) ON DELETE RESTRICT,
  from_company text NOT NULL DEFAULT '',
  from_email text NOT NULL DEFAULT '',
  from_phone text NOT NULL DEFAULT '',
  version integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  archived_at timestamptz,
  CONSTRAINT salary_slips_employee_name_len CHECK (char_length(employee_name) >= 1 AND char_length(employee_name) <= 200),
  CONSTRAINT salary_slips_designation_len CHECK (char_length(designation) <= 200),
  CONSTRAINT salary_slips_salary_month_len CHECK (char_length(salary_month) >= 1 AND char_length(salary_month) <= 64),
  CONSTRAINT salary_slips_basic_salary_nonneg CHECK (basic_salary >= 0),
  CONSTRAINT salary_slips_punctuality_nonneg CHECK (punctuality >= 0),
  CONSTRAINT salary_slips_medical_allowance_nonneg CHECK (medical_allowance >= 0),
  CONSTRAINT salary_slips_incentives_nonneg CHECK (incentives >= 0),
  CONSTRAINT salary_slips_bonus_nonneg CHECK (bonus >= 0),
  CONSTRAINT salary_slips_advance_nonneg CHECK (advance >= 0),
  CONSTRAINT salary_slips_income_tax_nonneg CHECK (income_tax >= 0),
  CONSTRAINT salary_slips_wh_tax_nonneg CHECK (wh_tax >= 0),
  CONSTRAINT salary_slips_fuel_advances_nonneg CHECK (fuel_advances >= 0),
  CONSTRAINT salary_slips_net_nonneg CHECK (
    (basic_salary + punctuality + medical_allowance + incentives + bonus)
    - (advance + income_tax + wh_tax + fuel_advances) >= 0
  ),
  CONSTRAINT salary_slips_currency_check CHECK (currency ~ '^[A-Z]{3}$'),
  CONSTRAINT salary_slips_from_company_len CHECK (char_length(from_company) <= 200),
  CONSTRAINT salary_slips_from_email_len CHECK (char_length(from_email) <= 320),
  CONSTRAINT salary_slips_from_phone_len CHECK (char_length(from_phone) <= 64),
  CONSTRAINT salary_slips_version_pos CHECK (version >= 1)
);

CREATE UNIQUE INDEX salary_slips_employee_month_active_key
  ON salary_slips (employee_id, salary_month)
  WHERE archived_at IS NULL;

CREATE INDEX salary_slips_employee_id_active_idx
  ON salary_slips (employee_id)
  WHERE archived_at IS NULL;

CREATE INDEX salary_slips_status_code_active_idx
  ON salary_slips (status_code)
  WHERE archived_at IS NULL;

CREATE VIEW salary_slips_active AS
  SELECT * FROM salary_slips WHERE archived_at IS NULL;

GRANT SELECT, INSERT, UPDATE, DELETE ON salary_slip_statuses TO jz_app;
GRANT SELECT ON salary_slip_statuses TO jz_readonly;

GRANT SELECT, INSERT, UPDATE, DELETE ON salary_slips TO jz_app;
GRANT SELECT ON salary_slips TO jz_readonly;

GRANT SELECT ON salary_slips_active TO jz_app;
GRANT SELECT ON salary_slips_active TO jz_readonly;

COMMIT;
