import type { Metadata } from "next";
import { site } from "@/constants/site";
import { env } from "@/lib/env";

export function pageMetadata(input: {
  readonly title: string;
  readonly description: string;
  readonly path: string;
  readonly ogTitle?: string;
  readonly ogDescription?: string;
  readonly ogImage?: string;
}): Metadata {
  const absoluteTitle = `${input.title} | ${site.name}`;
  const url = `${env.siteUrl}${input.path}`;
  const ogTitle =
    input.ogTitle && input.ogTitle.trim().length > 0
      ? input.ogTitle
      : absoluteTitle;
  const ogDescription =
    input.ogDescription && input.ogDescription.trim().length > 0
      ? input.ogDescription
      : input.description;
  const ogImages =
    input.ogImage && input.ogImage.trim().length > 0
      ? [
          {
            url: input.ogImage.startsWith("http")
              ? input.ogImage
              : `${env.siteUrl}${input.ogImage}`,
          },
        ]
      : undefined;

  return {
    title: input.title,
    description: input.description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: "website",
      locale: "en_US",
      url,
      siteName: site.name,
      title: ogTitle,
      description: ogDescription,
      ...(ogImages ? { images: ogImages } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description: ogDescription,
      ...(ogImages ? { images: ogImages.map((image) => image.url) } : {}),
    },
  };
}
