import type { Metadata } from "next";
import { getBlogPosts } from "@/lib/data/blog";
import { pageMetadata } from "@/lib/pageMetadata";
import { BlogPageClient } from "@/components/blog/BlogPageClient";

export const metadata: Metadata = pageMetadata({
  title: "Blog",
  description:
    "Insights from JZ Enterprises on websites, software, brand, SEO, and growth — practical notes for teams who ship outcomes.",
  path: "/blog",
});

export default async function BlogPage() {
  const posts = await getBlogPosts();
  return <BlogPageClient posts={posts} />;
}
