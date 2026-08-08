"use server";

import {
  actorSchema,
  cmsMediaUploadResponseSchema,
} from "@jumpifzero/contracts/content";
import { env } from "@/lib/env";
import { signBackendRequest } from "@/lib/backend/hmacSign";
import { CMS_MEDIA_MAX_BYTES } from "@/lib/cmsMediaLimits";
import { requireSession, type SessionPayload } from "@/lib/session";

export type CmsMediaUploadResult =
  | { readonly ok: true; readonly imagePath: string }
  | {
      readonly ok: false;
      readonly reason: "unauthorized" | "validation" | "server";
    };

function actorFromSession(session: SessionPayload) {
  return actorSchema.parse({
    subjectId: session.subjectId,
    role: session.role === "customer" ? "client" : session.role,
    employeeKind: null,
  });
}

function buildMultipartBody(input: {
  readonly boundary: string;
  readonly filename: string;
  readonly mimeType: string;
  readonly buffer: Buffer;
}): Buffer {
  const prefix = Buffer.from(
    `--${input.boundary}\r\nContent-Disposition: form-data; name="file"; filename="${input.filename}"\r\nContent-Type: ${input.mimeType}\r\n\r\n`,
    "utf8",
  );
  const suffix = Buffer.from(`\r\n--${input.boundary}--\r\n`, "utf8");
  return Buffer.concat([prefix, input.buffer, suffix]);
}

export async function uploadCmsMediaAction(
  formData: FormData,
): Promise<CmsMediaUploadResult> {
  try {
    const session = await requireSession("admin");
    const actor = actorFromSession(session);
    const file = formData.get("file");

    if (!(file instanceof File) || file.size === 0) {
      return { ok: false, reason: "validation" };
    }

    if (
      !file.type.startsWith("image/") &&
      file.type !== "video/mp4" &&
      file.type !== "video/webm"
    ) {
      return { ok: false, reason: "validation" };
    }

    if (file.size > CMS_MEDIA_MAX_BYTES) {
      return { ok: false, reason: "validation" };
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const boundary = `jz${crypto.randomUUID().replaceAll("-", "")}`;
    const rawBody = buildMultipartBody({
      boundary,
      filename: file.name,
      mimeType: file.type,
      buffer,
    });

    const url = new URL("/content/media", `${env.backendBaseUrl}/`);
    const headers = {
      ...signBackendRequest({
        method: "POST",
        url,
        body: rawBody,
        actor,
      }),
      "content-type": `multipart/form-data; boundary=${boundary}`,
    };

    const response = await fetch(url, {
      method: "POST",
      headers,
      body: new Uint8Array(rawBody),
      cache: "no-store",
    });

    const text = await response.text();

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        return { ok: false, reason: "unauthorized" };
      }
      if (response.status === 400 || response.status === 422) {
        return { ok: false, reason: "validation" };
      }
      return { ok: false, reason: "server" };
    }

    let json: unknown;
    try {
      json = text.length > 0 ? JSON.parse(text) : null;
    } catch {
      return { ok: false, reason: "server" };
    }

    const envelope = json as {
      ok?: boolean;
      data?: unknown;
    };

    if (envelope.ok !== true) {
      return { ok: false, reason: "server" };
    }

    const parsed = cmsMediaUploadResponseSchema.safeParse(envelope.data);
    if (!parsed.success) {
      return { ok: false, reason: "server" };
    }

    return { ok: true, imagePath: parsed.data.imagePath };
  } catch (error) {
    if (
      error instanceof Error &&
      (error.message.includes("Unauthorized") ||
        error.message.includes("Forbidden"))
    ) {
      return { ok: false, reason: "unauthorized" };
    }
    return { ok: false, reason: "server" };
  }
}
