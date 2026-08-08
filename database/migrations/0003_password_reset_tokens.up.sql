-- 0003_password_reset_tokens.up.sql
-- Password reset token infrastructure (hash-only storage).
-- Apply as jz_owner.

BEGIN;

CREATE TABLE password_reset_tokens (
  id uuid PRIMARY KEY DEFAULT uuidv7(),
  user_id uuid NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  token_hash text NOT NULL,
  expires_at timestamptz NOT NULL,
  used_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT password_reset_tokens_token_hash_len CHECK (
    char_length(token_hash) >= 32 AND char_length(token_hash) <= 128
  ),
  CONSTRAINT password_reset_tokens_token_hash_key UNIQUE (token_hash)
);

CREATE INDEX password_reset_tokens_user_id_idx ON password_reset_tokens (user_id);
CREATE INDEX password_reset_tokens_expires_at_idx ON password_reset_tokens (expires_at);

GRANT SELECT, INSERT, UPDATE, DELETE ON password_reset_tokens TO jz_app;
GRANT SELECT ON password_reset_tokens TO jz_readonly;

COMMIT;
