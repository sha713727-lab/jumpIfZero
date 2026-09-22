import { unstable_cache } from "next/cache";
import {
  servicePageDetailSchema,
  servicePagesListResponseSchema,
} from "@jumpifzero/contracts";
import { serviceNavCategories } from "@/constants/servicesNav";
import {
  getServicePillarBlurb,
  servicePillarBlurbs,
} from "@/constants/servicesPage";
import { servicesIntro } from "@/constants/servicesStory";
import { gatewayBackendRequest } from "@/lib/backend/gatewayClient";
import { cmsMediaSrc } from "@/lib/cmsMedia";

export type ServiceChapter = {
  readonly slug: string;
  readonly title: string;
  readonly quote: string;
  readonly category: string;
  readonly href: string;
  readonly tone: "light" | "dark";
  readonly images: {
    readonly left: string;
    readonly right: string;
    readonly bottom: string;
  };
};

export { servicesIntro };

function chapterFromNav(
  slug: string,
  index: number,
  enrich?: {
    readonly image?: string;
  },
): ServiceChapter | null {
  const category = serviceNavCategories.find((item) => item.slug === slug);
  const blurb = getServicePillarBlurb(slug);
  if (!category || !blurb) {
    return null;
  }

  const image =
    enrich?.image && enrich.image.length > 0 ? enrich.image : blurb.image;

  return {
    slug: category.slug,
    title: blurb.title,
    quote: blurb.quote,
    category: category.title,
    href: category.href,
    tone: index % 2 === 0 ? "light" : "dark",
    images: {
      left: image,
      right: image,
      bottom: image,
    },
  };
}

function staticChapters(): readonly ServiceChapter[] {
  return serviceNavCategories
    .map((category, index) => chapterFromNav(category.slug, index))
    .filter((item): item is ServiceChapter => item !== null);
}

export async function getServiceChapters(): Promise<readonly ServiceChapter[]> {
  return getCachedServiceChapters();
}

const getCachedServiceChapters = unstable_cache(
  async (): Promise<readonly ServiceChapter[]> => {
    const fallback = staticChapters();

    try {
      const response = await gatewayBackendRequest({
        method: "GET",
        path: "/content/service-pages",
        query: {
          limit: "100",
          publishedOnly: "true",
          sort: "sort_order",
          dir: "asc",
        },
        outputSchema: servicePagesListResponseSchema,
      });

      const pillars = response.items.filter((item) => item.parentId === null);
      if (pillars.length === 0) {
        return fallback;
      }

      const bySlug = new Map(pillars.map((item) => [item.slug, item] as const));
      const chapters: ServiceChapter[] = [];

      for (const [index, category] of serviceNavCategories.entries()) {
        const listItem = bySlug.get(category.slug);
        if (!listItem) {
          const staticChapter = chapterFromNav(category.slug, index);
          if (staticChapter) {
            chapters.push(staticChapter);
          }
          continue;
        }

        let enrich:
          | {
              readonly image?: string;
            }
          | undefined;

        try {
          const detail = await gatewayBackendRequest({
            method: "GET",
            path: `/content/service-pages/by-slug/${encodeURIComponent(category.slug)}`,
            query: { publishedOnly: "true" },
            outputSchema: servicePageDetailSchema,
          });
          const heroImage = cmsMediaSrc(detail.heroImagePath);
          enrich =
            heroImage.length > 0 ? { image: heroImage } : undefined;
        } catch {
          enrich = undefined;
        }

        const chapter = chapterFromNav(category.slug, index, enrich);
        if (chapter) {
          chapters.push(chapter);
        }
      }

      return chapters.length > 0 ? chapters : fallback;
    } catch {
      return fallback;
    }
  },
  ["public-service-chapters-from-nav-v2"],
  { revalidate: 60, tags: ["service-pages"] },
);

export async function getServiceSlugs(): Promise<readonly string[]> {
  return servicePillarBlurbs.map((item) => item.slug);
}
