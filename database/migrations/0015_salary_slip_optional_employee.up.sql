-- 0015_salary_slip_optional_employee.up.sql
-- Allow salary slips for names that are not registered employees.
-- Apply as jz_owner.

BEGIN;

ALTER TABLE salary_slips
  ALTER COLUMN employee_id DROP NOT NULL;

DROP INDEX IF EXISTS salary_slips_employee_month_active_key;

CREATE UNIQUE INDEX salary_slips_employee_month_active_key
  ON salary_slips (employee_id, salary_month)
  WHERE archived_at IS NULL AND employee_id IS NOT NULL;

CREATE UNIQUE INDEX salary_slips_name_month_active_key
  ON salary_slips (lower(employee_name), salary_month)
  WHERE archived_at IS NULL AND employee_id IS NULL;

COMMIT;
