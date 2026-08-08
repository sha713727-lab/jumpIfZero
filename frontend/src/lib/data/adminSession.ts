import { cache } from "react";
import { actorSchema, type Actor } from "@jumpifzero/contracts/content";
import { adminInitialsFromName } from "@/constants/adminAuth";
import type { AdminIdentity } from "@/components/admin/AdminProvider";
import { requireSession } from "@/lib/session";

export const requireAdminActor = cache(async function requireAdminActor(): Promise<{
  readonly actor: Actor;
  readonly identity: AdminIdentity;
}> {
  const session = await requireSession("admin");
  return {
    actor: actorSchema.parse({
      subjectId: session.subjectId,
      role: "admin",
      employeeKind: null,
    }),
    identity: {
      name: session.name,
      email: session.email,
      initials: adminInitialsFromName(session.name),
    },
  };
});
