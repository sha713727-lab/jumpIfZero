import { unstable_cache } from "next/cache";
import {
  servicePageDetailSchema,
  servicePagesListResponseSchema,
  type ServicePageDetail,
} from "@jumpifzero/contracts";
import { gatewayBackendRequest } from "@/lib/backend/gatewayClient";
import { cmsMediaSrc } from "@/lib/cmsMedia";

export type PublicServicePage = ServicePageDetail & {
  readonly heroImageSrc: string;
  readonly ogImageSrc: string;
};

function toPublicPage(detail: ServicePageDetail): PublicServicePage {
  return {
    ...detail,
    heroImageSrc: cmsMediaSrc(detail.heroImagePath),
    ogImageSrc: cmsMediaSrc(detail.ogImagePath),
    offerings: detail.offerings.map((item) => ({
      ...item,
      image_path: cmsMediaSrc(item.image_path),
    })),
    children: detail.children.map((child) => ({
      ...child,
      heroImagePath: cmsMediaSrc(child.heroImagePath),
    })),
    related: detail.related.map((item) => ({
      ...item,
      page: {
        ...item.page,
        heroImagePath: cmsMediaSrc(item.page.heroImagePath),
      },
    })),
  };
}

export async function getServicePageBySlug(
  slug: string,
): Promise<PublicServicePage | null> {
  return getCachedServicePageBySlug(slug);
}

const getCachedServicePageBySlug = unstable_cache(
  async (slug: string): Promise<PublicServicePage | null> => {
    try {
      const detail = await gatewayBackendRequest({
        method: "GET",
        path: `/content/service-pages/by-slug/${encodeURIComponent(slug)}`,
        query: {
          publishedOnly: "true",
        },
        outputSchema: servicePageDetailSchema,
      });
      return toPublicPage(detail);
    } catch {
      return null;
    }
  },
  ["public-service-page-by-slug"],
  { revalidate: 60, tags: ["service-pages"] },
);

export async function getServicePageByPath(
  pillarSlug: string,
  childSlug: string,
): Promise<PublicServicePage | null> {
  return getCachedServicePageByPath(pillarSlug, childSlug);
}

const getCachedServicePageByPath = unstable_cache(
  async (
    pillarSlug: string,
    childSlug: string,
  ): Promise<PublicServicePage | null> => {
    try {
      const detail = await gatewayBackendRequest({
        method: "GET",
        path: `/content/service-pages/by-path/${encodeURIComponent(pillarSlug)}/${encodeURIComponent(childSlug)}`,
        query: {
          publishedOnly: "true",
        },
        outputSchema: servicePageDetailSchema,
      });
      return toPublicPage(detail);
    } catch {
      return null;
    }
  },
  ["public-service-page-by-path"],
  { revalidate: 60, tags: ["service-pages"] },
);

export async function getPublishedServicePagePaths(): Promise<
  readonly string[]
> {
  return getCachedPublishedServicePagePaths();
}

const getCachedPublishedServicePagePaths = unstable_cache(
  async (): Promise<readonly string[]> => {
    try {
      const response = await gatewayBackendRequest({
        method: "GET",
        path: "/content/service-pages",
        query: {
          limit: "100",
          publishedOnly: "true",
          sort: "updated_at",
          dir: "asc",
        },
        outputSchema: servicePagesListResponseSchema,
      });
      const byId = new Map(
        response.items.map((item) => [item.id, item] as const),
      );
      return response.items.map((item) => {
        if (item.parentId === null) {
          return `/services/${item.slug}`;
        }
        const parent = byId.get(item.parentId);
        if (!parent) {
          return `/services/${item.slug}`;
        }
        return `/services/${parent.slug}/${item.slug}`;
      });
    } catch {
      return [];
    }
  },
  ["public-service-page-paths"],
  { revalidate: 60, tags: ["service-pages"] },
);

/** @deprecated Prefer getPublishedServicePagePaths */
export async function getPublishedServicePageSlugs(): Promise<
  readonly string[]
> {
  const paths = await getPublishedServicePagePaths();
  return paths.map((path) => path.replace(/^\/services\//, ""));
}
