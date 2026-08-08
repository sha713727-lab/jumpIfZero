import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlogDetailClient } from "@/components/blog/BlogDetailClient";
import { getBlogPost, getRelatedPosts } from "@/lib/data/blog";

type BlogDetailPageProps = {
  readonly params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: BlogDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPost(slug);

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
  const [post, related] = await Promise.all([
    getBlogPost(slug),
    getRelatedPosts(slug),
  ]);

  if (!post) {
    notFound();
  }

  return <BlogDetailClient post={post} related={related} />;
}
