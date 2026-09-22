import { site } from "@/constants/site";
import { env } from "@/lib/env";
import type { ServiceBreadcrumbItem } from "@/components/services/ServiceBreadcrumbs";

export function ServiceBreadcrumbJsonLd({
  items,
}: {
  readonly items: readonly ServiceBreadcrumbItem[];
}) {
  const list = items.filter((item) => item.href || item.label);
  if (list.length === 0) {
    return null;
  }

  const payload = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: list.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      ...(item.href
        ? {
            item: item.href.startsWith("http")
              ? item.href
              : `${env.siteUrl}${item.href}`,
          }
        : {}),
    })),
    isPartOf: {
      "@type": "WebSite",
      name: site.name,
      url: env.siteUrl,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(payload) }}
    />
  );
}
