-- 0012_salary_slips.down.sql
-- Apply as jz_owner.

BEGIN;

DROP VIEW IF EXISTS salary_slips_active;
DROP TABLE IF EXISTS salary_slips;
DROP TABLE IF EXISTS salary_slip_statuses;

COMMIT;
