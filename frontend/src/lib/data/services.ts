import { unstable_cache } from "next/cache";
import {
  servicesListResponseSchema,
} from "@jumpifzero/contracts/content";
import type { ServiceRow } from "@jumpifzero/contracts/db-content";
import { gatewayBackendRequest } from "@/lib/backend/gatewayClient";
import { cmsMediaSrc } from "@/lib/cmsMedia";
import {
  getServiceDetail,
  getServiceDetailBySlug,
} from "@/constants/serviceDetails";
import {
  serviceChapters as staticServiceChapters,
  servicesIntro,
} from "@/constants/servicesStory";

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

function toStaticServiceChapters(): readonly ServiceChapter[] {
  return staticServiceChapters.map((chapter, index) => {
    const detail = getServiceDetail(chapter.category);
    return {
      slug: detail?.slug ?? `service-${index + 1}`,
      title: chapter.title,
      quote: chapter.quote,
      category: chapter.category,
      href: chapter.href,
      tone: chapter.tone,
      images: {
        left: chapter.images.left,
        right: chapter.images.right,
        bottom: chapter.images.bottom,
      },
    };
  });
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
        return toStaticServiceChapters();
      }
      return response.items.map(toServiceChapter);
    } catch {
      return toStaticServiceChapters();
    }
  },
  ["public-service-chapters"],
  { revalidate: 60 },
);

export async function getServiceSlugs(): Promise<readonly string[]> {
  const chapters = await getCachedServiceChapters();
  return chapters.map((chapter) => chapter.slug);
}
