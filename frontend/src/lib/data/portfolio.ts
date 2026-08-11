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
  portfolioProjects,
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

function staticPortfolioProjects(): readonly PortfolioGsapProject[] {
  return portfolioProjects.map((item) => ({
    slug: item.slug,
    title: item.title,
    img: item.img,
    link: `/portfolio/${item.slug}`,
    leftText: item.leftText,
    description: item.description,
  }));
}

function mergePortfolioProjects(
  cmsItems: readonly PortfolioGsapProject[],
): readonly PortfolioGsapProject[] {
  if (cmsItems.length >= portfolioProjects.length) {
    return cmsItems;
  }
  const seen = new Set(cmsItems.map((item) => item.slug));
  const extras = staticPortfolioProjects().filter(
    (item) => !seen.has(item.slug),
  );
  return [...cmsItems, ...extras];
}

function staticPortfolioDetail(slug: string): PortfolioDetail | undefined {
  const item = portfolioProjects.find((entry) => entry.slug === slug);
  if (!item) {
    return undefined;
  }
  return {
    slug: item.slug,
    title: item.title,
    category: item.leftText,
    summary: item.description,
    image: item.img,
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
    return mergePortfolioProjects(response.items.map(toPortfolioProject));
  } catch {
    return staticPortfolioProjects();
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
    return staticPortfolioDetail(slug);
  }
}
