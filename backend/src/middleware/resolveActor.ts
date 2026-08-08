import { env } from "../config/env.ts";
import { UnauthorizedError } from "../lib/errors.ts";
import { resolveActorFromDatabase } from "../services/authz.ts";
import type { Middleware } from "./context.ts";

export const resolveActor: Middleware = async (ctx) => {
  if (ctx.hmacClaim === null) {
    throw new UnauthorizedError();
  }

  const claim = ctx.hmacClaim;

  if (claim.role === "gateway") {
    if (claim.subjectId !== env.HMAC_GATEWAY_SUBJECT_ID) {
      throw new UnauthorizedError();
    }
    ctx.isGateway = true;
    ctx.actor = null;
    return;
  }

  ctx.isGateway = false;
  ctx.actor = await resolveActorFromDatabase({
    subjectId: claim.subjectId,
    role: claim.role,
    employeeKind: claim.employeeKind,
  });
};
