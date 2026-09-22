import {
  servicePageBenefitRowSchema,
  servicePageBuildItemRowSchema,
  servicePageCapabilityRowSchema,
  servicePageComparisonPointRowSchema,
  servicePageFaqRowSchema,
  servicePageOfferingRowSchema,
  servicePageProblemRowSchema,
  servicePageProcessStepRowSchema,
  servicePageRelatedRowSchema,
  servicePageRowSchema,
  servicePageTechnologyRowSchema,
  type ServicePageBenefitRow,
  type ServicePageBuildItemRow,
  type ServicePageCapabilityRow,
  type ServicePageComparisonPointRow,
  type ServicePageFaqRow,
  type ServicePageOfferingRow,
  type ServicePageProblemRow,
  type ServicePageProcessStepRow,
  type ServicePageRelatedRow,
  type ServicePageRow,
  type ServicePageTechCategory,
  type ServicePageTechnologyRow,
  z,
} from "@jumpifzero/contracts";
import type { DbQueryable } from "../db/query.ts";
import { query } from "../db/query.ts";
import { pool } from "../db/pool.ts";
import { InternalError } from "../lib/errors.ts";
import { parseRow } from "./_parse.ts";
import { nextUuidv7 } from "./_write.ts";

export const servicePageCollectionSchema = z.enum([
  "offerings",
  "build-items",
  "process-steps",
  "technologies",
  "benefits",
  "faqs",
  "capabilities",
  "problems",
  "comparison-points",
  "related",
]);

export type ServicePageCollection = z.infer<typeof servicePageCollectionSchema>;

export type ServicePageChildRow =
  | ServicePageOfferingRow
  | ServicePageBuildItemRow
  | ServicePageProcessStepRow
  | ServicePageTechnologyRow
  | ServicePageBenefitRow
  | ServicePageFaqRow
  | ServicePageCapabilityRow
  | ServicePageProblemRow
  | ServicePageComparisonPointRow
  | ServicePageRelatedRow;

export type ServicePageRelatedSummary = {
  readonly id: string;
  readonly sortOrder: number;
  readonly page: {
    readonly id: string;
    readonly slug: string;
    readonly title: string;
    readonly navLabel: string;
    readonly heroDescription: string;
    readonly heroImagePath: string;
    readonly sortOrder: number;
    readonly href: string;
  };
};

const PAGE_COLUMNS = `
  id, parent_id, sort_order, slug, title, nav_label,
  meta_title, meta_description,
  og_title, og_description, og_image_path,
  hero_eyebrow, hero_h1, hero_description,
  hero_primary_cta_label, hero_primary_cta_href,
  hero_secondary_cta_label, hero_secondary_cta_href,
  hero_image_path, intro_heading, intro_body,
  offerings_heading, build_heading, process_heading,
  technologies_heading, benefits_heading, benefits_intro,
  capabilities_heading, capabilities_intro,
  problems_heading, problems_intro,
  comparison_heading, comparison_body,
  faqs_heading, cta_heading, cta_body, cta_label, cta_href,
  published_at, version, created_at, updated_at
`;

const OFFERING_COLUMNS = `
  id, service_page_id, title, description, cta_label, cta_href,
  image_path, sort_order, published_at, version, created_at, updated_at
`;

const BUILD_ITEM_COLUMNS = `
  id, service_page_id, label, sort_order, published_at, version,
  created_at, updated_at
`;

const PROCESS_STEP_COLUMNS = `
  id, service_page_id, step_number, title, body, sort_order,
  published_at, version, created_at, updated_at
`;

const TECHNOLOGY_COLUMNS = `
  id, service_page_id, category, name, sort_order, published_at,
  version, created_at, updated_at
`;

const BENEFIT_COLUMNS = `
  id, service_page_id, title, body, sort_order, published_at,
  version, created_at, updated_at
`;

const FAQ_COLUMNS = `
  id, service_page_id, question, answer, sort_order, published_at,
  version, created_at, updated_at
`;

const TITLED_CHILD_COLUMNS = `
  id, service_page_id, title, body, sort_order, published_at,
  version, created_at, updated_at
`;

const RELATED_COLUMNS = `
  id, service_page_id, related_service_page_id, sort_order,
  published_at, version, created_at, updated_at
`;

type CollectionMeta = {
  readonly table: string;
  readonly activeView: string;
  readonly columns: string;
  readonly parse: (row: unknown) => ServicePageChildRow;
};

