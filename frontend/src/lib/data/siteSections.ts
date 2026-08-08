import { unstable_cache } from "next/cache";
import {
  siteGalleryListResponseSchema,
  sitePrinciplesListResponseSchema,
  siteTestimonialsListResponseSchema,
} from "@jumpifzero/contracts/content";
import type {
  SiteGallerySectionKey,
  SitePrincipleAccent,
  SiteTestimonialAccent,
} from "@jumpifzero/contracts/db-content";
import { gatewayBackendRequest } from "@/lib/backend/gatewayClient";
import { cmsMediaSrc } from "@/lib/cmsMedia";

export type SiteGalleryImage = {
  readonly src: string;
  readonly alt: string;
};

export type SiteTestimonial = {
  readonly quote: string;
  readonly name: string;
  readonly role: string;
  readonly company: string;
  readonly accent: SiteTestimonialAccent;
  readonly image: string;
};

export type SitePrinciple = {
  readonly index: string;
  readonly title: string;
  readonly body: string;
  readonly accent: SitePrincipleAccent;
  readonly image: string;
  readonly imageAlt: string;
};

export async function getSiteGalleryImages(
  sectionKey: SiteGallerySectionKey,
): Promise<readonly SiteGalleryImage[]> {
  return getCachedSiteGalleryImages(sectionKey);
}

const getCachedSiteGalleryImages = unstable_cache(
  async (
    sectionKey: SiteGallerySectionKey,
  ): Promise<readonly SiteGalleryImage[]> => {
    const response = await gatewayBackendRequest({
      method: "GET",
      path: "/content/site-gallery",
      query: {
        limit: "100",
        publishedOnly: "true",
        sort: "sort_order",
        dir: "asc",
        sectionKey,
      },
      outputSchema: siteGalleryListResponseSchema,
    });

    return response.items.map((row) => ({
      src: cmsMediaSrc(row.image_path),
      alt: row.alt_text.length > 0 ? row.alt_text : "JZ Enterprises work",
    }));
  },
  ["public-site-gallery"],
  { revalidate: 60, tags: ["site-gallery"] },
);

export const getSiteTestimonials = unstable_cache(
  async (): Promise<readonly SiteTestimonial[]> => {
    const response = await gatewayBackendRequest({
      method: "GET",
      path: "/content/site-testimonials",
      query: {
        limit: "100",
        publishedOnly: "true",
        sort: "sort_order",
        dir: "asc",
      },
      outputSchema: siteTestimonialsListResponseSchema,
    });

    return response.items.map((row) => ({
      quote: row.quote,
      name: row.author_name,
      role: row.role_title,
      company: row.company,
      accent: row.accent,
      image: cmsMediaSrc(row.image_path),
    }));
  },
  ["public-site-testimonials"],
  { revalidate: 60, tags: ["site-testimonials"] },
);

export async function getSitePrinciples(): Promise<readonly SitePrinciple[]> {
  return getCachedSitePrinciples();
}

const getCachedSitePrinciples = unstable_cache(
  async (): Promise<readonly SitePrinciple[]> => {
    const response = await gatewayBackendRequest({
      method: "GET",
      path: "/content/site-principles",
      query: {
        limit: "100",
        publishedOnly: "true",
        sort: "sort_order",
        dir: "asc",
      },
      outputSchema: sitePrinciplesListResponseSchema,
    });

    return response.items.map((row) => ({
      index: row.index_label,
      title: row.title,
      body: row.body,
      accent: row.accent,
      image: cmsMediaSrc(row.image_path),
      imageAlt: row.image_alt,
    }));
  },
  ["public-site-principles"],
  { revalidate: 60, tags: ["site-principles"] },
);
