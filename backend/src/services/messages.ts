import {
  messageCreateSchema,
  messageIdSchema,
  messagePublicSchema,
  messagesListQuerySchema,
  messagesListResponseSchema,
  type Actor,
  type MessagePublic,
  type MessageRow,
} from "@jumpifzero/contracts";
import { BadRequestError, NotFoundError } from "../lib/errors.ts";
import { withTransaction } from "../db/transaction.ts";
import * as clientsRepo from "../repositories/clients.ts";
import * as filesRepo from "../repositories/files.ts";
import * as messageAttachmentsRepo from "../repositories/message-attachments.ts";
import * as messagesRepo from "../repositories/messages.ts";
import {
  accessibleClientIds,
  assertCanAccessClient,
} from "./access.ts";
import { parseInput } from "./_helpers.ts";

function attachmentsFor(
  messageId: string,
  rows: readonly messageAttachmentsRepo.MessageAttachmentJoined[],
): MessagePublic["attachments"] {
  return rows
    .filter((row) => row.messageId === messageId)
    .map((row) => ({
      fileId: row.fileId,
      originalName: row.originalName,
      contentType: row.contentType,
      sizeBytes: row.sizeBytes,
    }));
}

function toPublic(
  row: MessageRow,
  attachmentRows: readonly messageAttachmentsRepo.MessageAttachmentJoined[],
): MessagePublic {
  return messagePublicSchema.parse({
    id: row.id,
    clientId: row.client_id,
    senderRole: row.sender_role,
    senderUserId: row.sender_user_id,
    body: row.body,
    attachments: attachmentsFor(row.id, attachmentRows),
    readAt: row.read_at === null ? null : row.read_at.toISOString(),
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
    archivedAt:
      row.archived_at === null ? null : row.archived_at.toISOString(),
  });
}

function senderRole(
  actor: Actor,
): "admin" | "client" | "employee" {
  if (actor.role === "admin") {
    return "admin";
  }
  if (actor.role === "client") {
    return "client";
  }
  return "employee";
}

async function loadAttachments(
  messageIds: readonly string[],
): Promise<readonly messageAttachmentsRepo.MessageAttachmentJoined[]> {
  return messageAttachmentsRepo.listAttachmentsForMessages(messageIds);
}

export async function listMessages(
  actor: Actor,
  input: unknown,
): Promise<unknown> {
  const query = parseInput(messagesListQuerySchema, input);
  await assertCanAccessClient(actor, query.clientId);
  const clientIds = await accessibleClientIds(actor);
  const result = await messagesRepo.listMessages({
    limit: query.limit,
    offset: query.offset,
    clientId: query.clientId,
    ...(query.q !== undefined ? { q: query.q } : {}),
    archived: query.archived,
    sort: query.sort,
    dir: query.dir,
    clientIds,
  });
  const attachmentRows = await loadAttachments(result.items.map((row) => row.id));
  return messagesListResponseSchema.parse({
    items: result.items.map((row) => toPublic(row, attachmentRows)),
    total: result.total,
    limit: query.limit,
    offset: query.offset,
  });
}

export async function getMessage(
  actor: Actor,
  id: string,
): Promise<MessagePublic> {
  const row = await messagesRepo.getMessageById(id);
  if (row === null || (actor.role !== "admin" && row.archived_at !== null)) {
    throw new NotFoundError("Message not found");
  }
  await assertCanAccessClient(actor, row.client_id);
  const attachmentRows = await loadAttachments([row.id]);
  return toPublic(row, attachmentRows);
}

export async function createMessage(
  actor: Actor,
  input: unknown,
): Promise<MessagePublic> {
  const body = parseInput(messageCreateSchema, input);
  await assertCanAccessClient(actor, body.clientId);
  const client = await clientsRepo.getActiveClientById(body.clientId);
  if (client === null) {
    throw new NotFoundError("Client not found");
  }

  const uniqueFileIds = [...new Set(body.fileIds)];
  if (uniqueFileIds.length !== body.fileIds.length) {
    throw new BadRequestError("Duplicate fileIds");
  }

  return withTransaction(async (tx) => {
    for (const fileId of uniqueFileIds) {
      const file = await filesRepo.getFileById(fileId, tx);
      if (
        file === null ||
        file.archived_at !== null ||
        file.client_id !== body.clientId
      ) {
        throw new BadRequestError("Invalid attachment file");
      }
    }

    const row = await messagesRepo.insertMessage(
      {
        clientId: body.clientId,
        senderRole: senderRole(actor),
        senderUserId: actor.subjectId,
        body: body.body,
      },
      tx,
    );
    await messageAttachmentsRepo.insertMessageAttachments(
      { messageId: row.id, fileIds: uniqueFileIds },
      tx,
    );
    const attachmentRows =
      await messageAttachmentsRepo.listAttachmentsForMessages([row.id], tx);
    return toPublic(row, attachmentRows);
  });
}

export async function markMessageRead(
  actor: Actor,
  id: string,
): Promise<MessagePublic> {
  parseInput(messageIdSchema, { id });
  const existing = await messagesRepo.getMessageById(id);
  if (existing === null || existing.archived_at !== null) {
    throw new NotFoundError("Message not found");
  }
  await assertCanAccessClient(actor, existing.client_id);
  const row = await messagesRepo.markMessageRead(id);
  if (row === null) {
    throw new NotFoundError("Message not found");
  }
  const attachmentRows = await loadAttachments([row.id]);
  return toPublic(row, attachmentRows);
}

export async function archiveMessage(
  actor: Actor,
  id: string,
): Promise<MessagePublic> {
  parseInput(messageIdSchema, { id });
  const existing = await messagesRepo.getMessageById(id);
  if (existing === null) {
    throw new NotFoundError("Message not found");
  }
  await assertCanAccessClient(actor, existing.client_id);
  const row = await messagesRepo.archiveMessage(id);
  if (row === null) {
    throw new NotFoundError("Message not found");
  }
  const attachmentRows = await loadAttachments([row.id]);
  return toPublic(row, attachmentRows);
}

export async function restoreMessage(
  actor: Actor,
  id: string,
): Promise<MessagePublic> {
  parseInput(messageIdSchema, { id });
  const existing = await messagesRepo.getMessageById(id);
  if (existing === null) {
    throw new NotFoundError("Message not found");
  }
  await assertCanAccessClient(actor, existing.client_id);
  const row = await messagesRepo.restoreMessage(id);
  if (row === null) {
    throw new NotFoundError("Message not found");
  }
  const attachmentRows = await loadAttachments([row.id]);
  return toPublic(row, attachmentRows);
}
