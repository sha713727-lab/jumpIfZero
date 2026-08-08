import {
  faqCreateSchema,
  faqUpdateSchema,
  faqsListResponseSchema,
  type Actor,
} from "@jumpifzero/contracts/content";
import { faqRowSchema, type FaqRow } from "@jumpifzero/contracts/db-content";
import type { AdminFaq } from "@jumpifzero/contracts/admin";
import { z } from "@jumpifzero/contracts/z";
import { backendRequest } from "@/lib/backend/client";

function formatUpdatedAt(value: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(value);
}

export function toAdminFaq(row: FaqRow): AdminFaq {
  return {
    id: row.id,
    question: row.question,
    answer: row.answer,
    sortOrder: row.sort_order,
    active: row.published_at !== null,
    version: row.version,
    publishedAt:
      row.published_at === null ? null : row.published_at.toISOString(),
    updatedAt: formatUpdatedAt(row.updated_at),
  };
}

export async function listAdminFaqs(actor: Actor): Promise<AdminFaq[]> {
  const response = await backendRequest({
    method: "GET",
    path: "/content/faqs",
    query: {
      limit: "100",
      publishedOnly: "false",
      sort: "sort_order",
      dir: "asc",
    },
    actor,
    outputSchema: faqsListResponseSchema,
  });
  return response.items.map(toAdminFaq);
}

export async function createAdminFaq(
  actor: Actor,
  input: {
    readonly question: string;
    readonly answer: string;
    readonly sortOrder: number;
    readonly active: boolean;
  },
): Promise<AdminFaq> {
  const body = faqCreateSchema.parse({
    question: input.question,
    answer: input.answer,
    sortOrder: input.sortOrder,
    publishedAt: input.active ? new Date().toISOString() : null,
  });

  const row = await backendRequest({
    method: "POST",
    path: "/content/faqs",
    body,
    actor,
    outputSchema: faqRowSchema,
  });

  return toAdminFaq(row);
}

export async function updateAdminFaq(
  actor: Actor,
  input: {
    readonly id: string;
    readonly version: number;
    readonly question: string;
    readonly answer: string;
    readonly sortOrder: number;
    readonly active: boolean;
    readonly publishedAt: string | null;
  },
): Promise<AdminFaq> {
  const body = faqUpdateSchema.parse({
    id: input.id,
    version: input.version,
    question: input.question,
    answer: input.answer,
    sortOrder: input.sortOrder,
    publishedAt: input.active
      ? (input.publishedAt ?? new Date().toISOString())
      : null,
  });

  const row = await backendRequest({
    method: "PATCH",
    path: `/content/faqs/${input.id}`,
    body,
    actor,
    outputSchema: faqRowSchema,
  });

  return toAdminFaq(row);
}

export async function archiveAdminFaq(
  actor: Actor,
  input: { readonly id: string; readonly version: number },
): Promise<void> {
  await backendRequest({
    method: "DELETE",
    path: `/content/faqs/${input.id}`,
    body: { version: input.version },
    actor,
    outputSchema: z.null(),
  });
}

export async function reorderAdminFaqs(
  actor: Actor,
  items: readonly {
    readonly id: string;
    readonly sortOrder: number;
    readonly version: number;
  }[],
): Promise<void> {
  await backendRequest({
    method: "PUT",
    path: "/content/faqs/reorder",
    body: { items: [...items] },
    actor,
    outputSchema: z.null(),
  });
}
