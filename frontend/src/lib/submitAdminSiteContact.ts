"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { actorSchema } from "@jumpifzero/contracts/content";
import {
  siteContactPublicSchema,
  type SiteContactPublic,
} from "@jumpifzero/contracts/content";
import { BackendRequestError, backendRequest } from "@/lib/backend/client";
import { requireSession } from "@/lib/session";

export type SiteContactActionResult =
  | { readonly ok: true; readonly data: SiteContactPublic }
  | {
      readonly ok: false;
      readonly reason: "unauthorized" | "conflict" | "validation" | "server";
    };

function mapBackendError(error: unknown): SiteContactActionResult {
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

export async function getAdminSiteContactAction(): Promise<SiteContactActionResult> {
  try {
    const session = await requireSession("admin");
    const actor = actorSchema.parse({
      subjectId: session.subjectId,
      role: "admin",
      employeeKind: null,
    });
    const data = await backendRequest({
      method: "GET",
      path: "/content/site-contact",
      actor,
      outputSchema: siteContactPublicSchema,
    });
    return { ok: true, data };
  } catch (error) {
    return mapBackendError(error);
  }
}

export async function updateAdminSiteContactAction(input: {
  readonly version: number;
  readonly email: string;
  readonly phone: string;
  readonly phoneHref: string;
  readonly addressLabel: string;
  readonly addressLine1: string;
  readonly addressLine2: string;
  readonly addressLine3: string;
  readonly locationLede: string;
  readonly mapEmbedUrl: string;
}): Promise<SiteContactActionResult> {
  try {
    const session = await requireSession("admin");
    const actor = actorSchema.parse({
      subjectId: session.subjectId,
      role: "admin",
      employeeKind: null,
    });
    const data = await backendRequest({
      method: "PATCH",
      path: "/content/site-contact",
      body: input,
      actor,
      outputSchema: siteContactPublicSchema,
    });
    revalidateTag("site-contact", "max");
    revalidatePath("/contact");
    revalidatePath("/about");
    return { ok: true, data };
  } catch (error) {
    return mapBackendError(error);
  }
}
