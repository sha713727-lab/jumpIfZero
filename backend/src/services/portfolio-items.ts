import {
  listQuerySchema,
  portfolioItemArchiveSchema,
  portfolioItemCreateSchema,
  portfolioItemRestoreSchema,
  portfolioItemUpdateSchema,
  portfolioListResponseSchema,
  type Actor,
  type PortfolioItemRow,
} from "@jumpifzero/contracts";
import { audit } from "../lib/audit.ts";
import { NotFoundError } from "../lib/errors.ts";
import * as portfolioRepo from "../repositories/portfolio-items.ts";
import {
  parseInput,
  requireAdmin,
  resolveVersionWrite,
  toDateOrNull,
} from "./_helpers.ts";

function assertPublished(
  row: PortfolioItemRow,
  publishedOnly: boolean,
): PortfolioItemRow {
  if (publishedOnly && row.published_at === null) {
    throw new NotFoundError("Portfolio item not found");
  }
  return row;
}

export async function listPortfolioItems(
  input: unknown,
  publishedOnly: boolean,
): Promise<unknown> {
  const query = parseInput(listQuerySchema, input);
  const sort =
    query.sort === "sort_order" ? "updated_at" : query.sort;
  const result = await portfolioRepo.listActivePortfolioItems({
    limit: query.limit,
    offset: query.offset,
    publishedOnly,
    sort,
    dir: query.dir,
    ...(query.q !== undefined ? { q: query.q } : {}),
    ...(query.category !== undefined ? { category: query.category } : {}),
  });
  return portfolioListResponseSchema.parse({
    items: result.items,
    total: result.total,
    limit: query.limit,
    offset: query.offset,
  });
}

export async function getPortfolioItemById(
  id: string,
  publishedOnly: boolean,
): Promise<PortfolioItemRow> {
  const row = await portfolioRepo.getActivePortfolioItemById(id);
  if (row === null) {
    throw new NotFoundError("Portfolio item not found");
  }
  return assertPublished(row, publishedOnly);
}

export async function getPortfolioItemBySlug(
  slug: string,
  publishedOnly: boolean,
): Promise<PortfolioItemRow> {
  const row = await portfolioRepo.getActivePortfolioItemBySlug(slug);
  if (row === null) {
    throw new NotFoundError("Portfolio item not found");
  }
  return assertPublished(row, publishedOnly);
}

export async function createPortfolioItem(
  actor: Actor,
  input: unknown,
  correlationId: string,
): Promise<PortfolioItemRow> {
  requireAdmin(actor);
  const body = parseInput(portfolioItemCreateSchema, input);
  const row = await portfolioRepo.insertPortfolioItem({
    title: body.title,
    slug: body.slug,
    category: body.category,
    summary: body.summary,
    imagePath: body.imagePath,
    publishedAt: toDateOrNull(body.publishedAt),
  });
  audit({
    action: "content.portfolio.create",
    correlationId,
    actorSubjectId: actor.subjectId,
    route: "content.portfolio.create",
  });
  return row;
}

export async function updatePortfolioItem(
  actor: Actor,
  input: unknown,
  correlationId: string,
): Promise<PortfolioItemRow> {
  requireAdmin(actor);
  const body = parseInput(portfolioItemUpdateSchema, input);
  const updated = await portfolioRepo.updatePortfolioItem({
    id: body.id,
    version: body.version,
    title: body.title,
    slug: body.slug,
    category: body.category,
    summary: body.summary,
    imagePath: body.imagePath,
    publishedAt: toDateOrNull(body.publishedAt),
  });

  const row = await resolveVersionWrite({
    result: updated,
    lookup: () => portfolioRepo.getPortfolioItemByIdFromBase(body.id),
    notFoundMessage: "Portfolio item not found",
    conflictMessage: "Portfolio item version conflict",
  });
  audit({
    action: "content.portfolio.update",
    correlationId,
    actorSubjectId: actor.subjectId,
    route: "content.portfolio.update",
  });
  return row;
}

export async function archivePortfolioItem(
  actor: Actor,
  input: unknown,
  correlationId: string,
): Promise<void> {
  requireAdmin(actor);
  const body = parseInput(portfolioItemArchiveSchema, input);
  const archived = await portfolioRepo.archivePortfolioItem({
    id: body.id,
    version: body.version,
  });

  await resolveVersionWrite({
    result: archived ? true : null,
    lookup: () => portfolioRepo.getPortfolioItemByIdFromBase(body.id),
    notFoundMessage: "Portfolio item not found",
    conflictMessage: "Portfolio item version conflict",
  });
  audit({
    action: "content.portfolio.archive",
    correlationId,
    actorSubjectId: actor.subjectId,
    route: "content.portfolio.archive",
  });
}

export async function restorePortfolioItem(
  actor: Actor,
  input: unknown,
  correlationId: string,
): Promise<PortfolioItemRow> {
  requireAdmin(actor);
  const body = parseInput(portfolioItemRestoreSchema, input);
  const restored = await portfolioRepo.restorePortfolioItem({
    id: body.id,
    version: body.version,
  });
  const row = await resolveVersionWrite({
    result: restored,
    lookup: () => portfolioRepo.getPortfolioItemByIdFromBase(body.id),
    notFoundMessage: "Portfolio item not found",
    conflictMessage: "Portfolio item version conflict",
  });
  audit({
    action: "content.portfolio.restore",
    correlationId,
    actorSubjectId: actor.subjectId,
    route: "content.portfolio.restore",
  });
  return row;
}
