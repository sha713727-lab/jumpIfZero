import { cmsMediaUploadResponseSchema, type Actor } from "@jumpifzero/contracts";
import type { Readable } from "node:stream";
import { open } from "node:fs/promises";
import { env } from "../config/env.ts";
import { audit } from "../lib/audit.ts";
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from "../lib/errors.ts";
import { parseMultipart } from "../lib/multipart.ts";
import {
  deleteUpload,
  extensionForMime,
  openUploadStream,
  saveUpload,
} from "../lib/storage.ts";
import {
  assertSafeStorageKey,
  detectMagicMime,
  resolveStoragePath,
} from "../lib/upload-security.ts";

const CMS_KEY_RE = /^cms\/[a-zA-Z0-9._-]+$/;

const CMS_IMAGE_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

const CMS_VIDEO_MIME = new Set(["video/mp4", "video/webm"]);

const CMS_ALLOWED_MIME = new Set([...CMS_IMAGE_MIME, ...CMS_VIDEO_MIME]);

function assertCmsMime(buffer: Buffer, allowVideo: boolean): string {
  const mime = detectMagicMime(buffer);
  if (mime === null) {
    throw new BadRequestError("Unsupported file type");
  }
  if (CMS_IMAGE_MIME.has(mime)) {
    return mime;
  }
  if (allowVideo && CMS_VIDEO_MIME.has(mime)) {
    return mime;
  }
  throw new BadRequestError("Unsupported file type");
}

function assertCmsMediaKey(key: string): void {
  if (!CMS_KEY_RE.test(key)) {
    throw new BadRequestError("Invalid media key");
  }
  assertSafeStorageKey(key);
}

function assertCanUploadCmsMedia(actor: Actor): void {
  if (actor.role === "admin") {
    return;
  }
  if (
    actor.role === "employee" &&
    (actor.employeeKind === "delivery" || actor.employeeKind === "sales")
  ) {
    return;
  }
  throw new ForbiddenError();
}

export async function uploadCmsMedia(
  actor: Actor,
  input: {
    readonly headers: Record<string, string | string[] | undefined>;
    readonly rawBody: Buffer;
    readonly maxFileBytes: number;
  },
  correlationId: string,
): Promise<{ readonly imagePath: string }> {
  assertCanUploadCmsMedia(actor);
  const allowVideo = actor.role === "admin";
  const multipart = await parseMultipart({
    headers: input.headers,
    rawBody: input.rawBody,
    maxFileBytes: input.maxFileBytes,
  });
  if (multipart.file === null) {
    throw new BadRequestError("File required");
  }

  const contentType = assertCmsMime(multipart.file.buffer, allowVideo);
  const saved = await saveUpload({
    buffer: multipart.file.buffer,
    extension: extensionForMime(contentType),
    prefix: "cms",
  });

  try {
    const response = cmsMediaUploadResponseSchema.parse({
      imagePath: saved.storageKey,
    });
    audit({
      action: "content.media.upload",
      correlationId,
      actorSubjectId: actor.subjectId,
      route: "content.media.upload",
    });
    return response;
  } catch (err) {
    await deleteUpload(saved.storageKey);
    throw err;
  }
}

export async function openCmsMedia(key: string): Promise<{
  readonly stream: Readable;
  readonly contentType: string;
}> {
  assertCmsMediaKey(key);
  const fullPath = resolveStoragePath(env.FILE_STORAGE_ROOT, key);

  let handle;
  try {
    handle = await open(fullPath, "r");
  } catch {
    throw new NotFoundError("Media not found");
  }

  const header = Buffer.alloc(16);
  await handle.read(header, 0, 16, 0);
  await handle.close();

  const mime = detectMagicMime(header);
  if (mime === null || !CMS_ALLOWED_MIME.has(mime)) {
    throw new NotFoundError("Media not found");
  }

  return {
    stream: openUploadStream(key),
    contentType: mime,
  };
}
