"use server";

import { actorSchema } from "@jumpifzero/contracts/content";
import type { AdminBlogPost } from "@jumpifzero/contracts/admin";
import { BackendRequestError } from "@/lib/backend/client";
import {
  archiveAdminBlogPost,
  createAdminBlogPost,
  getAdminBlogPost,
  updateAdminBlogPost,
} from "@/lib/data/adminBlog";
import { requireSession, type SessionPayload } from "@/lib/session";

export type AdminBlogActionResult =
  | { readonly ok: true; readonly post: AdminBlogPost }
  | { readonly ok: true }
  | { readonly ok: false; readonly reason: "unauthorized" | "conflict" | "validation" | "server" };

function actorFromSession(session: SessionPayload) {
  return actorSchema.parse({
    subjectId: session.subjectId,
    role: session.role === "customer" ? "client" : session.role,
    employeeKind: null,
  });
}

function mapBackendError(error: unknown): AdminBlogActionResult {
  if (error instanceof BackendRequestError) {
    if (error.status === 401 || error.status === 403) {
      return { ok: false, reason: "unauthorized" };
    }
    if (error.status === 409) {
      return { ok: false, reason: "conflict" };
    }
    if (error.status === 400 || error.status === 422) {
      return { ok: false, reason: "validation" };
    }
  }
  return { ok: false, reason: "server" };
}

export async function getAdminBlogPostAction(input: {
  readonly id: string;
}): Promise<AdminBlogActionResult> {
  try {
    const session = await requireSession("admin");
    const actor = actorFromSession(session);
    const post = await getAdminBlogPost(actor, input.id);
    return { ok: true, post };
  } catch (error) {
    return mapBackendError(error);
  }
}

export async function createAdminBlogPostAction(input: {
  readonly title: string;
  readonly slug: string;
  readonly excerpt: string;
  readonly body: string;
  readonly image: string;
  readonly category: string;
  readonly active: boolean;
}): Promise<AdminBlogActionResult> {
  try {
    const session = await requireSession("admin");
    const actor = actorFromSession(session);
    const post = await createAdminBlogPost(actor, input);
    return { ok: true, post };
  } catch (error) {
    return mapBackendError(error);
  }
}

export async function updateAdminBlogPostAction(input: {
  readonly id: string;
  readonly version: number;
  readonly title: string;
  readonly slug: string;
  readonly excerpt: string;
  readonly body: string;
  readonly image: string;
  readonly category: string;
  readonly active: boolean;
  readonly publishedAt: string | null;
}): Promise<AdminBlogActionResult> {
  try {
    const session = await requireSession("admin");
    const actor = actorFromSession(session);
    const post = await updateAdminBlogPost(actor, input);
    return { ok: true, post };
  } catch (error) {
    return mapBackendError(error);
  }
}

export async function archiveAdminBlogPostAction(input: {
  readonly id: string;
  readonly version: number;
}): Promise<AdminBlogActionResult> {
  try {
    const session = await requireSession("admin");
    const actor = actorFromSession(session);
    await archiveAdminBlogPost(actor, input);
    return { ok: true };
  } catch (error) {
    return mapBackendError(error);
  }
}