const COLLECTION_META: Record<ServicePageCollection, CollectionMeta> = {
  offerings: {
    table: "service_page_offerings",
    activeView: "service_page_offerings_active",
    columns: OFFERING_COLUMNS,
    parse: (row) => parseRow(servicePageOfferingRowSchema, row),
  },
  "build-items": {
    table: "service_page_build_items",
    activeView: "service_page_build_items_active",
    columns: BUILD_ITEM_COLUMNS,
    parse: (row) => parseRow(servicePageBuildItemRowSchema, row),
  },
  "process-steps": {
    table: "service_page_process_steps",
    activeView: "service_page_process_steps_active",
    columns: PROCESS_STEP_COLUMNS,
    parse: (row) => parseRow(servicePageProcessStepRowSchema, row),
  },
  technologies: {
    table: "service_page_technologies",
    activeView: "service_page_technologies_active",
    columns: TECHNOLOGY_COLUMNS,
    parse: (row) => parseRow(servicePageTechnologyRowSchema, row),
  },
  benefits: {
    table: "service_page_benefits",
    activeView: "service_page_benefits_active",
    columns: BENEFIT_COLUMNS,
    parse: (row) => parseRow(servicePageBenefitRowSchema, row),
  },
  faqs: {
    table: "service_page_faqs",
    activeView: "service_page_faqs_active",
    columns: FAQ_COLUMNS,
    parse: (row) => parseRow(servicePageFaqRowSchema, row),
  },
  capabilities: {
    table: "service_page_capabilities",
    activeView: "service_page_capabilities_active",
    columns: TITLED_CHILD_COLUMNS,
    parse: (row) => parseRow(servicePageCapabilityRowSchema, row),
  },
  problems: {
    table: "service_page_problems",
    activeView: "service_page_problems_active",
    columns: TITLED_CHILD_COLUMNS,
    parse: (row) => parseRow(servicePageProblemRowSchema, row),
  },
  "comparison-points": {
    table: "service_page_comparison_points",
    activeView: "service_page_comparison_points_active",
    columns: TITLED_CHILD_COLUMNS,
    parse: (row) => parseRow(servicePageComparisonPointRowSchema, row),
  },
  related: {
    table: "service_page_related",
    activeView: "service_page_related_active",
    columns: RELATED_COLUMNS,
    parse: (row) => parseRow(servicePageRelatedRowSchema, row),
  },
};

export type ServicePageUpdateInput = {
  readonly id: string;
  readonly version: number;
  readonly title: string;
  readonly navLabel: string;
  readonly metaTitle: string;
  readonly metaDescription: string;
  readonly ogTitle: string;
  readonly ogDescription: string;
  readonly ogImagePath: string;
  readonly heroEyebrow: string;
  readonly heroH1: string;
  readonly heroDescription: string;
  readonly heroPrimaryCtaLabel: string;
  readonly heroPrimaryCtaHref: string;
  readonly heroSecondaryCtaLabel: string;
  readonly heroSecondaryCtaHref: string;
  readonly heroImagePath: string;
  readonly introHeading: string;
  readonly introBody: string;
  readonly offeringsHeading: string;
  readonly buildHeading: string;
  readonly processHeading: string;
  readonly technologiesHeading: string;
  readonly benefitsHeading: string;
  readonly benefitsIntro: string;
  readonly capabilitiesHeading: string;
  readonly capabilitiesIntro: string;
  readonly problemsHeading: string;
  readonly problemsIntro: string;
  readonly comparisonHeading: string;
  readonly comparisonBody: string;
  readonly faqsHeading: string;
  readonly ctaHeading: string;
  readonly ctaBody: string;
  readonly ctaLabel: string;
  readonly ctaHref: string;
  readonly sortOrder: number;
  readonly publishedAt: Date | null;
};

export type ServicePageOfferingInsert = {
  readonly servicePageId: string;
  readonly title: string;
  readonly description: string;
  readonly ctaLabel: string;
  readonly ctaHref: string;
  readonly imagePath: string;
  readonly sortOrder: number;
  readonly publishedAt: Date | null;
};

export type ServicePageOfferingUpdate = ServicePageOfferingInsert & {
  readonly id: string;
  readonly version: number;
};

export type ServicePageBuildItemInsert = {
  readonly servicePageId: string;
  readonly label: string;
  readonly sortOrder: number;
  readonly publishedAt: Date | null;
};

export type ServicePageBuildItemUpdate = ServicePageBuildItemInsert & {
  readonly id: string;
  readonly version: number;
};

export type ServicePageProcessStepInsert = {
  readonly servicePageId: string;
  readonly stepNumber: number;
  readonly title: string;
  readonly body: string;
  readonly sortOrder: number;
  readonly publishedAt: Date | null;
};

export type ServicePageProcessStepUpdate = ServicePageProcessStepInsert & {
  readonly id: string;
  readonly version: number;
};

export type ServicePageTechnologyInsert = {
  readonly servicePageId: string;
  readonly category: ServicePageTechCategory;
  readonly name: string;
  readonly sortOrder: number;
  readonly publishedAt: Date | null;
};

export type ServicePageTechnologyUpdate = ServicePageTechnologyInsert & {
  readonly id: string;
  readonly version: number;
};

export type ServicePageBenefitInsert = {
  readonly servicePageId: string;
  readonly title: string;
  readonly body: string;
  readonly sortOrder: number;
  readonly publishedAt: Date | null;
};

export type ServicePageBenefitUpdate = ServicePageBenefitInsert & {
  readonly id: string;
  readonly version: number;
};

export type ServicePageFaqInsert = {
  readonly servicePageId: string;
  readonly question: string;
  readonly answer: string;
  readonly sortOrder: number;
  readonly publishedAt: Date | null;
};

export type ServicePageFaqUpdate = ServicePageFaqInsert & {
  readonly id: string;
  readonly version: number;
};

export type ServicePageTitledChildInsert = {
  readonly servicePageId: string;
  readonly title: string;
  readonly body: string;
  readonly sortOrder: number;
  readonly publishedAt: Date | null;
};

