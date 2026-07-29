import type { Metadata } from "next";
import { BlogPageClient } from "@/components/blog/BlogPageClient";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Insights from JZ Enterprises on websites, software, brand, SEO, and growth — practical notes for teams who ship outcomes.",
};

export default function BlogPage() {
  return <BlogPageClient />;
}
