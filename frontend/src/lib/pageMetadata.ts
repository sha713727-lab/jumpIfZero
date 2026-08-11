import type { Metadata } from "next";
import { site } from "@/constants/site";
import { env } from "@/lib/env";

export function pageMetadata(input: {
  readonly title: string;
  readonly description: string;
  readonly path: string;
}): Metadata {
  const absoluteTitle = `${input.title} | ${site.name}`;
  const url = `${env.siteUrl}${input.path}`;
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
      title: absoluteTitle,
      description: input.description,
    },
    twitter: {
      card: "summary_large_image",
      title: absoluteTitle,
      description: input.description,
    },
  };
}