export type ServicePageTitledChildUpdate = ServicePageTitledChildInsert & {
  readonly id: string;
  readonly version: number;
};

export type ServicePageRelatedInsert = {
  readonly servicePageId: string;
  readonly relatedServicePageId: string;
  readonly sortOrder: number;
  readonly publishedAt: Date | null;
};

export type ServicePageRelatedUpdate = ServicePageRelatedInsert & {
  readonly id: string;
  readonly version: number;
};

export type ServicePageChildReorderItem = {
  readonly id: string;
  readonly sortOrder: number;
  readonly version: number;
};

function pageHref(slug: string, parentSlug: string | null): string {
  if (parentSlug === null) {
    return `/services/${slug}`;
  }
  return `/services/${parentSlug}/${slug}`;
}

function sortColumn(
  sort: "created_at" | "updated_at" | "title" | "slug" | "published_at",
): string {
  switch (sort) {
    case "title":
      return "title";
    case "slug":
      return "slug";
    case "published_at":
      return "published_at";
    case "created_at":
      return "created_at";
    default:
      return "updated_at";
  }
}

async function getActiveByIdWithClient(
  id: string,
  client: DbQueryable,
): Promise<ServicePageRow> {
  const result = await query(
    `
      SELECT ${PAGE_COLUMNS}
      FROM service_pages_active
      WHERE id = $1
      LIMIT 1
    `,
    [id],
    client,
  );

  const row = result.rows[0];
  if (row === undefined) {
    throw new InternalError("Service page not visible after write");
  }

  return parseRow(servicePageRowSchema, row);
}

async function getActiveChildByIdWithClient<T>(
  collection: ServicePageCollection,
  id: string,
  servicePageId: string,
  schema: { parse: (input: unknown) => T },
  client: DbQueryable,
): Promise<T> {
  const meta = COLLECTION_META[collection];
  const result = await query(
    `
      SELECT ${meta.columns}
      FROM ${meta.activeView}
      WHERE id = $1
        AND service_page_id = $2
      LIMIT 1
    `,
    [id, servicePageId],
    client,
  );

  const row = result.rows[0];
  if (row === undefined) {
    throw new InternalError("Service page child not visible after write");
  }

  return parseRow(schema, row);
}

export async function listActiveServicePages(input: {
  readonly limit: number;
  readonly offset: number;
  readonly q?: string;
  readonly publishedOnly: boolean;
  readonly sort: "created_at" | "updated_at" | "title" | "slug" | "published_at";
  readonly dir: "asc" | "desc";
}): Promise<{
  readonly items: readonly ServicePageRow[];
  readonly total: number;
}> {
  const column = sortColumn(input.sort);
  const dir = input.dir === "asc" ? "ASC" : "DESC";
  const params: unknown[] = [];
  const where: string[] = [];

  if (input.publishedOnly) {
    where.push("published_at IS NOT NULL");
  }
  if (input.q !== undefined && input.q.length > 0) {
    params.push(`%${input.q}%`);
    where.push(
      `(title ILIKE $${params.length} OR slug ILIKE $${params.length} OR nav_label ILIKE $${params.length})`,
    );
  }

  const whereSql = where.length > 0 ? `WHERE ${where.join(" AND ")}` : "";
  params.push(input.limit);
  const limitIdx = params.length;
  params.push(input.offset);
  const offsetIdx = params.length;

  const result = await query(
    `
      SELECT ${PAGE_COLUMNS}, COUNT(*) OVER()::int AS total_count
      FROM service_pages_active
      ${whereSql}
      ORDER BY ${column} ${dir}, id ASC
      LIMIT $${limitIdx}
      OFFSET $${offsetIdx}
    `,
    params,
  );

  const total =
    result.rows.length === 0
      ? 0
      : Number((result.rows[0] as { total_count: number }).total_count);

  return {
    items: result.rows.map((row) => parseRow(servicePageRowSchema, row)),
    total,
  };
}

export async function getActiveById(
  id: string,
): Promise<ServicePageRow | null> {
  const result = await query(
    `
      SELECT ${PAGE_COLUMNS}
      FROM service_pages_active
      WHERE id = $1
      LIMIT 1
    `,
    [id],
  );

  const row = result.rows[0];
  if (row === undefined) {
    return null;
  }

  return parseRow(servicePageRowSchema, row);
}

export async function getActiveBySlug(
  slug: string,
): Promise<ServicePageRow | null> {
  const result = await query(
    `
      SELECT ${PAGE_COLUMNS}
      FROM service_pages_active
      WHERE slug = $1
      LIMIT 1
    `,
    [slug],
  );

  const row = result.rows[0];
  if (row === undefined) {
    return null;
  }

  return parseRow(servicePageRowSchema, row);
}

