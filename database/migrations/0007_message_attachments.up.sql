-- 0007_message_attachments.up.sql
-- Message ↔ file attachments; allow empty body when attachments are present.
-- Apply as jz_owner.

BEGIN;

ALTER TABLE messages
  DROP CONSTRAINT messages_body_len;

ALTER TABLE messages
  ADD CONSTRAINT messages_body_len
  CHECK (char_length(body) <= 20000);

CREATE TABLE message_attachments (
  message_id uuid NOT NULL REFERENCES messages (id) ON DELETE CASCADE,
  file_id uuid NOT NULL REFERENCES files (id) ON DELETE RESTRICT,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (message_id, file_id)
);

CREATE INDEX message_attachments_file_id_idx ON message_attachments (file_id);

GRANT SELECT, INSERT, DELETE ON message_attachments TO jz_app;
GRANT SELECT ON message_attachments TO jz_readonly;

COMMIT;
