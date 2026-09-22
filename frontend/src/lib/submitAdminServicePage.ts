"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { actorSchema } from "@jumpifzero/contracts/content";
import { BackendRequestError } from "@/lib/backend/client";
import {
  archiveAdminServicePage,
  archiveAdminServicePageChild,
  createAdminServicePageChild,
  getAdminServicePageBySlug,
  listAdminServicePages,
  reorderAdminServicePageChildren,
  restoreAdminServicePage,
  restoreAdminServicePageChild,
  updateAdminServicePage,
  updateAdminServicePageChild,
  type AdminServicePageChild,
  type AdminServicePageDetail,
  type AdminServicePageListItem,
  type ServicePageCollection,
} from "@/lib/data/adminServicePages";
import { requireSession, type SessionPayload } from "@/lib/session";

export type AdminServicePageActionResult =
  | { readonly ok: true; readonly page: AdminServicePageDetail }
  | { readonly ok: true; readonly child: AdminServicePageChild }
  | { readonly ok: true; readonly items: readonly AdminServicePageListItem[] }
  | { readonly ok: true }
  | {
      readonly ok: false;
      readonly reason: "unauthorized" | "conflict" | "validation" | "server";
    };

function actorFromSession(session: SessionPayload) {
  return actorSchema.parse({
    subjectId: session.subjectId,
    role: session.role === "customer" ? "client" : session.role,
    employeeKind: null,
  });
}

function mapBackendError(error: unknown): AdminServicePageActionResult {
  if (error instanceof BackendRequestError) {
    if (error.status === 401 || error.status === 403) {
      return { ok: false, reason: "unauthorized" };
    }
    if (error.status === 409) {
      return { ok: false, reason: "conflict" };
    }
    if (error.status === 400 || error.status === 422) {
      return { ok: false, reason: "validation" };
    }
  }
  return { ok: false, reason: "server" };
}

function revalidateServicePages(slug?: string) {
  revalidateTag("service-pages", "max");
  revalidatePath("/admin/service-pages");
  if (slug) {
    revalidatePath(`/admin/service-pages/${slug}`);
    revalidatePath(`/services/${slug}`);
  }
}

export async function listAdminServicePagesAction(): Promise<AdminServicePageActionResult> {
  try {
    const session = await requireSession("admin");
    const items = await listAdminServicePages(actorFromSession(session));
    return { ok: true, items };
  } catch (error) {
    return mapBackendError(error);
  }
}

export async function getAdminServicePageBySlugAction(
  slug: string,
): Promise<AdminServicePageActionResult> {
  try {
    const session = await requireSession("admin");
    const page = await getAdminServicePageBySlug(
      actorFromSession(session),
      slug,
    );
    return { ok: true, page };
  } catch (error) {
    return mapBackendError(error);
  }
}

export async function updateAdminServicePageAction(input: {
  readonly id: string;
  readonly version: number;
  readonly slug: string;
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
  readonly active: boolean;
  readonly publishedAt: string | null;
}): Promise<AdminServicePageActionResult> {
  try {
    const session = await requireSession("admin");
    const page = await updateAdminServicePage(actorFromSession(session), input);
    revalidateServicePages(input.slug);
    return { ok: true, page };
  } catch (error) {
    return mapBackendError(error);
  }
}

export async function archiveAdminServicePageAction(input: {
  readonly id: string;
  readonly version: number;
  readonly slug: string;
}): Promise<AdminServicePageActionResult> {
  try {
    const session = await requireSession("admin");
    await archiveAdminServicePage(actorFromSession(session), input);
    revalidateServicePages(input.slug);
    return { ok: true };
  } catch (error) {
    return mapBackendError(error);
  }
}

export async function restoreAdminServicePageAction(input: {
  readonly id: string;
  readonly version: number;
  readonly slug: string;
}): Promise<AdminServicePageActionResult> {
  try {
    const session = await requireSession("admin");
    const page = await restoreAdminServicePage(
      actorFromSession(session),
      input,
    );
    revalidateServicePages(input.slug);
    return { ok: true, page };
  } catch (error) {
    return mapBackendError(error);
  }
}

export async function createAdminServicePageChildAction(input: {
  readonly collection: ServicePageCollection;
  readonly servicePageId: string;
  readonly slug: string;
  readonly payload: Record<string, unknown>;
}): Promise<AdminServicePageActionResult> {
  try {
    const session = await requireSession("admin");
    const child = await createAdminServicePageChild(
      actorFromSession(session),
      input.collection,
      input.servicePageId,
      input.payload,
    );
    revalidateServicePages(input.slug);
    return { ok: true, child };
  } catch (error) {
    return mapBackendError(error);
  }
}

export async function updateAdminServicePageChildAction(input: {
  readonly collection: ServicePageCollection;
  readonly servicePageId: string;
  readonly childId: string;
  readonly slug: string;
  readonly payload: Record<string, unknown>;
}): Promise<AdminServicePageActionResult> {
  try {
    const session = await requireSession("admin");
    const child = await updateAdminServicePageChild(
      actorFromSession(session),
      input.collection,
      input.servicePageId,
      input.childId,
      input.payload,
    );
    revalidateServicePages(input.slug);
    return { ok: true, child };
  } catch (error) {
    return mapBackendError(error);
  }
}

export async function archiveAdminServicePageChildAction(input: {
  readonly collection: ServicePageCollection;
  readonly servicePageId: string;
  readonly id: string;
  readonly version: number;
  readonly slug: string;
}): Promise<AdminServicePageActionResult> {
  try {
    const session = await requireSession("admin");
    await archiveAdminServicePageChild(
      actorFromSession(session),
      input.collection,
      input.servicePageId,
      { id: input.id, version: input.version },
    );
    revalidateServicePages(input.slug);
    return { ok: true };
  } catch (error) {
    return mapBackendError(error);
  }
}

export async function restoreAdminServicePageChildAction(input: {
  readonly collection: ServicePageCollection;
  readonly servicePageId: string;
  readonly id: string;
  readonly version: number;
  readonly slug: string;
}): Promise<AdminServicePageActionResult> {
  try {
    const session = await requireSession("admin");
    const child = await restoreAdminServicePageChild(
      actorFromSession(session),
      input.collection,
      input.servicePageId,
      { id: input.id, version: input.version },
    );
    revalidateServicePages(input.slug);
    return { ok: true, child };
  } catch (error) {
    return mapBackendError(error);
  }
}

export async function reorderAdminServicePageChildrenAction(input: {
  readonly collection: ServicePageCollection;
  readonly servicePageId: string;
  readonly slug: string;
  readonly items: readonly {
    readonly id: string;
    readonly sortOrder: number;
    readonly version: number;
  }[];
}): Promise<AdminServicePageActionResult> {
  try {
    const session = await requireSession("admin");
    await reorderAdminServicePageChildren(
      actorFromSession(session),
      input.collection,
      input.servicePageId,
      input.items,
    );
    revalidateServicePages(input.slug);
    return { ok: true };
  } catch (error) {
    return mapBackendError(error);
  }
}
