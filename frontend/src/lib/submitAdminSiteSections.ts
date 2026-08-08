"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { actorSchema } from "@jumpifzero/contracts/content";
import type {
  AdminSiteGalleryImage,
  AdminSitePrinciple,
  AdminSiteTestimonial,
} from "@jumpifzero/contracts/admin";
import type {
  SiteGallerySectionKey,
  SitePrincipleAccent,
  SiteTestimonialAccent,
} from "@jumpifzero/contracts/db-content";
import { BackendRequestError } from "@/lib/backend/client";
import {
  archiveAdminSiteGalleryImage,
  createAdminSiteGalleryImage,
  reorderAdminSiteGalleryImages,
  updateAdminSiteGalleryImage,
} from "@/lib/data/adminSiteGallery";
import {
  archiveAdminSitePrinciple,
  createAdminSitePrinciple,
  reorderAdminSitePrinciples,
  updateAdminSitePrinciple,
} from "@/lib/data/adminSitePrinciples";
import {
  archiveAdminSiteTestimonial,
  createAdminSiteTestimonial,
  reorderAdminSiteTestimonials,
  updateAdminSiteTestimonial,
} from "@/lib/data/adminSiteTestimonials";
import { requireSession, type SessionPayload } from "@/lib/session";

export type AdminSiteActionResult =
  | { readonly ok: true; readonly galleryImage: AdminSiteGalleryImage }
  | { readonly ok: true; readonly testimonial: AdminSiteTestimonial }
  | { readonly ok: true; readonly principle: AdminSitePrinciple }
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

