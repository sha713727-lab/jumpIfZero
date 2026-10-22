import type { Metadata } from "next";
import { getBlogPosts } from "@/lib/data/blog";
import { pageMetadata } from "@/lib/pageMetadata";
import { BlogPageClient } from "@/components/blog/BlogPageClient";

export const metadata: Metadata = pageMetadata({
  title: "Insights | Software, Web & SEO for Pakistan",
  description:
    "Practical guides on custom software, web development, mobile apps, and SEO for teams in Lahore and Pakistan — from JZ Enterprises.",
  path: "/blog",
});

export default async function BlogPage() {
  const posts = await getBlogPosts();
  return <BlogPageClient posts={posts} />;
}