export async function getByParentSlugAndChildSlug(
  parentSlug: string,
  childSlug: string,
): Promise<ServicePageRow | null> {
  const result = await query(
    `
      SELECT
        child.id, child.parent_id, child.sort_order, child.slug, child.title,
        child.nav_label, child.meta_title, child.meta_description,
        child.og_title, child.og_description, child.og_image_path,
        child.hero_eyebrow, child.hero_h1, child.hero_description,
        child.hero_primary_cta_label, child.hero_primary_cta_href,
        child.hero_secondary_cta_label, child.hero_secondary_cta_href,
        child.hero_image_path, child.intro_heading, child.intro_body,
        child.offerings_heading, child.build_heading, child.process_heading,
        child.technologies_heading, child.benefits_heading, child.benefits_intro,
        child.capabilities_heading, child.capabilities_intro,
        child.problems_heading, child.problems_intro,
        child.comparison_heading, child.comparison_body,
        child.faqs_heading, child.cta_heading, child.cta_body,
        child.cta_label, child.cta_href,
        child.published_at, child.version, child.created_at, child.updated_at
      FROM service_pages_active AS child
      INNER JOIN service_pages_active AS parent
        ON parent.id = child.parent_id
      WHERE parent.slug = $1
        AND child.slug = $2
      LIMIT 1
    `,
    [parentSlug, childSlug],
  );

  const row = result.rows[0];
  if (row === undefined) {
    return null;
  }

  return parseRow(servicePageRowSchema, row);
}

export async function listChildPagesByParentId(
  parentId: string,
  publishedOnly: boolean,
): Promise<readonly ServicePageRow[]> {
  const params: unknown[] = [parentId];
  let publishedSql = "";
  if (publishedOnly) {
    publishedSql = "AND published_at IS NOT NULL";
  }

  const result = await query(
    `
      SELECT ${PAGE_COLUMNS}
      FROM service_pages_active
      WHERE parent_id = $1
        ${publishedSql}
      ORDER BY sort_order ASC, id ASC
    `,
    params,
  );

  return result.rows.map((row) => parseRow(servicePageRowSchema, row));
}

export async function listRelatedSummaries(
  pageId: string,
  publishedOnly: boolean,
): Promise<readonly ServicePageRelatedSummary[]> {
  const params: unknown[] = [pageId];
  let publishedSql = "";
  if (publishedOnly) {
    publishedSql = `
      AND r.published_at IS NOT NULL
      AND related_page.published_at IS NOT NULL
    `;
  }

  const result = await query(
    `
      SELECT
        r.id AS related_id,
        r.sort_order AS related_sort_order,
        related_page.id AS page_id,
        related_page.slug AS page_slug,
        related_page.title AS page_title,
        related_page.nav_label AS page_nav_label,
        related_page.hero_description AS page_hero_description,
        related_page.hero_image_path AS page_hero_image_path,
        related_page.sort_order AS page_sort_order,
        parent.slug AS parent_slug
      FROM service_page_related_active AS r
      INNER JOIN service_pages_active AS related_page
        ON related_page.id = r.related_service_page_id
      LEFT JOIN service_pages_active AS parent
        ON parent.id = related_page.parent_id
      WHERE r.service_page_id = $1
        ${publishedSql}
      ORDER BY r.sort_order ASC, r.id ASC
    `,
    params,
  );

  return result.rows.map((raw) => {
    const row = raw as {
      related_id: string;
      related_sort_order: number;
      page_id: string;
      page_slug: string;
      page_title: string;
      page_nav_label: string;
      page_hero_description: string;
      page_hero_image_path: string;
      page_sort_order: number;
      parent_slug: string | null;
    };
    return {
      id: row.related_id,
      sortOrder: row.related_sort_order,
      page: {
        id: row.page_id,
        slug: row.page_slug,
        title: row.page_title,
        navLabel: row.page_nav_label,
        heroDescription: row.page_hero_description,
        heroImagePath: row.page_hero_image_path,
        sortOrder: row.page_sort_order,
        href: pageHref(row.page_slug, row.parent_slug),
      },
    };
  });
}

export async function updateServicePage(
  input: ServicePageUpdateInput,
  client: DbQueryable = pool,
): Promise<ServicePageRow | null> {
  const result = await query(
    `
      UPDATE service_pages
      SET
        title = $3,
        nav_label = $4,
        meta_title = $5,
        meta_description = $6,
        og_title = $7,
        og_description = $8,
        og_image_path = $9,
        hero_eyebrow = $10,
        hero_h1 = $11,
        hero_description = $12,
        hero_primary_cta_label = $13,
        hero_primary_cta_href = $14,
        hero_secondary_cta_label = $15,
        hero_secondary_cta_href = $16,
        hero_image_path = $17,
        intro_heading = $18,
        intro_body = $19,
        offerings_heading = $20,
        build_heading = $21,
        process_heading = $22,
        technologies_heading = $23,
        benefits_heading = $24,
        benefits_intro = $25,
        capabilities_heading = $26,
        capabilities_intro = $27,
        problems_heading = $28,
        problems_intro = $29,
        comparison_heading = $30,
        comparison_body = $31,
        faqs_heading = $32,
        cta_heading = $33,
        cta_body = $34,
        cta_label = $35,
        cta_href = $36,
        sort_order = $37,
        published_at = $38,
        version = version + 1,
        updated_at = now()
      WHERE id = $1
        AND version = $2
        AND archived_at IS NULL
    `,
    [
      input.id,
      input.version,
      input.title,
      input.navLabel,
      input.metaTitle,
      input.metaDescription,
      input.ogTitle,
      input.ogDescription,
      input.ogImagePath,
      input.heroEyebrow,
      input.heroH1,
      input.heroDescription,
      input.heroPrimaryCtaLabel,
      input.heroPrimaryCtaHref,
      input.heroSecondaryCtaLabel,
      input.heroSecondaryCtaHref,
      input.heroImagePath,
      input.introHeading,
      input.introBody,
      input.offeringsHeading,
      input.buildHeading,
      input.processHeading,
      input.technologiesHeading,
      input.benefitsHeading,
      input.benefitsIntro,
      input.capabilitiesHeading,
      input.capabilitiesIntro,
      input.problemsHeading,
      input.problemsIntro,
      input.comparisonHeading,
      input.comparisonBody,
      input.faqsHeading,
      input.ctaHeading,
      input.ctaBody,
      input.ctaLabel,
      input.ctaHref,
      input.sortOrder,
      input.publishedAt,
    ],
    client,
  );

  if ((result.rowCount ?? 0) === 0) {
    return null;
  }

  return getActiveByIdWithClient(input.id, client);
}

