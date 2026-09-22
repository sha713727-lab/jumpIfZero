import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ServiceBreadcrumbItem } from "@/components/services/ServiceBreadcrumbs";
import { ServicePageView } from "@/components/services/ServicePageView";
import { ServiceBreadcrumbJsonLd } from "@/components/seo/ServiceBreadcrumbJsonLd";
import { ServicePageFaqJsonLd } from "@/components/seo/ServicePageFaqJsonLd";
import { getBlogPosts } from "@/lib/data/blog";
import { getPortfolioProjects } from "@/lib/data/portfolio";
import {
  getServicePageByPath,
  getServicePageBySlug,
  type PublicServicePage,
} from "@/lib/data/servicePages";
import { site } from "@/constants/site";
import { pageMetadata } from "@/lib/pageMetadata";

function metadataTitle(value: string): string {
  const trimmed = value.trim();
  const suffix = ` | ${site.name}`;
  return trimmed.endsWith(suffix)
    ? trimmed.slice(0, -suffix.length).trim()
    : trimmed;
}

const CASE_STUDY_CATEGORIES = new Set([
  "Website Development",
  "Software Development",
  "App Development",
  "SEO",
  "Digital Marketing",
  "Graphic Designing",
  "Network Security",
]);

function insightKeywordsFor(page: PublicServicePage): readonly string[] {
  const slugHints: Record<string, readonly string[]> = {
    "custom-development": [
      "custom",
      "software",
      "web",
      "mobile",
      "development",
    ],
    "custom-software-development": ["custom", "software"],
    "web-development": ["web", "website", "development"],
    "web-app-development": ["web", "application", "software"],
    "mobile-app-development": ["mobile", "app", "native"],
    "ecommerce-development": ["commerce", "ecommerce", "web"],
  };

  const base = [
    page.slug,
    page.title,
    page.parent?.slug ?? "",
    page.parent?.title ?? "",
  ]
    .join(" ")
    .toLowerCase();
  const tokens = base.split(/[^a-z0-9]+/).filter((t) => t.length > 2);
  const hints = slugHints[page.slug] ?? [];
  const merged = [...new Set([...tokens, ...hints])];
  return merged.length > 0 ? merged : ["service"];
}

export async function buildServicePageMetadata(
  path: string,
  page: PublicServicePage | null,
  fallbackTitle: string,
  fallbackDescription: string,
): Promise<Metadata> {
  if (!page) {
    return pageMetadata({
      title: fallbackTitle,
      description: fallbackDescription,
      path,
    });
  }

  const title = metadataTitle(
    page.metaTitle.trim().length > 0 ? page.metaTitle : page.title,
  );
  const description =
    page.metaDescription.trim().length > 0
      ? page.metaDescription
      : page.heroDescription;
  const ogTitle =
    page.ogTitle.trim().length > 0 ? metadataTitle(page.ogTitle) : undefined;

  return pageMetadata({
    title,
    description,
    path,
    ...(ogTitle ? { ogTitle } : {}),
    ...(page.ogDescription.trim().length > 0
      ? { ogDescription: page.ogDescription }
      : {}),
    ...(page.ogImageSrc.trim().length > 0
      ? { ogImage: page.ogImageSrc }
      : {}),
  });
}

export async function renderServicePage(args: {
  readonly page: PublicServicePage | null;
  readonly path: string;
}) {
  const { page, path } = args;
  if (!page) {
    notFound();
  }

  const [portfolio, blog] = await Promise.all([
    getPortfolioProjects(),
    getBlogPosts(),
  ]);

  const caseStudies = portfolio
    .filter((item) => CASE_STUDY_CATEGORIES.has(item.leftText))
    .slice(0, 3)
    .map((item) => ({
      slug: item.slug,
      title: item.title,
      category: item.leftText,
      summary: item.description,
      image: item.img,
    }));

  const keywords = insightKeywordsFor(page);
  const insights = blog
    .filter((post) => {
      const haystack = `${post.category} ${post.title}`.toLowerCase();
      return keywords.some((keyword) => haystack.includes(keyword));
    })
    .slice(0, 3)
    .map((post) => ({
      slug: post.slug,
      title: post.title,
      excerpt: post.excerpt,
      category: post.category,
      image: post.image,
    }));

  const breadcrumbs: ServiceBreadcrumbItem[] = [
    { label: "Home", href: "/" },
    { label: "Services", href: "/services" },
  ];
  if (page.parent) {
    breadcrumbs.push({
      label: page.parent.navLabel || page.parent.title,
      href: page.parent.href,
    });
  }
  breadcrumbs.push({ label: page.navLabel || page.title });

  return (
    <>
      <ServiceBreadcrumbJsonLd items={breadcrumbs} />
      <ServicePageFaqJsonLd
        pageUrl={path}
        faqs={page.faqs.map((faq) => ({
          question: faq.question,
          answer: faq.answer,
        }))}
      />
      <ServicePageView
        page={page}
        breadcrumbs={breadcrumbs}
        caseStudies={caseStudies}
        insights={insights}
      />
    </>
  );
}

export async function loadPillarPage(slug: string) {
  return getServicePageBySlug(slug);
}

export async function loadChildPage(pillarSlug: string, childSlug: string) {
  return getServicePageByPath(pillarSlug, childSlug);
}
