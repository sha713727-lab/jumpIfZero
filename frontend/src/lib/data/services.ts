import { unstable_cache } from "next/cache";
import {
  servicesListResponseSchema,
} from "@jumpifzero/contracts/content";
import type { ServiceRow } from "@jumpifzero/contracts/db-content";
import { gatewayBackendRequest } from "@/lib/backend/gatewayClient";
import { cmsMediaSrc } from "@/lib/cmsMedia";
import {
  getServiceDetailBySlug,
} from "@/constants/serviceDetails";
import { servicesIntro } from "@/constants/servicesStory";

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

function toServiceChapter(row: ServiceRow, index: number): ServiceChapter {
  const overlay = getServiceDetailBySlug(row.slug);
  const image = cmsMediaSrc(row.image_path);
  const overlayImage = overlay?.image ?? image;

  return {
    slug: row.slug,
    title:
      overlay?.title ??
      (row.description.length > 0 ? row.description : row.title),
    quote: overlay?.quote ?? "",
    category: row.title,
    href: row.path.length > 0 ? row.path : "/contact",
    tone: index % 2 === 0 ? "light" : "dark",
    images: {
      left: image.length > 0 ? image : overlayImage,
      right: overlayImage,
      bottom: overlayImage,
    },
  };
}

export async function getServiceChapters(): Promise<readonly ServiceChapter[]> {
  return getCachedServiceChapters();
}

const getCachedServiceChapters = unstable_cache(
  async (): Promise<readonly ServiceChapter[]> => {
    try {
      const response = await gatewayBackendRequest({
        method: "GET",
        path: "/content/services",
        query: {
          limit: "100",
          publishedOnly: "true",
          sort: "updated_at",
          dir: "asc",
        },
        outputSchema: servicesListResponseSchema,
      });
      if (response.items.length === 0) {
        return [];
      }
      return response.items.map(toServiceChapter);
    } catch {
      return [];
    }
  },
  ["public-service-chapters"],
  { revalidate: 60 },
);

export async function getServiceSlugs(): Promise<readonly string[]> {
  const chapters = await getCachedServiceChapters();
  return chapters.map((chapter) => chapter.slug);
}
