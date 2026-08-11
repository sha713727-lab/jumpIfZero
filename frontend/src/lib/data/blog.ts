import { blogListResponseSchema } from "@jumpifzero/contracts/content";
import {
  blogPostRowSchema,
  type BlogPostListRow,
  type BlogPostRow,
} from "@jumpifzero/contracts/db-content";
import { gatewayBackendRequest } from "@/lib/backend/gatewayClient";
import {
  estimateBlogReadTime,
  parseBlogBody,
  type BlogBlock,
} from "@/lib/blogBody";
import { cmsMediaSrc } from "@/lib/cmsMedia";
import { blogCopy } from "@/constants/blog";

export type BlogPost = {
  readonly slug: string;
  readonly title: string;
  readonly excerpt: string;
  readonly category: string;
  readonly date: string;
  readonly dateLabel: string;
  readonly readTime: string;
  readonly image: string;
  readonly imageAlt: string;
  readonly author: string;
  readonly body: readonly BlogBlock[];
};

export { blogCopy };

function formatDateLabel(value: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(value);
}

function formatIsoDate(value: Date): string {
  return value.toISOString().slice(0, 10);
}

function toBlogPost(row: BlogPostRow): BlogPost {
  const publishedAt = row.published_at ?? row.created_at;
  const document = parseBlogBody(row.body);
  return {
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    category: row.category,
    date: formatIsoDate(publishedAt),
    dateLabel: formatDateLabel(publishedAt),
    readTime: estimateBlogReadTime(document),
    image: cmsMediaSrc(row.image_path),
    imageAlt: row.title,
    author: "JZ Enterprises",
    body: document.blocks,
  };
}

function toBlogPostPreview(row: BlogPostListRow): BlogPost {
  const publishedAt = row.published_at ?? row.created_at;
  return {
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    category: row.category,
    date: formatIsoDate(publishedAt),
    dateLabel: formatDateLabel(publishedAt),
    readTime: "5 min",
    image: cmsMediaSrc(row.image_path),
    imageAlt: row.title,
    author: "JZ Enterprises",
    body: [],
  };
}

export async function getBlogPosts(): Promise<readonly BlogPost[]> {
  try {
    const response = await gatewayBackendRequest({
      method: "GET",
      path: "/content/blog",
      query: {
        limit: "100",
        publishedOnly: "true",
        sort: "published_at",
        dir: "desc",
      },
      outputSchema: blogListResponseSchema,
    });
    return response.items.map(toBlogPostPreview);
  } catch {
    return [];
  }
}

export async function getBlogPost(slug: string): Promise<BlogPost | undefined> {
  try {
    const row = await gatewayBackendRequest({
      method: "GET",
      path: `/content/blog/by-slug/${slug}`,
      outputSchema: blogPostRowSchema,
    });
    return toBlogPost(row);
  } catch {
    return undefined;
  }
}

export async function getBlogSlugs(): Promise<readonly string[]> {
  const posts = await getBlogPosts();
  return posts.map((post) => post.slug);
}

export async function getRelatedPosts(
  slug: string,
  limit = 3,
): Promise<readonly BlogPost[]> {
  const posts = await getBlogPosts();
  return posts.filter((post) => post.slug !== slug).slice(0, limit);
}
