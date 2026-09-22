import type { Metadata } from "next";
import { getBlogPosts } from "@/lib/data/blog";
import { pageMetadata } from "@/lib/pageMetadata";
import { BlogPageClient } from "@/components/blog/BlogPageClient";

export const metadata: Metadata = pageMetadata({
  title: "Insights on Software, Web & Mobile",
  description:
    "Guides on custom software development, web development, mobile apps, and growth from JZ Enterprises — process, cost, and comparisons for teams who ship.",
  path: "/blog",
});

export default async function BlogPage() {
  const posts = await getBlogPosts();
  return <BlogPageClient posts={posts} />;
}