export async function archiveServicePage(
  input: { readonly id: string; readonly version: number },
  client: DbQueryable = pool,
): Promise<boolean> {
  const result = await query(
    `
      UPDATE service_pages
      SET
        archived_at = now(),
        version = version + 1,
        updated_at = now()
      WHERE id = $1
        AND version = $2
        AND archived_at IS NULL
    `,
    [input.id, input.version],
    client,
  );

  return (result.rowCount ?? 0) > 0;
}

export async function restoreServicePage(
  input: { readonly id: string; readonly version: number },
  client: DbQueryable = pool,
): Promise<ServicePageRow | null> {
  const result = await query(
    `
      UPDATE service_pages
      SET
        archived_at = NULL,
        version = version + 1,
        updated_at = now()
      WHERE id = $1
        AND version = $2
        AND archived_at IS NOT NULL
      RETURNING id
    `,
    [input.id, input.version],
    client,
  );

  const id = (result.rows[0] as { id: string } | undefined)?.id;
  if (id === undefined) {
    return null;
  }

  return getActiveByIdWithClient(id, client);
}

export async function getServicePageByIdFromBase(
  id: string,
  client?: DbQueryable,
): Promise<ServicePageRow | null> {
  const result = await query(
    `
      SELECT ${PAGE_COLUMNS}
      FROM service_pages
      WHERE id = $1
      LIMIT 1
    `,
    [id],
    client,
  );

  const row = result.rows[0];
  if (row === undefined) {
    return null;
  }

  return parseRow(servicePageRowSchema, row);
}

export async function listChildrenByPageId(
  collection: ServicePageCollection,
  pageId: string,
  publishedOnly: boolean,
): Promise<readonly ServicePageChildRow[]> {
  const meta = COLLECTION_META[collection];
  const params: unknown[] = [pageId];
  let publishedSql = "";
  if (publishedOnly) {
    publishedSql = "AND published_at IS NOT NULL";
  }

  const result = await query(
    `
      SELECT ${meta.columns}
      FROM ${meta.activeView}
      WHERE service_page_id = $1
        ${publishedSql}
      ORDER BY sort_order ASC, id ASC
    `,
    params,
  );

  return result.rows.map((row) => meta.parse(row));
}

export async function getChildByIdFromBase(
  collection: ServicePageCollection,
  id: string,
  servicePageId: string,
  client?: DbQueryable,
): Promise<ServicePageChildRow | null> {
  const meta = COLLECTION_META[collection];
  const result = await query(
    `
      SELECT ${meta.columns}
      FROM ${meta.table}
      WHERE id = $1
        AND service_page_id = $2
      LIMIT 1
    `,
    [id, servicePageId],
    client,
  );

  const row = result.rows[0];
  if (row === undefined) {
    return null;
  }

  return meta.parse(row);
}

export async function insertOffering(
  input: ServicePageOfferingInsert,
  client: DbQueryable = pool,
): Promise<ServicePageOfferingRow> {
  const id = await nextUuidv7(client);
  await query(
    `
      INSERT INTO service_page_offerings (
        id, service_page_id, title, description, cta_label, cta_href,
        image_path, sort_order, published_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `,
    [
      id,
      input.servicePageId,
      input.title,
      input.description,
      input.ctaLabel,
      input.ctaHref,
      input.imagePath,
      input.sortOrder,
      input.publishedAt,
    ],
    client,
  );
  return getActiveChildByIdWithClient(
    "offerings",
    id,
    input.servicePageId,
    servicePageOfferingRowSchema,
    client,
  );
}

export async function updateOffering(
  input: ServicePageOfferingUpdate,
  client: DbQueryable = pool,
): Promise<ServicePageOfferingRow | null> {
  const result = await query(
    `
      UPDATE service_page_offerings
      SET
        title = $4,
        description = $5,
        cta_label = $6,
        cta_href = $7,
        image_path = $8,
        sort_order = $9,
        published_at = $10,
        version = version + 1,
        updated_at = now()
      WHERE id = $1
        AND service_page_id = $2
        AND version = $3
        AND archived_at IS NULL
    `,
    [
      input.id,
      input.servicePageId,
      input.version,
      input.title,
      input.description,
      input.ctaLabel,
      input.ctaHref,
      input.imagePath,
      input.sortOrder,
      input.publishedAt,
    ],
    client,
  );

  if ((result.rowCount ?? 0) === 0) {
    return null;
  }

  return getActiveChildByIdWithClient(
    "offerings",
    input.id,
    input.servicePageId,
    servicePageOfferingRowSchema,
    client,
  );
}

