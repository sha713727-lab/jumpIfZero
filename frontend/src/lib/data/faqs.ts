import { unstable_cache } from "next/cache";
import {
  faqsListResponseSchema,
} from "@jumpifzero/contracts/content";
import type { FaqRow } from "@jumpifzero/contracts/db-content";
import { gatewayBackendRequest } from "@/lib/backend/gatewayClient";
import { faqIntro } from "@/constants/faq";

export type FaqItem = {
  readonly question: string;
  readonly answer: string;
};

export { faqIntro };

function toFaqItem(row: FaqRow): FaqItem {
  return {
    question: row.question,
    answer: row.answer,
  };
}

async function fetchFaqItems(): Promise<readonly FaqItem[]> {
  const response = await gatewayBackendRequest({
    method: "GET",
    path: "/content/faqs",
    query: { limit: "100", publishedOnly: "true", sort: "sort_order", dir: "asc" },
    outputSchema: faqsListResponseSchema,
  });
  return response.items.map(toFaqItem);
}

export const getFaqItems = unstable_cache(fetchFaqItems, ["public-faqs"], {
  revalidate: 60,
});
