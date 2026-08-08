import {
  siteGalleryImageArchiveSchema,
  siteGalleryImageCreateSchema,
  siteGalleryImageReorderSchema,
  siteGalleryImageRestoreSchema,
  siteGalleryImageUpdateSchema,
  siteGalleryListQuerySchema,
  siteGalleryListResponseSchema,
  type Actor,
  type SiteGalleryImageRow,
} from "@jumpifzero/contracts";
import { audit } from "../lib/audit.ts";
import { NotFoundError } from "../lib/errors.ts";
import { withTransaction } from "../db/transaction.ts";
import * as galleryRepo from "../repositories/site-gallery-images.ts";
import {
  parseInput,
  requireAdmin,
  resolveVersionWrite,
  toDateOrNull,
} from "./_helpers.ts";

function assertPublished(
  row: SiteGalleryImageRow,
  publishedOnly: boolean,
): SiteGalleryImageRow {
  if (publishedOnly && row.published_at === null) {
    throw new NotFoundError("Site gallery image not found");
  }
  return row;
}

export async function listSiteGalleryImages(
  input: unknown,
  publishedOnly: boolean,
): Promise<unknown> {
  const query = parseInput(siteGalleryListQuerySchema, input);
  const useSortOrderDefault = query.sort === "updated_at";
  const sort = useSortOrderDefault
    ? "sort_order"
    : query.sort === "title" || query.sort === "slug"
      ? "sort_order"
      : query.sort;
  const dir = useSortOrderDefault ? "asc" : query.dir;
  const result = await galleryRepo.listActiveSiteGalleryImages({
    limit: query.limit,
    offset: query.offset,
    publishedOnly,
    sort,
    dir,
    ...(query.q !== undefined ? { q: query.q } : {}),
    ...(query.sectionKey !== undefined ? { sectionKey: query.sectionKey } : {}),
  });
  return siteGalleryListResponseSchema.parse({
    items: result.items,
    total: result.total,
    limit: query.limit,
    offset: query.offset,
  });
}

export async function getSiteGalleryImageById(
  id: string,
  publishedOnly: boolean,
): Promise<SiteGalleryImageRow> {
  const row = await galleryRepo.getActiveSiteGalleryImageById(id);
  if (row === null) {
    throw new NotFoundError("Site gallery image not found");
  }
  return assertPublished(row, publishedOnly);
}

export async function createSiteGalleryImage(
  actor: Actor,
  input: unknown,
  correlationId: string,
): Promise<SiteGalleryImageRow> {
  requireAdmin(actor);
  const body = parseInput(siteGalleryImageCreateSchema, input);
  const row = await galleryRepo.insertSiteGalleryImage({
    sectionKey: body.sectionKey,
    imagePath: body.imagePath,
    altText: body.altText,
    sortOrder: body.sortOrder,
    publishedAt: toDateOrNull(body.publishedAt),
  });
  audit({
    action: "content.site_gallery.create",
    correlationId,
    actorSubjectId: actor.subjectId,
    route: "content.site-gallery.create",
  });
  return row;
}

export async function updateSiteGalleryImage(
  actor: Actor,
  input: unknown,
  correlationId: string,
): Promise<SiteGalleryImageRow> {
  requireAdmin(actor);
  const body = parseInput(siteGalleryImageUpdateSchema, input);
  const updated = await galleryRepo.updateSiteGalleryImage({
    id: body.id,
    version: body.version,
    sectionKey: body.sectionKey,
    imagePath: body.imagePath,
    altText: body.altText,
    sortOrder: body.sortOrder,
    publishedAt: toDateOrNull(body.publishedAt),
  });

  const row = await resolveVersionWrite({
    result: updated,
    lookup: () => galleryRepo.getSiteGalleryImageByIdFromBase(body.id),
    notFoundMessage: "Site gallery image not found",
    conflictMessage: "Site gallery image version conflict",
  });
  audit({
    action: "content.site_gallery.update",
    correlationId,
    actorSubjectId: actor.subjectId,
    route: "content.site-gallery.update",
  });
  return row;
}

export async function reorderSiteGalleryImages(
  actor: Actor,
  input: unknown,
  correlationId: string,
): Promise<void> {
  requireAdmin(actor);
  const body = parseInput(siteGalleryImageReorderSchema, input);
  const first = body.items[0];
  if (first === undefined) {
    return;
  }

  const reordered = await withTransaction((client) =>
    galleryRepo.reorderSiteGalleryImages(
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
    lookup: () => galleryRepo.getSiteGalleryImageByIdFromBase(first.id),
    notFoundMessage: "Site gallery image not found",
    conflictMessage: "Site gallery image version conflict",
  });
  audit({
    action: "content.site_gallery.reorder",
    correlationId,
    actorSubjectId: actor.subjectId,
    route: "content.site-gallery.reorder",
  });
}

export async function archiveSiteGalleryImage(
  actor: Actor,
  input: unknown,
  correlationId: string,
): Promise<void> {
  requireAdmin(actor);
  const body = parseInput(siteGalleryImageArchiveSchema, input);
  const archived = await galleryRepo.archiveSiteGalleryImage({
    id: body.id,
    version: body.version,
  });

  await resolveVersionWrite({
    result: archived ? true : null,
    lookup: () => galleryRepo.getSiteGalleryImageByIdFromBase(body.id),
    notFoundMessage: "Site gallery image not found",
    conflictMessage: "Site gallery image version conflict",
  });
  audit({
    action: "content.site_gallery.archive",
    correlationId,
    actorSubjectId: actor.subjectId,
    route: "content.site-gallery.archive",
  });
}

export async function restoreSiteGalleryImage(
  actor: Actor,
  input: unknown,
  correlationId: string,
): Promise<SiteGalleryImageRow> {
  requireAdmin(actor);
  const body = parseInput(siteGalleryImageRestoreSchema, input);
  const restored = await galleryRepo.restoreSiteGalleryImage({
    id: body.id,
    version: body.version,
  });
  const row = await resolveVersionWrite({
    result: restored,
    lookup: () => galleryRepo.getSiteGalleryImageByIdFromBase(body.id),
    notFoundMessage: "Site gallery image not found",
    conflictMessage: "Site gallery image version conflict",
  });
  audit({
    action: "content.site_gallery.restore",
    correlationId,
    actorSubjectId: actor.subjectId,
    route: "content.site-gallery.restore",
  });
  return row;
}
