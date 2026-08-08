import { cmsMediaUploadResponseSchema, type Actor } from "@jumpifzero/contracts";
import type { Readable } from "node:stream";
import { open } from "node:fs/promises";
import { env } from "../config/env.ts";
import { audit } from "../lib/audit.ts";
import { BadRequestError, NotFoundError } from "../lib/errors.ts";
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
import { requireAdmin } from "./_helpers.ts";

const CMS_KEY_RE = /^cms\/[a-zA-Z0-9._-]+$/;

const CMS_ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "video/mp4",
  "video/webm",
]);

function assertCmsMime(buffer: Buffer): string {
  const mime = detectMagicMime(buffer);
  if (mime === null || !CMS_ALLOWED_MIME.has(mime)) {
    throw new BadRequestError("Unsupported file type");
  }
  return mime;
}

function assertCmsMediaKey(key: string): void {
  if (!CMS_KEY_RE.test(key)) {
    throw new BadRequestError("Invalid media key");
  }
  assertSafeStorageKey(key);
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
  requireAdmin(actor);
  const multipart = await parseMultipart({
    headers: input.headers,
    rawBody: input.rawBody,
    maxFileBytes: input.maxFileBytes,
  });
  if (multipart.file === null) {
    throw new BadRequestError("File required");
  }

  const contentType = assertCmsMime(multipart.file.buffer);
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
