import {
  portfolioCopy,
  portfolioMarqueeImages,
  portfolioProjects,
  type PortfolioGsapProject,
} from "@/constants/portfolio";

export type { PortfolioGsapProject };
export { portfolioCopy, portfolioMarqueeImages, portfolioProjects };

export async function getPortfolioProjects(): Promise<
  readonly PortfolioGsapProject[]
> {
  return portfolioProjects;
}
