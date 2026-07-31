import {
  blogCopy,
  blogPosts,
  getBlogPost as findBlogPost,
  getRelatedPosts as findRelatedPosts,
  type BlogPost,
} from "@/constants/blog";

export type { BlogPost };
export { blogCopy, blogPosts };

export async function getBlogPosts(): Promise<readonly BlogPost[]> {
  return blogPosts;
}

export async function getBlogPost(
  slug: string,
): Promise<BlogPost | undefined> {
  return findBlogPost(slug);
}

export async function getRelatedPosts(
  slug: string,
  limit = 3,
): Promise<readonly BlogPost[]> {
  return findRelatedPosts(slug, limit);
}