export async function insertBuildItem(
  input: ServicePageBuildItemInsert,
  client: DbQueryable = pool,
): Promise<ServicePageBuildItemRow> {
  const id = await nextUuidv7(client);
  await query(
    `
      INSERT INTO service_page_build_items (
        id, service_page_id, label, sort_order, published_at
      )
      VALUES ($1, $2, $3, $4, $5)
    `,
    [
      id,
      input.servicePageId,
      input.label,
      input.sortOrder,
      input.publishedAt,
    ],
    client,
  );
  return getActiveChildByIdWithClient(
    "build-items",
    id,
    input.servicePageId,
    servicePageBuildItemRowSchema,
    client,
  );
}

export async function updateBuildItem(
  input: ServicePageBuildItemUpdate,
  client: DbQueryable = pool,
): Promise<ServicePageBuildItemRow | null> {
  const result = await query(
    `
      UPDATE service_page_build_items
      SET
        label = $4,
        sort_order = $5,
        published_at = $6,
        version = version + 1,
        updated_at = now()
      WHERE id = $1
        AND service_page_id = $2
        AND version = $3
        AND archived_at IS NULL
    `,
    [
      input.id,
      input.servicePageId,
      input.version,
      input.label,
      input.sortOrder,
      input.publishedAt,
    ],
    client,
  );

  if ((result.rowCount ?? 0) === 0) {
    return null;
  }

  return getActiveChildByIdWithClient(
    "build-items",
    input.id,
    input.servicePageId,
    servicePageBuildItemRowSchema,
    client,
  );
}

export async function insertProcessStep(
  input: ServicePageProcessStepInsert,
  client: DbQueryable = pool,
): Promise<ServicePageProcessStepRow> {
  const id = await nextUuidv7(client);
  await query(
    `
      INSERT INTO service_page_process_steps (
        id, service_page_id, step_number, title, body, sort_order, published_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `,
    [
      id,
      input.servicePageId,
      input.stepNumber,
      input.title,
      input.body,
      input.sortOrder,
      input.publishedAt,
    ],
    client,
  );
  return getActiveChildByIdWithClient(
    "process-steps",
    id,
    input.servicePageId,
    servicePageProcessStepRowSchema,
    client,
  );
}

export async function updateProcessStep(
  input: ServicePageProcessStepUpdate,
  client: DbQueryable = pool,
): Promise<ServicePageProcessStepRow | null> {
  const result = await query(
    `
      UPDATE service_page_process_steps
      SET
        step_number = $4,
        title = $5,
        body = $6,
        sort_order = $7,
        published_at = $8,
        version = version + 1,
        updated_at = now()
      WHERE id = $1
        AND service_page_id = $2
        AND version = $3
        AND archived_at IS NULL
    `,
    [
      input.id,
      input.servicePageId,
      input.version,
      input.stepNumber,
      input.title,
      input.body,
      input.sortOrder,
      input.publishedAt,
    ],
    client,
  );

  if ((result.rowCount ?? 0) === 0) {
    return null;
  }

  return getActiveChildByIdWithClient(
    "process-steps",
    input.id,
    input.servicePageId,
    servicePageProcessStepRowSchema,
    client,
  );
}

export async function insertTechnology(
  input: ServicePageTechnologyInsert,
  client: DbQueryable = pool,
): Promise<ServicePageTechnologyRow> {
  const id = await nextUuidv7(client);
  await query(
    `
      INSERT INTO service_page_technologies (
        id, service_page_id, category, name, sort_order, published_at
      )
      VALUES ($1, $2, $3, $4, $5, $6)
    `,
    [
      id,
      input.servicePageId,
      input.category,
      input.name,
      input.sortOrder,
      input.publishedAt,
    ],
    client,
  );
  return getActiveChildByIdWithClient(
    "technologies",
    id,
    input.servicePageId,
    servicePageTechnologyRowSchema,
    client,
  );
}

export async function updateTechnology(
  input: ServicePageTechnologyUpdate,
  client: DbQueryable = pool,
): Promise<ServicePageTechnologyRow | null> {
  const result = await query(
    `
      UPDATE service_page_technologies
      SET
        category = $4,
        name = $5,
        sort_order = $6,
        published_at = $7,
        version = version + 1,
        updated_at = now()
      WHERE id = $1
        AND service_page_id = $2
        AND version = $3
        AND archived_at IS NULL
    `,
    [
      input.id,
      input.servicePageId,
      input.version,
      input.category,
      input.name,
      input.sortOrder,
      input.publishedAt,
    ],
    client,
  );

  if ((result.rowCount ?? 0) === 0) {
    return null;
  }

  return getActiveChildByIdWithClient(
    "technologies",
    input.id,
    input.servicePageId,
    servicePageTechnologyRowSchema,
    client,
  );
}

