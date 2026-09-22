import { site } from "@/constants/site";
import { env } from "@/lib/env";

export function ServicePageFaqJsonLd({
  faqs,
  pageUrl,
}: {
  readonly faqs: readonly {
    readonly question: string;
    readonly answer: string;
  }[];
  readonly pageUrl: string;
}) {
  if (faqs.length === 0) {
    return null;
  }

  const payload = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
    url: pageUrl.startsWith("http") ? pageUrl : `${env.siteUrl}${pageUrl}`,
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
