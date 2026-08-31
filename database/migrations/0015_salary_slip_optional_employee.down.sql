-- 0015_salary_slip_optional_employee.down.sql
-- Fails if any salary slip has employee_id NULL.
-- Apply as jz_owner.

BEGIN;

DROP INDEX IF EXISTS salary_slips_name_month_active_key;

DROP INDEX IF EXISTS salary_slips_employee_month_active_key;

CREATE UNIQUE INDEX salary_slips_employee_month_active_key
  ON salary_slips (employee_id, salary_month)
  WHERE archived_at IS NULL;

ALTER TABLE salary_slips
  ALTER COLUMN employee_id SET NOT NULL;

COMMIT;
