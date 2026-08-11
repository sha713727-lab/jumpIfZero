import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlogDetailClient } from "@/components/blog/BlogDetailClient";
import { getBlogPost, getRelatedPosts } from "@/lib/data/blog";
import { pageMetadata } from "@/lib/pageMetadata";

type BlogDetailPageProps = {
  readonly params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: BlogDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPost(slug);

  if (!post) {
    return pageMetadata({
      title: "Blog",
      description:
        "Insights from JZ Enterprises on websites, software, brand, SEO, and growth.",
      path: "/blog",
    });
  }

  return pageMetadata({
    title: post.title,
    description: post.excerpt,
    path: `/blog/${post.slug}`,
  });
}

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  const { slug } = await params;
  const [post, related] = await Promise.all([
    getBlogPost(slug),
    getRelatedPosts(slug),
  ]);

  if (!post) {
    notFound();
  }

  return <BlogDetailClient post={post} related={related} />;
}
