import type { Actor } from "@jumpifzero/contracts";
import { ForbiddenError } from "../lib/errors.ts";
import {
  decryptTaxId,
  encryptTaxId,
  maskTaxId,
} from "../lib/secrets.ts";
import { insertTaxIdAccessAudit } from "../repositories/tax-id-access-audit.ts";
import { findActiveUserById } from "../repositories/users.ts";

export function sealTaxId(plaintext: string): Buffer {
  return encryptTaxId(plaintext);
}

export function maskedTaxIdFromCiphertext(ciphertext: Buffer): string {
  return maskTaxId(decryptTaxId(ciphertext));
}

export async function readFullTaxId(input: {
  readonly actor: Actor;
  readonly ciphertext: Buffer;
  readonly carrierId: string | null;
  readonly carrierUsDot: string;
  readonly carrierMc: string;
  readonly carrierLegalName: string;
  readonly correlationId: string;
}): Promise<string> {
  if (input.actor.role !== "admin" && input.actor.role !== "employee") {
    throw new ForbiddenError();
  }
  if (
    input.actor.role === "employee" &&
    input.actor.employeeKind !== "sales"
  ) {
    throw new ForbiddenError();
  }

  const viewer = await findActiveUserById(input.actor.subjectId);
  if (viewer === null) {
    throw new ForbiddenError();
  }

  const plaintext = decryptTaxId(input.ciphertext);

  await insertTaxIdAccessAudit({
    carrierId: input.carrierId,
    carrierUsDot: input.carrierUsDot,
    carrierMc: input.carrierMc,
    carrierLegalName: input.carrierLegalName,
    viewerUserId: viewer.id,
    viewerRole: viewer.role,
    viewerEmail: viewer.email,
    correlationId: input.correlationId,
  });

  return plaintext;
}
