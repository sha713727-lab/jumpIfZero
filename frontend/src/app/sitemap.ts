import type { MetadataRoute } from "next";
import { blogPosts } from "@/constants/blog";
import { navLinks } from "@/constants/site";
import { env } from "@/lib/env";

export default function sitemap(): MetadataRoute.Sitemap {
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

  const blogRoutes: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: `${base}/blog/${post.slug}`,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...blogRoutes];
}
