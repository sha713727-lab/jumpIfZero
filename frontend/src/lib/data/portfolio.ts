import {
  portfolioListResponseSchema,
} from "@jumpifzero/contracts/content";
import {
  portfolioItemRowSchema,
  type PortfolioItemRow,
} from "@jumpifzero/contracts/db-content";
import { gatewayBackendRequest } from "@/lib/backend/gatewayClient";
import { cmsMediaSrc } from "@/lib/cmsMedia";
import {
  portfolioCopy,
  portfolioMarqueeImages,
} from "@/constants/portfolio";

export type PortfolioGsapProject = {
  readonly slug: string;
  readonly title: string;
  readonly img: string;
  readonly link: string;
  readonly leftText: string;
  readonly description: string;
};

export type PortfolioDetail = {
  readonly slug: string;
  readonly title: string;
  readonly category: string;
  readonly summary: string;
  readonly image: string;
};

export { portfolioCopy, portfolioMarqueeImages };

function toPortfolioProject(row: PortfolioItemRow): PortfolioGsapProject {
  return {
    slug: row.slug,
    title: row.title,
    img: cmsMediaSrc(row.image_path),
    link: `/portfolio/${row.slug}`,
    leftText: row.category,
    description: row.summary,
  };
}

function toPortfolioDetail(row: PortfolioItemRow): PortfolioDetail {
  return {
    slug: row.slug,
    title: row.title,
    category: row.category,
    summary: row.summary,
    image: cmsMediaSrc(row.image_path),
  };
}

export async function getPortfolioProjects(): Promise<
  readonly PortfolioGsapProject[]
> {
  try {
    const response = await gatewayBackendRequest({
      method: "GET",
      path: "/content/portfolio",
      query: {
        limit: "100",
        publishedOnly: "true",
        sort: "updated_at",
        dir: "desc",
      },
      outputSchema: portfolioListResponseSchema,
    });
    return response.items.map(toPortfolioProject);
  } catch {
    return [];
  }
}

export async function getPortfolioSlugs(): Promise<readonly string[]> {
  const projects = await getPortfolioProjects();
  return projects.map((project) => project.slug);
}

export async function getPortfolioBySlug(
  slug: string,
): Promise<PortfolioDetail | undefined> {
  try {
    const row = await gatewayBackendRequest({
      method: "GET",
      path: `/content/portfolio/by-slug/${slug}`,
      outputSchema: portfolioItemRowSchema,
    });
    return toPortfolioDetail(row);
  } catch {
    return undefined;
  }
}