function mapBackendError(error: unknown): AdminSiteActionResult {
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

function revalidateSiteGallery() {
  revalidateTag("site-gallery", "max");
  revalidatePath("/about");
  revalidatePath("/");
}

function revalidateSiteTestimonials() {
  revalidateTag("site-testimonials", "max");
  revalidatePath("/");
}

function revalidateSitePrinciples() {
  revalidateTag("site-principles", "max");
  revalidatePath("/about");
}

export async function createAdminSiteGalleryImageAction(input: {
  readonly sectionKey: SiteGallerySectionKey;
  readonly image: string;
  readonly altText: string;
  readonly sortOrder: number;
  readonly active: boolean;
}): Promise<AdminSiteActionResult> {
  try {
    const session = await requireSession("admin");
    const galleryImage = await createAdminSiteGalleryImage(
      actorFromSession(session),
      input,
    );
    revalidateSiteGallery();
    return { ok: true, galleryImage };
  } catch (error) {
    return mapBackendError(error);
  }
}

export async function updateAdminSiteGalleryImageAction(input: {
  readonly id: string;
  readonly version: number;
  readonly sectionKey: SiteGallerySectionKey;
  readonly image: string;
  readonly altText: string;
  readonly sortOrder: number;
  readonly active: boolean;
  readonly publishedAt: string | null;
}): Promise<AdminSiteActionResult> {
  try {
    const session = await requireSession("admin");
    const galleryImage = await updateAdminSiteGalleryImage(
      actorFromSession(session),
      input,
    );
    revalidateSiteGallery();
    return { ok: true, galleryImage };
  } catch (error) {
    return mapBackendError(error);
  }
}

export async function archiveAdminSiteGalleryImageAction(input: {
  readonly id: string;
  readonly version: number;
}): Promise<AdminSiteActionResult> {
  try {
    const session = await requireSession("admin");
    await archiveAdminSiteGalleryImage(actorFromSession(session), input);
    revalidateSiteGallery();
    return { ok: true };
  } catch (error) {
    return mapBackendError(error);
  }
}

export async function reorderAdminSiteGalleryImagesAction(
  items: readonly {
    readonly id: string;
    readonly sortOrder: number;
    readonly version: number;
  }[],
): Promise<AdminSiteActionResult> {
  try {
    const session = await requireSession("admin");
    await reorderAdminSiteGalleryImages(actorFromSession(session), items);
    revalidateSiteGallery();
    return { ok: true };
  } catch (error) {
    return mapBackendError(error);
  }
}

export async function createAdminSiteTestimonialAction(input: {
  readonly quote: string;
  readonly authorName: string;
  readonly roleTitle: string;
  readonly company: string;
  readonly accent: SiteTestimonialAccent;
  readonly image: string;
  readonly sortOrder: number;
  readonly active: boolean;
}): Promise<AdminSiteActionResult> {
  try {
    const session = await requireSession("admin");
    const testimonial = await createAdminSiteTestimonial(
      actorFromSession(session),
      input,
    );
    revalidateSiteTestimonials();
    return { ok: true, testimonial };
  } catch (error) {
    return mapBackendError(error);
  }
}

export async function updateAdminSiteTestimonialAction(input: {
  readonly id: string;
  readonly version: number;
  readonly quote: string;
  readonly authorName: string;
  readonly roleTitle: string;
  readonly company: string;
  readonly accent: SiteTestimonialAccent;
  readonly image: string;
  readonly sortOrder: number;
  readonly active: boolean;
  readonly publishedAt: string | null;
}): Promise<AdminSiteActionResult> {
  try {
    const session = await requireSession("admin");
    const testimonial = await updateAdminSiteTestimonial(
      actorFromSession(session),
      input,
    );
    revalidateSiteTestimonials();
    return { ok: true, testimonial };
  } catch (error) {
    return mapBackendError(error);
  }
}

export async function archiveAdminSiteTestimonialAction(input: {
  readonly id: string;
  readonly version: number;
}): Promise<AdminSiteActionResult> {
  try {
    const session = await requireSession("admin");
    await archiveAdminSiteTestimonial(actorFromSession(session), input);
    revalidateSiteTestimonials();
    return { ok: true };
  } catch (error) {
    return mapBackendError(error);
  }
}

export async function reorderAdminSiteTestimonialsAction(
  items: readonly {
    readonly id: string;
    readonly sortOrder: number;
    readonly version: number;
  }[],
): Promise<AdminSiteActionResult> {
  try {
    const session = await requireSession("admin");
    await reorderAdminSiteTestimonials(actorFromSession(session), items);
    revalidateSiteTestimonials();
    return { ok: true };
  } catch (error) {
    return mapBackendError(error);
  }
}

export async function createAdminSitePrincipleAction(input: {
  readonly indexLabel: string;
  readonly title: string;
  readonly body: string;
  readonly accent: SitePrincipleAccent;
  readonly image: string;
  readonly imageAlt: string;
  readonly sortOrder: number;
  readonly active: boolean;
}): Promise<AdminSiteActionResult> {
  try {
    const session = await requireSession("admin");
    const principle = await createAdminSitePrinciple(
      actorFromSession(session),
      input,
    );
    revalidateSitePrinciples();
    return { ok: true, principle };
  } catch (error) {
    return mapBackendError(error);
  }
}

export async function updateAdminSitePrincipleAction(input: {
  readonly id: string;
  readonly version: number;
  readonly indexLabel: string;
  readonly title: string;
  readonly body: string;
  readonly accent: SitePrincipleAccent;
  readonly image: string;
  readonly imageAlt: string;
  readonly sortOrder: number;
  readonly active: boolean;
  readonly publishedAt: string | null;
}): Promise<AdminSiteActionResult> {
  try {
    const session = await requireSession("admin");
    const principle = await updateAdminSitePrinciple(
      actorFromSession(session),
      input,
    );
    revalidateSitePrinciples();
    return { ok: true, principle };
  } catch (error) {
    return mapBackendError(error);
  }
}

export async function archiveAdminSitePrincipleAction(input: {
  readonly id: string;
  readonly version: number;
}): Promise<AdminSiteActionResult> {
  try {
    const session = await requireSession("admin");
    await archiveAdminSitePrinciple(actorFromSession(session), input);
    revalidateSitePrinciples();
    return { ok: true };
  } catch (error) {
    return mapBackendError(error);
  }
}

export async function reorderAdminSitePrinciplesAction(
  items: readonly {
    readonly id: string;
    readonly sortOrder: number;
    readonly version: number;
  }[],
): Promise<AdminSiteActionResult> {
  try {
    const session = await requireSession("admin");
    await reorderAdminSitePrinciples(actorFromSession(session), items);
    revalidateSitePrinciples();
    return { ok: true };
  } catch (error) {
    return mapBackendError(error);
  }
}
