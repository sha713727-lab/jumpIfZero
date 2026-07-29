import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlogDetailClient } from "@/components/blog/BlogDetailClient";
import { blogPosts, getBlogPost } from "@/constants/blog";

type BlogDetailPageProps = {
  readonly params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: BlogDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);

  if (!post) {
    return { title: "Blog" };
  }

  return {
    title: post.title,
    description: post.excerpt,
  };
}

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  const { slug } = await params;
  const post = getBlogPost(slug);

  if (!post) {
    notFound();
  }

  return <BlogDetailClient post={post} />;
}
