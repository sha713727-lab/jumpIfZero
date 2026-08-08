import {
  faqArchiveSchema,
  faqCreateSchema,
  faqReorderSchema,
  faqRestoreSchema,
  faqUpdateSchema,
  faqsListResponseSchema,
  listQuerySchema,
  type Actor,
  type FaqRow,
} from "@jumpifzero/contracts";
import { audit } from "../lib/audit.ts";
import { NotFoundError } from "../lib/errors.ts";
import { withTransaction } from "../db/transaction.ts";
import * as faqsRepo from "../repositories/faqs.ts";
import {
  parseInput,
  requireAdmin,
  resolveVersionWrite,
  toDateOrNull,
} from "./_helpers.ts";

function assertPublished(row: FaqRow, publishedOnly: boolean): FaqRow {
  if (publishedOnly && row.published_at === null) {
    throw new NotFoundError("FAQ not found");
  }
  return row;
}

export async function listFaqs(
  input: unknown,
  publishedOnly: boolean,
): Promise<unknown> {
  const query = parseInput(listQuerySchema, input);
  const useSortOrderDefault = query.sort === "updated_at";
  const sort = useSortOrderDefault
    ? "sort_order"
    : query.sort === "title" || query.sort === "slug"
      ? "sort_order"
      : query.sort;
  const dir = useSortOrderDefault ? "asc" : query.dir;
  const result = await faqsRepo.listActiveFaqs({
    limit: query.limit,
    offset: query.offset,
    publishedOnly,
    sort,
    dir,
    ...(query.q !== undefined ? { q: query.q } : {}),
  });
  return faqsListResponseSchema.parse({
    items: result.items,
    total: result.total,
    limit: query.limit,
    offset: query.offset,
  });
}

export async function getFaqById(
  id: string,
  publishedOnly: boolean,
): Promise<FaqRow> {
  const row = await faqsRepo.getActiveFaqById(id);
  if (row === null) {
    throw new NotFoundError("FAQ not found");
  }
  return assertPublished(row, publishedOnly);
}

export async function createFaq(
  actor: Actor,
  input: unknown,
  correlationId: string,
): Promise<FaqRow> {
  requireAdmin(actor);
  const body = parseInput(faqCreateSchema, input);
  const row = await faqsRepo.insertFaq({
    question: body.question,
    answer: body.answer,
    sortOrder: body.sortOrder,
    publishedAt: toDateOrNull(body.publishedAt),
  });
  audit({
    action: "content.faq.create",
    correlationId,
    actorSubjectId: actor.subjectId,
    route: "content.faqs.create",
  });
  return row;
}

export async function updateFaq(
  actor: Actor,
  input: unknown,
  correlationId: string,
): Promise<FaqRow> {
  requireAdmin(actor);
  const body = parseInput(faqUpdateSchema, input);
  const updated = await faqsRepo.updateFaq({
    id: body.id,
    version: body.version,
    question: body.question,
    answer: body.answer,
    sortOrder: body.sortOrder,
    publishedAt: toDateOrNull(body.publishedAt),
  });

  const row = await resolveVersionWrite({
    result: updated,
    lookup: () => faqsRepo.getFaqByIdFromBase(body.id),
    notFoundMessage: "FAQ not found",
    conflictMessage: "FAQ version conflict",
  });
  audit({
    action: "content.faq.update",
    correlationId,
    actorSubjectId: actor.subjectId,
    route: "content.faqs.update",
  });
  return row;
}

export async function reorderFaqs(
  actor: Actor,
  input: unknown,
  correlationId: string,
): Promise<void> {
  requireAdmin(actor);
  const body = parseInput(faqReorderSchema, input);
  const first = body.items[0];
  if (first === undefined) {
    return;
  }

  const reordered = await withTransaction((client) =>
    faqsRepo.reorderFaqs(
      body.items.map((item) => ({
        id: item.id,
        sortOrder: item.sortOrder,
        version: item.version,
      })),
      client,
    ),
  );

  await resolveVersionWrite({
    result: reordered ? true : null,
    lookup: () => faqsRepo.getFaqByIdFromBase(first.id),
    notFoundMessage: "FAQ not found",
    conflictMessage: "FAQ version conflict",
  });
  audit({
    action: "content.faq.reorder",
    correlationId,
    actorSubjectId: actor.subjectId,
    route: "content.faqs.reorder",
  });
}

export async function archiveFaq(
  actor: Actor,
  input: unknown,
  correlationId: string,
): Promise<void> {
  requireAdmin(actor);
  const body = parseInput(faqArchiveSchema, input);
  const archived = await faqsRepo.archiveFaq({
    id: body.id,
    version: body.version,
  });

  await resolveVersionWrite({
    result: archived ? true : null,
    lookup: () => faqsRepo.getFaqByIdFromBase(body.id),
    notFoundMessage: "FAQ not found",
    conflictMessage: "FAQ version conflict",
  });
  audit({
    action: "content.faq.archive",
    correlationId,
    actorSubjectId: actor.subjectId,
    route: "content.faqs.archive",
  });
}

export async function restoreFaq(
  actor: Actor,
  input: unknown,
  correlationId: string,
): Promise<FaqRow> {
  requireAdmin(actor);
  const body = parseInput(faqRestoreSchema, input);
  const restored = await faqsRepo.restoreFaq({
    id: body.id,
    version: body.version,
  });
  const row = await resolveVersionWrite({
    result: restored,
    lookup: () => faqsRepo.getFaqByIdFromBase(body.id),
    notFoundMessage: "FAQ not found",
    conflictMessage: "FAQ version conflict",
  });
  audit({
    action: "content.faq.restore",
    correlationId,
    actorSubjectId: actor.subjectId,
    route: "content.faqs.restore",
  });
  return row;
}
