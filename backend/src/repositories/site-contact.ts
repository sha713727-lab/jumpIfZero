import {
  siteContactRowSchema,
  type SiteContactRow,
} from "@jumpifzero/contracts";
import type { DbQueryable } from "../db/query.ts";
import { query } from "../db/query.ts";
import { parseRow } from "./_parse.ts";

const SITE_CONTACT_COLUMNS = `
  id, singleton_key, email, phone, phone_href,
  address_label, address_line_1, address_line_2, address_line_3,
  location_lede, map_embed_url, version, created_at, updated_at
`;

export async function getSiteContact(
  client?: DbQueryable,
): Promise<SiteContactRow | null> {
  const result = await query(
    `
      SELECT ${SITE_CONTACT_COLUMNS}
      FROM site_contact
      WHERE singleton_key = 'default'
      LIMIT 1
    `,
    [],
    client,
  );
  const row = result.rows[0];
  if (row === undefined) {
    return null;
  }
  return parseRow(siteContactRowSchema, row);
}

export async function updateSiteContact(
  input: {
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
  },
  client?: DbQueryable,
): Promise<SiteContactRow | null> {
  const result = await query(
    `
      UPDATE site_contact
      SET
        email = $2,
        phone = $3,
        phone_href = $4,
        address_label = $5,
        address_line_1 = $6,
        address_line_2 = $7,
        address_line_3 = $8,
        location_lede = $9,
        map_embed_url = $10,
        version = version + 1,
        updated_at = now()
      WHERE singleton_key = 'default'
        AND version = $1
      RETURNING id
    `,
    [
      input.version,
      input.email,
      input.phone,
      input.phoneHref,
      input.addressLabel,
      input.addressLine1,
      input.addressLine2,
      input.addressLine3,
      input.locationLede,
      input.mapEmbedUrl,
    ],
    client,
  );
  const id = result.rows[0]?.id;
  if (typeof id !== "string") {
    return null;
  }
  return getSiteContact(client);
}
