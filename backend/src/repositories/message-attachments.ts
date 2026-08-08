import { z } from "@jumpifzero/contracts";
import type { DbQueryable } from "../db/query.ts";
import { query } from "../db/query.ts";

const attachmentRowSchema = z.object({
  message_id: z.uuid(),
  file_id: z.uuid(),
  original_name: z.string().min(1).max(500),
  content_type: z.string().min(1).max(255),
  size_bytes: z.coerce.number().int().min(0),
});

export type MessageAttachmentJoined = {
  readonly messageId: string;
  readonly fileId: string;
  readonly originalName: string;
  readonly contentType: string;
  readonly sizeBytes: number;
};

export async function insertMessageAttachments(
  input: {
    readonly messageId: string;
    readonly fileIds: readonly string[];
  },
  client?: DbQueryable,
): Promise<void> {
  if (input.fileIds.length === 0) {
    return;
  }
  const values: string[] = [];
  const params: unknown[] = [input.messageId];
  for (const fileId of input.fileIds) {
    params.push(fileId);
    values.push(`($1, $${params.length})`);
  }
  await query(
    `
      INSERT INTO message_attachments (message_id, file_id)
      VALUES ${values.join(", ")}
    `,
    params,
    client,
  );
}

export async function listAttachmentsForMessages(
  messageIds: readonly string[],
  client?: DbQueryable,
): Promise<readonly MessageAttachmentJoined[]> {
  if (messageIds.length === 0) {
    return [];
  }
  const result = await query(
    `
      SELECT
        ma.message_id,
        ma.file_id,
        f.original_name,
        f.content_type,
        f.size_bytes
      FROM message_attachments ma
      INNER JOIN files f ON f.id = ma.file_id
      WHERE ma.message_id = ANY($1::uuid[])
      ORDER BY ma.created_at ASC, ma.file_id ASC
    `,
    [messageIds],
    client,
  );
  return result.rows.map((row) => {
    const parsed = attachmentRowSchema.parse(row);
    return {
      messageId: parsed.message_id,
      fileId: parsed.file_id,
      originalName: parsed.original_name,
      contentType: parsed.content_type,
      sizeBytes: parsed.size_bytes,
    };
  });
}
