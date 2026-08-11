import type { MetadataRoute } from "next";
import { getBlogSlugs } from "@/lib/data/blog";
import { getPortfolioSlugs } from "@/lib/data/portfolio";
import { getServiceSlugs } from "@/lib/data/services";
import { navLinks } from "@/constants/site";
import { env } from "@/lib/env";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = env.siteUrl;

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: base,
      changeFrequency: "weekly",
      priority: 1,
    },
    ...navLinks.map((link) => ({
      url: `${base}${link.href}`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];

  const [blogResult, portfolioResult, serviceResult] = await Promise.allSettled([
    getBlogSlugs(),
    getPortfolioSlugs(),
    getServiceSlugs(),
  ]);

  const blogSlugs =
    blogResult.status === "fulfilled" ? blogResult.value : [];
  const portfolioSlugs =
    portfolioResult.status === "fulfilled" ? portfolioResult.value : [];
  const serviceSlugs =
    serviceResult.status === "fulfilled" ? serviceResult.value : [];

  const blogRoutes: MetadataRoute.Sitemap = blogSlugs.map((slug) => ({
    url: `${base}/blog/${slug}`,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const portfolioRoutes: MetadataRoute.Sitemap = portfolioSlugs.map((slug) => ({
    url: `${base}/portfolio/${slug}`,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const serviceRoutes: MetadataRoute.Sitemap = serviceSlugs.map((slug) => ({
    url: `${base}/services#${slug}`,
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  return [...staticRoutes, ...blogRoutes, ...portfolioRoutes, ...serviceRoutes];
}
