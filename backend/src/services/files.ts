import {
  fileArchiveSchema,
  filePublicSchema,
  filesListQuerySchema,
  filesListResponseSchema,
  type Actor,
  type FilePublic,
  type FileRow,
} from "@jumpifzero/contracts";
import type { Readable } from "node:stream";
import { BadRequestError, NotFoundError } from "../lib/errors.ts";
import { parseMultipart } from "../lib/multipart.ts";
import {
  deleteUpload,
  extensionForMime,
  openUploadStream,
  saveUpload,
} from "../lib/storage.ts";
import { assertAllowedUploadMime } from "../lib/upload-security.ts";
import * as clientsRepo from "../repositories/clients.ts";
import * as filesRepo from "../repositories/files.ts";
import {
  accessibleClientIds,
  assertCanAccessClient,
} from "./access.ts";
import { parseInput } from "./_helpers.ts";

function toPublic(row: FileRow): FilePublic {
  return filePublicSchema.parse({
    id: row.id,
    clientId: row.client_id,
    originalName: row.original_name,
    contentType: row.content_type,
    sizeBytes: row.size_bytes,
    checksumSha256: row.checksum_sha256,
    kind: row.kind,
    uploadedByUserId: row.uploaded_by_user_id,
    uploadedByRole: row.uploaded_by_role,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
    archivedAt:
      row.archived_at === null ? null : row.archived_at.toISOString(),
  });
}

function uploadedByRole(
  actor: Actor,
): "admin" | "client" | "employee" {
  if (actor.role === "admin") {
    return "admin";
  }
  if (actor.role === "client") {
    return "client";
  }
  return "employee";
}

export async function listFiles(
  actor: Actor,
  input: unknown,
): Promise<unknown> {
  const query = parseInput(filesListQuerySchema, input);
  await assertCanAccessClient(actor, query.clientId);
  const clientIds = await accessibleClientIds(actor);
  const result = await filesRepo.listFiles({
    limit: query.limit,
    offset: query.offset,
    clientId: query.clientId,
    ...(query.q !== undefined ? { q: query.q } : {}),
    archived: query.archived,
    sort: query.sort,
    dir: query.dir,
    clientIds,
  });
  return filesListResponseSchema.parse({
    items: result.items.map(toPublic),
    total: result.total,
    limit: query.limit,
    offset: query.offset,
  });
}

export async function getFile(
  actor: Actor,
  id: string,
): Promise<FilePublic> {
  const row = await filesRepo.getFileById(id);
  if (row === null || (actor.role !== "admin" && row.archived_at !== null)) {
    throw new NotFoundError("File not found");
  }
  await assertCanAccessClient(actor, row.client_id);
  return toPublic(row);
}

export async function uploadFile(
  actor: Actor,
  input: {
    readonly headers: Record<string, string | string[] | undefined>;
    readonly rawBody: Buffer;
    readonly maxFileBytes: number;
  },
): Promise<FilePublic> {
  const multipart = await parseMultipart({
    headers: input.headers,
    rawBody: input.rawBody,
    maxFileBytes: input.maxFileBytes,
  });
  if (multipart.file === null) {
    throw new BadRequestError("File required");
  }
  const clientId = multipart.fields.clientId;
  if (clientId === undefined || clientId.length === 0) {
    throw new BadRequestError("clientId required");
  }
  await assertCanAccessClient(actor, clientId);
  const client = await clientsRepo.getActiveClientById(clientId);
  if (client === null) {
    throw new NotFoundError("Client not found");
  }

  const contentType = assertAllowedUploadMime(multipart.file.buffer);
  const originalName =
    multipart.file.filename.trim().length > 0
      ? multipart.file.filename.trim()
      : `upload.${extensionForMime(contentType)}`;
  const kind = multipart.fields.kind?.trim() ?? "";

  const saved = await saveUpload({
    buffer: multipart.file.buffer,
    extension: extensionForMime(contentType),
  });

  try {
    const row = await filesRepo.insertFile({
      clientId,
      originalName,
      storageKey: saved.storageKey,
      contentType,
      sizeBytes: multipart.file.buffer.byteLength,
      checksumSha256: saved.checksumSha256,
      kind,
      uploadedByUserId: actor.subjectId,
      uploadedByRole: uploadedByRole(actor),
    });
    return toPublic(row);
  } catch (err) {
    await deleteUpload(saved.storageKey);
    throw err;
  }
}

export async function openFileDownload(
  actor: Actor,
  id: string,
): Promise<{
  readonly file: FilePublic;
  readonly stream: Readable;
  readonly contentType: string;
  readonly sizeBytes: number;
  readonly originalName: string;
}> {
  const row = await filesRepo.getFileById(id);
  if (row === null || row.archived_at !== null) {
    throw new NotFoundError("File not found");
  }
  await assertCanAccessClient(actor, row.client_id);
  return {
    file: toPublic(row),
    stream: openUploadStream(row.storage_key),
    contentType: row.content_type,
    sizeBytes: row.size_bytes,
    originalName: row.original_name,
  };
}

export async function archiveFile(
  actor: Actor,
  id: string,
): Promise<FilePublic> {
  parseInput(fileArchiveSchema, { id });
  const existing = await filesRepo.getFileById(id);
  if (existing === null) {
    throw new NotFoundError("File not found");
  }
  await assertCanAccessClient(actor, existing.client_id);
  const row = await filesRepo.archiveFile(id);
  if (row === null) {
    throw new NotFoundError("File not found");
  }
  return toPublic(row);
}

export async function restoreFile(
  actor: Actor,
  id: string,
): Promise<FilePublic> {
  parseInput(fileArchiveSchema, { id });
  const existing = await filesRepo.getFileById(id);
  if (existing === null) {
    throw new NotFoundError("File not found");
  }
  await assertCanAccessClient(actor, existing.client_id);
  const row = await filesRepo.restoreFile(id);
  if (row === null) {
    throw new NotFoundError("File not found");
  }
  return toPublic(row);
}
