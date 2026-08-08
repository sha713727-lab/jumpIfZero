-- 0003_password_reset_tokens.down.sql
-- Reverse of 0003. Apply as jz_owner.

BEGIN;

DROP TABLE IF EXISTS password_reset_tokens;

COMMIT;
