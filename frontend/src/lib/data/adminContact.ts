import {
  contactMessageUpdateSchema,
  contactMessagesListResponseSchema,
  type Actor,
} from "@jumpifzero/contracts/content";
import {
  contactMessageRowSchema,
  type ContactMessageRow,
} from "@jumpifzero/contracts/db-content";
import type { AdminContactMessage } from "@jumpifzero/contracts/admin";
import { z } from "@jumpifzero/contracts/z";
import { backendRequest } from "@/lib/backend/client";

function formatUpdatedAt(value: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(value);
}

export function toAdminContactMessage(
  row: ContactMessageRow,
): AdminContactMessage {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    subject: row.subject,
    body: row.body,
    status: row.status_code,
    version: row.version,
    updatedAt: formatUpdatedAt(row.updated_at),
  };
}

export async function listAdminContactMessages(
  actor: Actor,
): Promise<AdminContactMessage[]> {
  const response = await backendRequest({
    method: "GET",
    path: "/content/contact-messages",
    query: { limit: "100" },
    actor,
    outputSchema: contactMessagesListResponseSchema,
  });
  return response.items.map(toAdminContactMessage);
}

export async function updateAdminContactMessage(
  actor: Actor,
  input: {
    readonly id: string;
    readonly version: number;
    readonly status: "new" | "read";
  },
): Promise<AdminContactMessage> {
  const body = contactMessageUpdateSchema.parse(input);

  const row = await backendRequest({
    method: "PATCH",
    path: `/content/contact-messages/${input.id}`,
    body,
    actor,
    outputSchema: contactMessageRowSchema,
  });

  return toAdminContactMessage(row);
}

export async function archiveAdminContactMessage(
  actor: Actor,
  input: { readonly id: string; readonly version: number },
): Promise<void> {
  await backendRequest({
    method: "DELETE",
    path: `/content/contact-messages/${input.id}`,
    body: { version: input.version },
    actor,
    outputSchema: z.null(),
  });
}
