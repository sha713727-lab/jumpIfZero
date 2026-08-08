import {
  teamMemberRowSchema,
  teamMemberSocialRowSchema,
  type TeamMemberRow,
  type TeamMemberSocialRow,
  type TeamMemberWithSocialsRow,
} from "@jumpifzero/contracts";
import type { DbQueryable } from "../db/query.ts";
import { query } from "../db/query.ts";
import { withTransaction } from "../db/transaction.ts";
import { InternalError } from "../lib/errors.ts";
import { parseRow } from "./_parse.ts";
import { nextUuidv7 } from "./_write.ts";

const TEAM_MEMBER_COLUMNS = `
  id, name, role_title, bio, image_path, employee_id, sort_order,
  published_at, version, created_at, updated_at
`;

const SOCIAL_COLUMNS = `
  id, team_member_id, network, label, href, created_at, updated_at
`;

export type TeamMemberSocialInsert = {
  readonly network: "linkedin" | "instagram" | "x";
  readonly label: string;
  readonly href: string;
};

export type TeamMemberInsert = {
  readonly name: string;
  readonly roleTitle: string;
  readonly bio: string;
  readonly imagePath: string;
  readonly employeeId: string | null;
  readonly sortOrder: number;
  readonly publishedAt: Date | null;
  readonly socials: readonly TeamMemberSocialInsert[];
};

export type TeamMemberUpdate = {
  readonly id: string;
  readonly version: number;
  readonly name: string;
  readonly roleTitle: string;
  readonly bio: string;
  readonly imagePath: string;
  readonly employeeId: string | null;
  readonly sortOrder: number;
  readonly publishedAt: Date | null;
  readonly socials: readonly TeamMemberSocialInsert[];
};

export type TeamMemberReorderItem = {
  readonly id: string;
  readonly sortOrder: number;
  readonly version: number;
};

function teamSortColumn(
  sort: "created_at" | "updated_at" | "sort_order" | "published_at",
): string {
  switch (sort) {
    case "sort_order":
      return "sort_order";
    case "published_at":
      return "published_at";
    case "created_at":
      return "created_at";
    default:
      return "updated_at";
  }
}

function attachSocials(
  members: readonly TeamMemberRow[],
  socials: readonly TeamMemberSocialRow[],
): TeamMemberWithSocialsRow[] {
  const byMember = new Map<string, TeamMemberSocialRow[]>();

  for (const social of socials) {
    const list = byMember.get(social.team_member_id);
    if (list === undefined) {
      byMember.set(social.team_member_id, [social]);
    } else {
      list.push(social);
    }
  }

  return members.map((member) => ({
    ...member,
    socials: byMember.get(member.id) ?? [],
  }));
}

async function listSocialsForMembers(
  memberIds: readonly string[],
  client?: DbQueryable,
): Promise<readonly TeamMemberSocialRow[]> {
  if (memberIds.length === 0) {
    return [];
  }

  const result = await query(
    `
      SELECT ${SOCIAL_COLUMNS}
      FROM team_member_socials
      WHERE team_member_id = ANY($1::uuid[])
      ORDER BY created_at ASC, id ASC
    `,
    [memberIds],
    client,
  );

  return result.rows.map((row) => parseRow(teamMemberSocialRowSchema, row));
}

