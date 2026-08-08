import {
  fileRowSchema,
  type FileRow,
} from "@jumpifzero/contracts";
import type { DbQueryable } from "../db/query.ts";
import { query } from "../db/query.ts";
import { ConflictError, InternalError } from "../lib/errors.ts";
import { isPgCode, parseRow } from "./_parse.ts";

const FILE_COLUMNS = `
  id, client_id, original_name, storage_key, content_type, size_bytes,
  checksum_sha256, kind, uploaded_by_user_id, uploaded_by_role,
  created_at, updated_at, archived_at
`;

export async function getFileById(
  id: string,
  client?: DbQueryable,
): Promise<FileRow | null> {
  const result = await query(
    `
      SELECT ${FILE_COLUMNS}
      FROM files
      WHERE id = $1
      LIMIT 1
    `,
    [id],
    client,
  );
  const row = result.rows[0];
  if (row === undefined) {
    return null;
  }
  return parseRow(fileRowSchema, row);
}

export async function listFiles(input: {
  readonly limit: number;
  readonly offset: number;
  readonly clientId: string;
  readonly q?: string;
  readonly archived: "active" | "archived" | "all";
  readonly sort: "created_at" | "original_name" | "size_bytes";
  readonly dir: "asc" | "desc";
  readonly clientIds: "all" | readonly string[];
}): Promise<{ readonly items: readonly FileRow[]; readonly total: number }> {
  if (input.clientIds !== "all" && !input.clientIds.includes(input.clientId)) {
    return { items: [], total: 0 };
  }

  const sortColumn =
    input.sort === "original_name"
      ? "original_name"
      : input.sort === "size_bytes"
        ? "size_bytes"
        : "created_at";
  const dir = input.dir === "asc" ? "ASC" : "DESC";
  const params: unknown[] = [input.clientId];
  const where: string[] = [`client_id = $1`];

  if (input.archived === "active") {
    where.push("archived_at IS NULL");
  } else if (input.archived === "archived") {
    where.push("archived_at IS NOT NULL");
  }
  if (input.q !== undefined && input.q.length > 0) {
    params.push(`%${input.q}%`);
    where.push(`original_name ILIKE $${params.length}`);
  }

  const whereSql = `WHERE ${where.join(" AND ")}`;
  params.push(input.limit);
  const limitIdx = params.length;
  params.push(input.offset);
  const offsetIdx = params.length;

  const result = await query(
    `
      SELECT ${FILE_COLUMNS}, COUNT(*) OVER()::int AS total_count
      FROM files
      ${whereSql}
      ORDER BY ${sortColumn} ${dir}, id ASC
      LIMIT $${limitIdx}
      OFFSET $${offsetIdx}
    `,
    params,
  );

  const total =
    result.rows.length === 0
      ? 0
      : Number((result.rows[0] as { total_count: number }).total_count);

  return {
    items: result.rows.map((row) => parseRow(fileRowSchema, row)),
    total,
  };
}

export async function insertFile(
  input: {
    readonly clientId: string;
    readonly originalName: string;
    readonly storageKey: string;
    readonly contentType: string;
    readonly sizeBytes: number;
    readonly checksumSha256: string;
    readonly kind: string;
    readonly uploadedByUserId: string;
    readonly uploadedByRole: "admin" | "client" | "employee";
  },
  client?: DbQueryable,
): Promise<FileRow> {
  try {
    const result = await query(
      `
        INSERT INTO files (
          client_id, original_name, storage_key, content_type, size_bytes,
          checksum_sha256, kind, uploaded_by_user_id, uploaded_by_role
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING id
      `,
      [
        input.clientId,
        input.originalName,
        input.storageKey,
        input.contentType,
        input.sizeBytes,
        input.checksumSha256,
        input.kind,
        input.uploadedByUserId,
        input.uploadedByRole,
      ],
      client,
    );
    const id = (result.rows[0] as { id: string } | undefined)?.id;
    if (id === undefined) {
      throw new InternalError("insertFile returned no row");
    }
    const row = await getFileById(id, client);
    if (row === null) {
      throw new InternalError("insertFile could not reload row");
    }
    return row;
  } catch (err) {
    if (isPgCode(err, "23505")) {
      throw new ConflictError("File name already exists for client");
    }
    throw err;
  }
}

export async function archiveFile(
  id: string,
  client?: DbQueryable,
): Promise<FileRow | null> {
  const result = await query(
    `
      UPDATE files
      SET
        archived_at = now(),
        updated_at = now()
      WHERE id = $1
        AND archived_at IS NULL
      RETURNING id
    `,
    [id],
    client,
  );
  const rowId = (result.rows[0] as { id: string } | undefined)?.id;
  if (rowId === undefined) {
    return null;
  }
  return getFileById(rowId, client);
}

export async function restoreFile(
  id: string,
  client?: DbQueryable,
): Promise<FileRow | null> {
  const result = await query(
    `
      UPDATE files
      SET
        archived_at = NULL,
        updated_at = now()
      WHERE id = $1
        AND archived_at IS NOT NULL
      RETURNING id
    `,
    [id],
    client,
  );
  const rowId = (result.rows[0] as { id: string } | undefined)?.id;
  if (rowId === undefined) {
    return null;
  }
  return getFileById(rowId, client);
}
