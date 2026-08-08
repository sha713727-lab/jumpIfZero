import {
  listQuerySchema,
  siteTestimonialArchiveSchema,
  siteTestimonialCreateSchema,
  siteTestimonialReorderSchema,
  siteTestimonialRestoreSchema,
  siteTestimonialUpdateSchema,
  siteTestimonialsListResponseSchema,
  type Actor,
  type SiteTestimonialRow,
} from "@jumpifzero/contracts";
import { audit } from "../lib/audit.ts";
import { NotFoundError } from "../lib/errors.ts";
import { withTransaction } from "../db/transaction.ts";
import * as testimonialsRepo from "../repositories/site-testimonials.ts";
import {
  parseInput,
  requireAdmin,
  resolveVersionWrite,
  toDateOrNull,
} from "./_helpers.ts";

function assertPublished(
  row: SiteTestimonialRow,
  publishedOnly: boolean,
): SiteTestimonialRow {
  if (publishedOnly && row.published_at === null) {
    throw new NotFoundError("Site testimonial not found");
  }
  return row;
}

export async function listSiteTestimonials(
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
  const result = await testimonialsRepo.listActiveSiteTestimonials({
    limit: query.limit,
    offset: query.offset,
    publishedOnly,
    sort,
    dir,
    ...(query.q !== undefined ? { q: query.q } : {}),
  });
  return siteTestimonialsListResponseSchema.parse({
    items: result.items,
    total: result.total,
    limit: query.limit,
    offset: query.offset,
  });
}

export async function getSiteTestimonialById(
  id: string,
  publishedOnly: boolean,
): Promise<SiteTestimonialRow> {
  const row = await testimonialsRepo.getActiveSiteTestimonialById(id);
  if (row === null) {
    throw new NotFoundError("Site testimonial not found");
  }
  return assertPublished(row, publishedOnly);
}

export async function createSiteTestimonial(
  actor: Actor,
  input: unknown,
  correlationId: string,
): Promise<SiteTestimonialRow> {
  requireAdmin(actor);
  const body = parseInput(siteTestimonialCreateSchema, input);
  const row = await testimonialsRepo.insertSiteTestimonial({
    quote: body.quote,
    authorName: body.authorName,
    roleTitle: body.roleTitle,
    company: body.company,
    accent: body.accent,
    imagePath: body.imagePath,
    sortOrder: body.sortOrder,
    publishedAt: toDateOrNull(body.publishedAt),
  });
  audit({
    action: "content.site_testimonials.create",
    correlationId,
    actorSubjectId: actor.subjectId,
    route: "content.site-testimonials.create",
  });
  return row;
}

export async function updateSiteTestimonial(
  actor: Actor,
  input: unknown,
  correlationId: string,
): Promise<SiteTestimonialRow> {
  requireAdmin(actor);
  const body = parseInput(siteTestimonialUpdateSchema, input);
  const updated = await testimonialsRepo.updateSiteTestimonial({
    id: body.id,
    version: body.version,
    quote: body.quote,
    authorName: body.authorName,
    roleTitle: body.roleTitle,
    company: body.company,
    accent: body.accent,
    imagePath: body.imagePath,
    sortOrder: body.sortOrder,
    publishedAt: toDateOrNull(body.publishedAt),
  });

  const row = await resolveVersionWrite({
    result: updated,
    lookup: () => testimonialsRepo.getSiteTestimonialByIdFromBase(body.id),
    notFoundMessage: "Site testimonial not found",
    conflictMessage: "Site testimonial version conflict",
  });
  audit({
    action: "content.site_testimonials.update",
    correlationId,
    actorSubjectId: actor.subjectId,
    route: "content.site-testimonials.update",
  });
  return row;
}

export async function reorderSiteTestimonials(
  actor: Actor,
  input: unknown,
  correlationId: string,
): Promise<void> {
  requireAdmin(actor);
  const body = parseInput(siteTestimonialReorderSchema, input);
  const first = body.items[0];
  if (first === undefined) {
    return;
  }

  const reordered = await withTransaction((client) =>
    testimonialsRepo.reorderSiteTestimonials(
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
    lookup: () => testimonialsRepo.getSiteTestimonialByIdFromBase(first.id),
    notFoundMessage: "Site testimonial not found",
    conflictMessage: "Site testimonial version conflict",
  });
  audit({
    action: "content.site_testimonials.reorder",
    correlationId,
    actorSubjectId: actor.subjectId,
    route: "content.site-testimonials.reorder",
  });
}

export async function archiveSiteTestimonial(
  actor: Actor,
  input: unknown,
  correlationId: string,
): Promise<void> {
  requireAdmin(actor);
  const body = parseInput(siteTestimonialArchiveSchema, input);
  const archived = await testimonialsRepo.archiveSiteTestimonial({
    id: body.id,
    version: body.version,
  });

  await resolveVersionWrite({
    result: archived ? true : null,
    lookup: () => testimonialsRepo.getSiteTestimonialByIdFromBase(body.id),
    notFoundMessage: "Site testimonial not found",
    conflictMessage: "Site testimonial version conflict",
  });
  audit({
    action: "content.site_testimonials.archive",
    correlationId,
    actorSubjectId: actor.subjectId,
    route: "content.site-testimonials.archive",
  });
}

export async function restoreSiteTestimonial(
  actor: Actor,
  input: unknown,
  correlationId: string,
): Promise<SiteTestimonialRow> {
  requireAdmin(actor);
  const body = parseInput(siteTestimonialRestoreSchema, input);
  const restored = await testimonialsRepo.restoreSiteTestimonial({
    id: body.id,
    version: body.version,
  });
  const row = await resolveVersionWrite({
    result: restored,
    lookup: () => testimonialsRepo.getSiteTestimonialByIdFromBase(body.id),
    notFoundMessage: "Site testimonial not found",
    conflictMessage: "Site testimonial version conflict",
  });
  audit({
    action: "content.site_testimonials.restore",
    correlationId,
    actorSubjectId: actor.subjectId,
    route: "content.site-testimonials.restore",
  });
  return row;
}