export async function listActiveTeamMembers(input: {
  readonly limit: number;
  readonly offset: number;
  readonly q?: string;
  readonly publishedOnly: boolean;
  readonly sort: "created_at" | "updated_at" | "sort_order" | "published_at";
  readonly dir: "asc" | "desc";
}): Promise<{
  readonly items: readonly TeamMemberWithSocialsRow[];
  readonly total: number;
}> {
  const sortColumn = teamSortColumn(input.sort);
  const dir = input.dir === "asc" ? "ASC" : "DESC";
  const params: unknown[] = [];
  const where: string[] = [];

  if (input.publishedOnly) {
    where.push("published_at IS NOT NULL");
  }
  if (input.q !== undefined && input.q.length > 0) {
    params.push(`%${input.q}%`);
    where.push(
      `(name ILIKE $${params.length} OR role_title ILIKE $${params.length} OR bio ILIKE $${params.length})`,
    );
  }

  const whereSql = where.length > 0 ? `WHERE ${where.join(" AND ")}` : "";
  params.push(input.limit);
  const limitIdx = params.length;
  params.push(input.offset);
  const offsetIdx = params.length;

  const result = await query(
    `
      SELECT ${TEAM_MEMBER_COLUMNS}, COUNT(*) OVER()::int AS total_count
      FROM team_members_active
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

  const members = result.rows.map((row) => parseRow(teamMemberRowSchema, row));
  const socials = await listSocialsForMembers(members.map((m) => m.id));

  return {
    items: attachSocials(members, socials),
    total,
  };
}

export async function getActiveTeamMemberById(
  id: string,
): Promise<TeamMemberWithSocialsRow | null> {
  const result = await query(
    `
      SELECT ${TEAM_MEMBER_COLUMNS}
      FROM team_members_active
      WHERE id = $1
      LIMIT 1
    `,
    [id],
  );

  const row = result.rows[0];
  if (row === undefined) {
    return null;
  }

  const member = parseRow(teamMemberRowSchema, row);
  const socials = await listSocialsForMembers([member.id]);
  const [withSocials] = attachSocials([member], socials);
  if (withSocials === undefined) {
    throw new InternalError("Team member assembly failed");
  }
  return withSocials;
}

async function replaceSocials(
  client: DbQueryable,
  teamMemberId: string,
  socials: readonly TeamMemberSocialInsert[],
): Promise<readonly TeamMemberSocialRow[]> {
  await query(
    `DELETE FROM team_member_socials WHERE team_member_id = $1`,
    [teamMemberId],
    client,
  );

  if (socials.length === 0) {
    return [];
  }

  for (const social of socials) {
    const socialId = await nextUuidv7(client);
    await query(
      `
        INSERT INTO team_member_socials (
          id, team_member_id, network, label, href
        )
        VALUES ($1, $2, $3, $4, $5)
      `,
      [socialId, teamMemberId, social.network, social.label, social.href],
      client,
    );
  }

  return listSocialsForMembers([teamMemberId], client);
}

export async function insertTeamMember(
  input: TeamMemberInsert,
): Promise<TeamMemberWithSocialsRow> {
  return withTransaction(async (client) => {
    const id = await nextUuidv7(client);

    await query(
      `
        INSERT INTO team_members (
          id, name, role_title, bio, image_path, employee_id, sort_order, published_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `,
      [
        id,
        input.name,
        input.roleTitle,
        input.bio,
        input.imagePath,
        input.employeeId,
        input.sortOrder,
        input.publishedAt,
      ],
      client,
    );

    const result = await query(
      `
        SELECT ${TEAM_MEMBER_COLUMNS}
        FROM team_members_active
        WHERE id = $1
        LIMIT 1
      `,
      [id],
      client,
    );

    const row = result.rows[0];
    if (row === undefined) {
      throw new InternalError("Team member not visible after write");
    }

    const member = parseRow(teamMemberRowSchema, row);
    const socials = await replaceSocials(client, member.id, input.socials);

    return {
      ...member,
      socials: [...socials],
    };
  });
}

export async function updateTeamMember(
  input: TeamMemberUpdate,
): Promise<TeamMemberWithSocialsRow | null> {
  return withTransaction(async (client) => {
    const result = await query(
      `
        UPDATE team_members
        SET
          name = $3,
          role_title = $4,
          bio = $5,
          image_path = $6,
          employee_id = $7,
          sort_order = $8,
          published_at = $9,
          version = version + 1,
          updated_at = now()
        WHERE id = $1
          AND version = $2
          AND archived_at IS NULL
      `,
      [
        input.id,
        input.version,
        input.name,
        input.roleTitle,
        input.bio,
        input.imagePath,
        input.employeeId,
        input.sortOrder,
        input.publishedAt,
      ],
      client,
    );

    if ((result.rowCount ?? 0) === 0) {
      return null;
    }

    const read = await query(
      `
        SELECT ${TEAM_MEMBER_COLUMNS}
        FROM team_members_active
        WHERE id = $1
        LIMIT 1
      `,
      [input.id],
      client,
    );

    const row = read.rows[0];
    if (row === undefined) {
      throw new InternalError("Team member not visible after write");
    }

    const member = parseRow(teamMemberRowSchema, row);
    const socials = await replaceSocials(client, member.id, input.socials);

    return {
      ...member,
      socials: [...socials],
    };
  });
}

export async function reorderTeamMembers(
  items: readonly TeamMemberReorderItem[],
  client: DbQueryable,
): Promise<boolean> {
  for (const item of items) {
    const result = await query(
      `
        UPDATE team_members
        SET
          sort_order = $3,
          version = version + 1,
          updated_at = now()
        WHERE id = $1
          AND version = $2
          AND archived_at IS NULL
      `,
      [item.id, item.version, item.sortOrder],
      client,
    );

    if ((result.rowCount ?? 0) === 0) {
      return false;
    }
  }

  return true;
}

export async function archiveTeamMember(input: {
  readonly id: string;
  readonly version: number;
}): Promise<boolean> {
  const result = await query(
    `
      UPDATE team_members
      SET
        archived_at = now(),
        version = version + 1,
        updated_at = now()
      WHERE id = $1
        AND version = $2
        AND archived_at IS NULL
    `,
    [input.id, input.version],
  );

  return (result.rowCount ?? 0) > 0;
}

export async function restoreTeamMember(
  input: { readonly id: string; readonly version: number },
): Promise<TeamMemberWithSocialsRow | null> {
  const result = await query(
    `
      UPDATE team_members
      SET
        archived_at = NULL,
        version = version + 1,
        updated_at = now()
      WHERE id = $1
        AND version = $2
        AND archived_at IS NOT NULL
      RETURNING id
    `,
    [input.id, input.version],
  );

  const id = (result.rows[0] as { id: string } | undefined)?.id;
  if (id === undefined) {
    return null;
  }

  return getActiveTeamMemberById(id);
}

export async function getTeamMemberByIdFromBase(
  id: string,
): Promise<TeamMemberRow | null> {
  const result = await query(
    `
      SELECT ${TEAM_MEMBER_COLUMNS}
      FROM team_members
      WHERE id = $1
      LIMIT 1
    `,
    [id],
  );

  const row = result.rows[0];
  if (row === undefined) {
    return null;
  }

  return parseRow(teamMemberRowSchema, row);
}
