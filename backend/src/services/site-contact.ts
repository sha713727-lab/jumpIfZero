import {
  siteContactPublicSchema,
  siteContactUpdateSchema,
  type Actor,
  type SiteContactPublic,
  type SiteContactRow,
} from "@jumpifzero/contracts";
import { audit } from "../lib/audit.ts";
import { ConflictError, NotFoundError } from "../lib/errors.ts";
import * as siteContactRepo from "../repositories/site-contact.ts";
import { parseInput, requireAdmin } from "./_helpers.ts";

function toPublic(row: SiteContactRow): SiteContactPublic {
  const lines = [
    row.address_line_1,
    row.address_line_2,
    row.address_line_3,
  ].filter((line) => line.trim().length > 0);
  return siteContactPublicSchema.parse({
    id: row.id,
    email: row.email,
    phone: row.phone,
    phoneHref: row.phone_href,
    addressLabel: row.address_label,
    addressLines: lines,
    locationLede: row.location_lede,
    mapEmbedUrl: row.map_embed_url,
    version: row.version,
    updatedAt: row.updated_at.toISOString(),
  });
}

function normalizePhoneHref(phone: string, phoneHref: string): string {
  const trimmed = phoneHref.trim();
  if (trimmed.length > 0) {
    return trimmed;
  }
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 0) {
    return "";
  }
  return `tel:+${digits}`;
}

export async function getSiteContact(): Promise<SiteContactPublic> {
  const row = await siteContactRepo.getSiteContact();
  if (row === null) {
    throw new NotFoundError("Site contact not found");
  }
  return toPublic(row);
}

export async function updateSiteContact(
  actor: Actor,
  input: unknown,
  correlationId: string,
): Promise<SiteContactPublic> {
  requireAdmin(actor);
  const body = parseInput(siteContactUpdateSchema, input);
  const updated = await siteContactRepo.updateSiteContact({
    version: body.version,
    email: body.email,
    phone: body.phone,
    phoneHref: normalizePhoneHref(body.phone, body.phoneHref),
    addressLabel: body.addressLabel,
    addressLine1: body.addressLine1,
    addressLine2: body.addressLine2,
    addressLine3: body.addressLine3,
    locationLede: body.locationLede,
    mapEmbedUrl: body.mapEmbedUrl,
  });
  if (updated === null) {
    const existing = await siteContactRepo.getSiteContact();
    if (existing === null) {
      throw new NotFoundError("Site contact not found");
    }
    throw new ConflictError("Site contact version conflict");
  }
  audit({
    action: "site_contact.update",
    correlationId,
    actorSubjectId: actor.subjectId,
    route: "content.site-contact.update",
  });
  return toPublic(updated);
}
