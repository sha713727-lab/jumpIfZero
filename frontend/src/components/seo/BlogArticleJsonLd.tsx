import { site } from "@/constants/site";
import { env } from "@/lib/env";
import type { BlogPost } from "@/lib/data/blog";

export function BlogArticleJsonLd({
  post,
}: {
  readonly post: BlogPost;
}) {
  const payload = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    author: {
      "@type": "Organization",
      name: post.author || site.name,
    },
    publisher: {
      "@type": "Organization",
      name: site.name,
      logo: {
        "@type": "ImageObject",
        url: `${env.siteUrl}/images/jumpIfZeroLogo.png`,
      },
    },
    mainEntityOfPage: `${env.siteUrl}/blog/${post.slug}`,
    image: post.image.startsWith("http")
      ? post.image
      : `${env.siteUrl}${post.image}`,
    articleSection: post.category,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(payload) }}
    />
  );
}
