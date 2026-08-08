-- Reverse of 0007. Apply as jz_owner.

BEGIN;

DROP TABLE IF EXISTS message_attachments;

ALTER TABLE messages
  DROP CONSTRAINT messages_body_len;

ALTER TABLE messages
  ADD CONSTRAINT messages_body_len
  CHECK (char_length(body) >= 1 AND char_length(body) <= 20000);

COMMIT;
