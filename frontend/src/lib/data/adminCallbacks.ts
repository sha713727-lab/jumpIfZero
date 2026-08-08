import {
  callbackUpdateSchema,
  callbacksListResponseSchema,
  type Actor,
} from "@jumpifzero/contracts/content";
import { callbackRowSchema, type CallbackRow } from "@jumpifzero/contracts/db-content";
import type { AdminCallback } from "@jumpifzero/contracts/admin";
import { z } from "@jumpifzero/contracts/z";
import { backendRequest } from "@/lib/backend/client";

function formatUpdatedAt(value: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(value);
}

export function toAdminCallback(row: CallbackRow): AdminCallback {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    note: row.note,
    status: row.status_code,
    version: row.version,
    updatedAt: formatUpdatedAt(row.updated_at),
  };
}

export async function listAdminCallbacks(
  actor: Actor,
): Promise<AdminCallback[]> {
  const response = await backendRequest({
    method: "GET",
    path: "/content/callbacks",
    query: { limit: "100" },
    actor,
    outputSchema: callbacksListResponseSchema,
  });
  return response.items.map(toAdminCallback);
}

export async function updateAdminCallback(
  actor: Actor,
  input: {
    readonly id: string;
    readonly version: number;
    readonly status: "new" | "resolved";
  },
): Promise<AdminCallback> {
  const body = callbackUpdateSchema.parse(input);

  const row = await backendRequest({
    method: "PATCH",
    path: `/content/callbacks/${input.id}`,
    body,
    actor,
    outputSchema: callbackRowSchema,
  });

  return toAdminCallback(row);
}

export async function archiveAdminCallback(
  actor: Actor,
  input: { readonly id: string; readonly version: number },
): Promise<void> {
  await backendRequest({
    method: "DELETE",
    path: `/content/callbacks/${input.id}`,
    body: { version: input.version },
    actor,
    outputSchema: z.null(),
  });
}
