import {
  contactMessageArchiveSchema,
  contactMessageCreateSchema,
  contactMessageRestoreSchema,
  contactMessageUpdateSchema,
  contactMessagesListQuerySchema,
  contactMessagesListResponseSchema,
  type Actor,
  type ContactMessageRow,
} from "@jumpifzero/contracts";
import { audit } from "../lib/audit.ts";
import { NotFoundError } from "../lib/errors.ts";
import * as contactMessagesRepo from "../repositories/contact-messages.ts";
import { parseInput, requireAdmin, resolveVersionWrite } from "./_helpers.ts";

export async function createContactMessage(
  input: unknown,
  correlationId: string,
): Promise<ContactMessageRow> {
  const body = parseInput(contactMessageCreateSchema, input);
  const row = await contactMessagesRepo.insertContactMessage({
    name: body.name,
    email: body.email,
    subject: body.subject,
    body: body.body,
  });
  audit({
    action: "inbox.contactMessage.create",
    correlationId,
    actorSubjectId: "gateway",
    route: "content.contactMessages.create",
  });
  return row;
}

export async function listContactMessages(
  actor: Actor,
  input: unknown,
): Promise<unknown> {
  requireAdmin(actor);
  const query = parseInput(contactMessagesListQuerySchema, input);
  const result = await contactMessagesRepo.listActiveContactMessages({
    limit: query.limit,
    offset: query.offset,
    sort: query.sort,
    dir: query.dir,
    ...(query.q !== undefined ? { q: query.q } : {}),
    ...(query.status !== undefined ? { status: query.status } : {}),
  });
  return contactMessagesListResponseSchema.parse({
    items: result.items,
    total: result.total,
    limit: query.limit,
    offset: query.offset,
  });
}

export async function getContactMessageById(
  actor: Actor,
  id: string,
): Promise<ContactMessageRow> {
  requireAdmin(actor);
  const row = await contactMessagesRepo.getActiveContactMessageById(id);
  if (row === null) {
    throw new NotFoundError("Contact message not found");
  }
  return row;
}

export async function updateContactMessageStatus(
  actor: Actor,
  input: unknown,
  correlationId: string,
): Promise<ContactMessageRow> {
  requireAdmin(actor);
  const body = parseInput(contactMessageUpdateSchema, input);
  const updated = await contactMessagesRepo.updateContactMessageStatus({
    id: body.id,
    version: body.version,
    status: body.status,
  });
  const row = await resolveVersionWrite({
    result: updated,
    lookup: () => contactMessagesRepo.getContactMessageByIdFromBase(body.id),
    notFoundMessage: "Contact message not found",
    conflictMessage: "Contact message version conflict",
  });
  audit({
    action: "inbox.contactMessage.status",
    correlationId,
    actorSubjectId: actor.subjectId,
    route: "content.contactMessages.update",
  });
  return row;
}

export async function archiveContactMessage(
  actor: Actor,
  input: unknown,
  correlationId: string,
): Promise<void> {
  requireAdmin(actor);
  const body = parseInput(contactMessageArchiveSchema, input);
  const archived = await contactMessagesRepo.archiveContactMessage({
    id: body.id,
    version: body.version,
  });
  await resolveVersionWrite({
    result: archived ? true : null,
    lookup: () => contactMessagesRepo.getContactMessageByIdFromBase(body.id),
    notFoundMessage: "Contact message not found",
    conflictMessage: "Contact message version conflict",
  });
  audit({
    action: "inbox.contactMessage.archive",
    correlationId,
    actorSubjectId: actor.subjectId,
    route: "content.contactMessages.archive",
  });
}

export async function restoreContactMessage(
  actor: Actor,
  input: unknown,
  correlationId: string,
): Promise<ContactMessageRow> {
  requireAdmin(actor);
  const body = parseInput(contactMessageRestoreSchema, input);
  const restored = await contactMessagesRepo.restoreContactMessage({
    id: body.id,
    version: body.version,
  });
  const row = await resolveVersionWrite({
    result: restored,
    lookup: () => contactMessagesRepo.getContactMessageByIdFromBase(body.id),
    notFoundMessage: "Contact message not found",
    conflictMessage: "Contact message version conflict",
  });
  audit({
    action: "inbox.contactMessage.restore",
    correlationId,
    actorSubjectId: actor.subjectId,
    route: "content.contactMessages.restore",
  });
  return row;
}
