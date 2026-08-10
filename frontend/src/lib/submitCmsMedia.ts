"use server";

import {
  actorSchema,
  cmsMediaUploadResponseSchema,
} from "@jumpifzero/contracts/content";
import { z } from "@jumpifzero/contracts/z";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { env } from "@/lib/env";
import { signBackendRequest } from "@/lib/backend/hmacSign";
import { CMS_MEDIA_MAX_BYTES } from "@/lib/cmsMediaLimits";
import { requireSession, verifySession, type SessionPayload } from "@/lib/session";

export type CmsMediaUploadResult =
  | { readonly ok: true; readonly imagePath: string }
  | {
      readonly ok: false;
      readonly reason: "unauthorized" | "validation" | "server";
    };

const successEnvelopeSchema = z.object({
  ok: z.literal(true),
  data: z.unknown(),
  correlationId: z.string(),
});

function actorFromSession(session: SessionPayload) {
  return actorSchema.parse({
    subjectId: session.subjectId,
    role: session.role === "customer" ? "client" : session.role,
    employeeKind:
      session.role === "employee" ? session.employeeKind : null,
  });
}

async function requireAdminOrEmployeeSession(): Promise<SessionPayload> {
  const admin = await verifySession("admin");
  if (admin) {
    return admin;
  }
  return requireSession("employee");
}

function sanitizeFilename(name: string, mimeType: string): string {
  const base = name.replace(/[^\w.\-]+/g, "_").slice(0, 120);
  if (base.length > 0 && base !== "." && base !== "..") {
    return base;
  }
  if (mimeType === "image/png") {
    return "upload.png";
  }
  if (mimeType === "image/webp") {
    return "upload.webp";
  }
  if (mimeType === "video/mp4") {
    return "upload.mp4";
  }
  if (mimeType === "video/webm") {
    return "upload.webm";
  }
  return "upload.jpg";
}

function isUploadFile(value: FormDataEntryValue | null): value is File {
  return (
    typeof value === "object" &&
    value !== null &&
    "arrayBuffer" in value &&
    "size" in value &&
    "type" in value &&
    "name" in value &&
    typeof (value as File).arrayBuffer === "function" &&
    typeof (value as File).size === "number"
  );
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
    const session = await requireAdminOrEmployeeSession();
    const actor = actorFromSession(session);
    const file = formData.get("file");

    if (!isUploadFile(file) || file.size === 0) {
      return { ok: false, reason: "validation" };
    }

    const isAdmin = session.role === "admin";
    if (
      !file.type.startsWith("image/") &&
      !(isAdmin && (file.type === "video/mp4" || file.type === "video/webm"))
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
      filename: sanitizeFilename(file.name, file.type),
      mimeType: file.type.length > 0 ? file.type : "application/octet-stream",
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

    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        return { ok: false, reason: "unauthorized" };
      }
      if (response.status === 400 || response.status === 422) {
        return { ok: false, reason: "validation" };
      }
      return { ok: false, reason: "server" };
    }

    const json: unknown = await response.json();
    const envelope = successEnvelopeSchema.safeParse(json);
    if (!envelope.success) {
      return { ok: false, reason: "server" };
    }

    const parsed = cmsMediaUploadResponseSchema.safeParse(envelope.data.data);
    if (!parsed.success) {
      return { ok: false, reason: "server" };
    }

    return { ok: true, imagePath: parsed.data.imagePath };
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }
    return { ok: false, reason: "server" };
  }
}
