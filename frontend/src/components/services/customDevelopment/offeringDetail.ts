import type { ServiceDetail } from "@/constants/serviceDetails";
import { getServiceDetailBySlug } from "@/constants/serviceDetails";

const OFFERING_FALLBACK_IMAGES: Readonly<Record<string, string>> = {
  "Web Development": "/images/services/website.jpg",
  "Mobile App Development": "/images/services/app.jpg",
  "Custom Software Development": "/images/services/software.jpg",
  "Web Application Development": "/images/services/software-b.jpg",
  "E-commerce Development": "/images/services/design.jpg",
};

const OFFERING_DETAIL_SLUGS: Readonly<Record<string, string>> = {
  "Web Development": "website-development",
  "Mobile App Development": "app-development",
  "Custom Software Development": "software-development",
};

function highlightLines(description: string): readonly [string, string, string] {
  const parts = description
    .split(/[.!?]+/)
    .map((part) => part.trim())
    .filter((part) => part.length > 12);

  const unique: string[] = [];
  for (const part of parts) {
    if (!unique.includes(part)) {
      unique.push(part);
    }
    if (unique.length === 3) {
      break;
    }
  }

  const fallbacks = [
    "Scoped around your users and workflows.",
    "Clear ownership from discovery through launch.",
    "Built to evolve as requirements change.",
  ] as const;

  for (const fallback of fallbacks) {
    if (unique.length >= 3) {
      break;
    }
    if (!unique.includes(fallback)) {
      unique.push(fallback);
    }
  }

  return [unique[0]!, unique[1]!, unique[2]!];
}

export function offeringImageSrc(
  title: string,
  imagePath: string,
): string {
  const trimmed = imagePath.trim();
  if (trimmed.length > 0) {
    return trimmed;
  }
  return OFFERING_FALLBACK_IMAGES[title] ?? "/images/services/software.jpg";
}

export function offeringToServiceDetail(input: {
  readonly title: string;
  readonly description: string;
  readonly imagePath: string;
}): ServiceDetail {
  const mappedSlug = OFFERING_DETAIL_SLUGS[input.title];
  if (mappedSlug) {
    const catalog = getServiceDetailBySlug(mappedSlug);
    if (catalog) {
      const image = offeringImageSrc(input.title, input.imagePath);
      return {
        ...catalog,
        image,
        category: input.title,
        body:
          input.description.trim().length > 0
            ? input.description.trim()
            : catalog.body,
      };
    }
  }

  const image = offeringImageSrc(input.title, input.imagePath);
  const body =
    input.description.trim().length > 0
      ? input.description.trim()
      : "Custom work scoped around your users, workflows, and growth goals.";

  return {
    slug: input.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    category: input.title,
    title: input.title,
    quote: "Built around how you work — not a rigid product mold.",
    body,
    highlights: highlightLines(body),
    image,
    ctaLabel: "Start engagement",
    ctaHref: "/contact",
  };
}