export async function insertBenefit(
  input: ServicePageBenefitInsert,
  client: DbQueryable = pool,
): Promise<ServicePageBenefitRow> {
  const id = await nextUuidv7(client);
  await query(
    `
      INSERT INTO service_page_benefits (
        id, service_page_id, title, body, sort_order, published_at
      )
      VALUES ($1, $2, $3, $4, $5, $6)
    `,
    [
      id,
      input.servicePageId,
      input.title,
      input.body,
      input.sortOrder,
      input.publishedAt,
    ],
    client,
  );
  return getActiveChildByIdWithClient(
    "benefits",
    id,
    input.servicePageId,
    servicePageBenefitRowSchema,
    client,
  );
}

export async function updateBenefit(
  input: ServicePageBenefitUpdate,
  client: DbQueryable = pool,
): Promise<ServicePageBenefitRow | null> {
  const result = await query(
    `
      UPDATE service_page_benefits
      SET
        title = $4,
        body = $5,
        sort_order = $6,
        published_at = $7,
        version = version + 1,
        updated_at = now()
      WHERE id = $1
        AND service_page_id = $2
        AND version = $3
        AND archived_at IS NULL
    `,
    [
      input.id,
      input.servicePageId,
      input.version,
      input.title,
      input.body,
      input.sortOrder,
      input.publishedAt,
    ],
    client,
  );

  if ((result.rowCount ?? 0) === 0) {
    return null;
  }

  return getActiveChildByIdWithClient(
    "benefits",
    input.id,
    input.servicePageId,
    servicePageBenefitRowSchema,
    client,
  );
}

export async function insertFaq(
  input: ServicePageFaqInsert,
  client: DbQueryable = pool,
): Promise<ServicePageFaqRow> {
  const id = await nextUuidv7(client);
  await query(
    `
      INSERT INTO service_page_faqs (
        id, service_page_id, question, answer, sort_order, published_at
      )
      VALUES ($1, $2, $3, $4, $5, $6)
    `,
    [
      id,
      input.servicePageId,
      input.question,
      input.answer,
      input.sortOrder,
      input.publishedAt,
    ],
    client,
  );
  return getActiveChildByIdWithClient(
    "faqs",
    id,
    input.servicePageId,
    servicePageFaqRowSchema,
    client,
  );
}

export async function updateFaq(
  input: ServicePageFaqUpdate,
  client: DbQueryable = pool,
): Promise<ServicePageFaqRow | null> {
  const result = await query(
    `
      UPDATE service_page_faqs
      SET
        question = $4,
        answer = $5,
        sort_order = $6,
        published_at = $7,
        version = version + 1,
        updated_at = now()
      WHERE id = $1
        AND service_page_id = $2
        AND version = $3
        AND archived_at IS NULL
    `,
    [
      input.id,
      input.servicePageId,
      input.version,
      input.question,
      input.answer,
      input.sortOrder,
      input.publishedAt,
    ],
    client,
  );

  if ((result.rowCount ?? 0) === 0) {
    return null;
  }

  return getActiveChildByIdWithClient(
    "faqs",
    input.id,
    input.servicePageId,
    servicePageFaqRowSchema,
    client,
  );
}

async function insertTitledChild<T>(
  collection: "capabilities" | "problems" | "comparison-points",
  schema: { parse: (input: unknown) => T },
  input: ServicePageTitledChildInsert,
  client: DbQueryable,
): Promise<T> {
  const meta = COLLECTION_META[collection];
  const id = await nextUuidv7(client);
  await query(
    `
      INSERT INTO ${meta.table} (
        id, service_page_id, title, body, sort_order, published_at
      )
      VALUES ($1, $2, $3, $4, $5, $6)
    `,
    [
      id,
      input.servicePageId,
      input.title,
      input.body,
      input.sortOrder,
      input.publishedAt,
    ],
    client,
  );
  return getActiveChildByIdWithClient(
    collection,
    id,
    input.servicePageId,
    schema,
    client,
  );
}

async function updateTitledChild<T>(
  collection: "capabilities" | "problems" | "comparison-points",
  schema: { parse: (input: unknown) => T },
  input: ServicePageTitledChildUpdate,
  client: DbQueryable,
): Promise<T | null> {
  const meta = COLLECTION_META[collection];
  const result = await query(
    `
      UPDATE ${meta.table}
      SET
        title = $4,
        body = $5,
        sort_order = $6,
        published_at = $7,
        version = version + 1,
        updated_at = now()
      WHERE id = $1
        AND service_page_id = $2
        AND version = $3
        AND archived_at IS NULL
    `,
    [
      input.id,
      input.servicePageId,
      input.version,
      input.title,
      input.body,
      input.sortOrder,
      input.publishedAt,
    ],
    client,
  );

  if ((result.rowCount ?? 0) === 0) {
    return null;
  }

  return getActiveChildByIdWithClient(
    collection,
    input.id,
    input.servicePageId,
    schema,
    client,
  );
}

export async function insertCapability(
  input: ServicePageTitledChildInsert,
  client: DbQueryable = pool,
): Promise<ServicePageCapabilityRow> {
  return insertTitledChild(
    "capabilities",
    servicePageCapabilityRowSchema,
    input,
    client,
  );
}

