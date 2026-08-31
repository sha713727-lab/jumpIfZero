-- 0016_salary_slip_unpaid_days.down.sql
-- Apply as jz_owner.

BEGIN;

ALTER TABLE salary_slips
  DROP CONSTRAINT IF EXISTS salary_slips_net_nonneg;

ALTER TABLE salary_slips
  DROP COLUMN IF EXISTS net_salary,
  DROP COLUMN IF EXISTS total_deduction;

ALTER TABLE salary_slips
  DROP CONSTRAINT IF EXISTS salary_slips_unpaid_days_nonneg;

ALTER TABLE salary_slips
  DROP COLUMN IF EXISTS unpaid_days;

ALTER TABLE salary_slips
  ADD COLUMN total_deduction numeric(14, 2) GENERATED ALWAYS AS (
    advance + income_tax + wh_tax + fuel_advances
  ) STORED;

ALTER TABLE salary_slips
  ADD COLUMN net_salary numeric(14, 2) GENERATED ALWAYS AS (
    (basic_salary + punctuality + medical_allowance + incentives + bonus)
    - (advance + income_tax + wh_tax + fuel_advances)
  ) STORED;

ALTER TABLE salary_slips
  ADD CONSTRAINT salary_slips_net_nonneg CHECK (
    (basic_salary + punctuality + medical_allowance + incentives + bonus)
    - (advance + income_tax + wh_tax + fuel_advances) >= 0
  );

COMMIT;