export async function updateCapability(
  input: ServicePageTitledChildUpdate,
  client: DbQueryable = pool,
): Promise<ServicePageCapabilityRow | null> {
  return updateTitledChild(
    "capabilities",
    servicePageCapabilityRowSchema,
    input,
    client,
  );
}

export async function insertProblem(
  input: ServicePageTitledChildInsert,
  client: DbQueryable = pool,
): Promise<ServicePageProblemRow> {
  return insertTitledChild(
    "problems",
    servicePageProblemRowSchema,
    input,
    client,
  );
}

export async function updateProblem(
  input: ServicePageTitledChildUpdate,
  client: DbQueryable = pool,
): Promise<ServicePageProblemRow | null> {
  return updateTitledChild(
    "problems",
    servicePageProblemRowSchema,
    input,
    client,
  );
}

export async function insertComparisonPoint(
  input: ServicePageTitledChildInsert,
  client: DbQueryable = pool,
): Promise<ServicePageComparisonPointRow> {
  return insertTitledChild(
    "comparison-points",
    servicePageComparisonPointRowSchema,
    input,
    client,
  );
}

export async function updateComparisonPoint(
  input: ServicePageTitledChildUpdate,
  client: DbQueryable = pool,
): Promise<ServicePageComparisonPointRow | null> {
  return updateTitledChild(
    "comparison-points",
    servicePageComparisonPointRowSchema,
    input,
    client,
  );
}

export async function insertRelated(
  input: ServicePageRelatedInsert,
  client: DbQueryable = pool,
): Promise<ServicePageRelatedRow> {
  const id = await nextUuidv7(client);
  await query(
    `
      INSERT INTO service_page_related (
        id, service_page_id, related_service_page_id, sort_order, published_at
      )
      VALUES ($1, $2, $3, $4, $5)
    `,
    [
      id,
      input.servicePageId,
      input.relatedServicePageId,
      input.sortOrder,
      input.publishedAt,
    ],
    client,
  );
  return getActiveChildByIdWithClient(
    "related",
    id,
    input.servicePageId,
    servicePageRelatedRowSchema,
    client,
  );
}

export async function updateRelated(
  input: ServicePageRelatedUpdate,
  client: DbQueryable = pool,
): Promise<ServicePageRelatedRow | null> {
  const result = await query(
    `
      UPDATE service_page_related
      SET
        related_service_page_id = $4,
        sort_order = $5,
        published_at = $6,
        version = version + 1,
        updated_at = now()
      WHERE id = $1
        AND service_page_id = $2
        AND version = $3
        AND archived_at IS NULL
    `,
    [
      input.id,
      input.servicePageId,
      input.version,
      input.relatedServicePageId,
      input.sortOrder,
      input.publishedAt,
    ],
    client,
  );

  if ((result.rowCount ?? 0) === 0) {
    return null;
  }

  return getActiveChildByIdWithClient(
    "related",
    input.id,
    input.servicePageId,
    servicePageRelatedRowSchema,
    client,
  );
}

export async function archiveChild(
  collection: ServicePageCollection,
  input: {
    readonly id: string;
    readonly servicePageId: string;
    readonly version: number;
  },
  client: DbQueryable = pool,
): Promise<boolean> {
  const meta = COLLECTION_META[collection];
  const result = await query(
    `
      UPDATE ${meta.table}
      SET
        archived_at = now(),
        version = version + 1,
        updated_at = now()
      WHERE id = $1
        AND service_page_id = $2
        AND version = $3
        AND archived_at IS NULL
    `,
    [input.id, input.servicePageId, input.version],
    client,
  );

  return (result.rowCount ?? 0) > 0;
}

export async function restoreChild(
  collection: ServicePageCollection,
  input: {
    readonly id: string;
    readonly servicePageId: string;
    readonly version: number;
  },
  client: DbQueryable = pool,
): Promise<ServicePageChildRow | null> {
  const meta = COLLECTION_META[collection];
  const result = await query(
    `
      UPDATE ${meta.table}
      SET
        archived_at = NULL,
        version = version + 1,
        updated_at = now()
      WHERE id = $1
        AND service_page_id = $2
        AND version = $3
        AND archived_at IS NOT NULL
      RETURNING id
    `,
    [input.id, input.servicePageId, input.version],
    client,
  );

  const id = (result.rows[0] as { id: string } | undefined)?.id;
  if (id === undefined) {
    return null;
  }

  return getActiveChildByIdWithClient(
    collection,
    id,
    input.servicePageId,
    {
      parse: (row) => COLLECTION_META[collection].parse(row),
    },
    client,
  );
}

export async function reorderChildren(
  collection: ServicePageCollection,
  servicePageId: string,
  items: readonly ServicePageChildReorderItem[],
  client: DbQueryable = pool,
): Promise<boolean> {
  const meta = COLLECTION_META[collection];
  for (const item of items) {
    const result = await query(
      `
        UPDATE ${meta.table}
        SET
          sort_order = $4,
          version = version + 1,
          updated_at = now()
        WHERE id = $1
          AND service_page_id = $2
          AND version = $3
          AND archived_at IS NULL
      `,
      [item.id, servicePageId, item.version, item.sortOrder],
      client,
    );

    if ((result.rowCount ?? 0) === 0) {
      return false;
    }
  }

  return true;
}
