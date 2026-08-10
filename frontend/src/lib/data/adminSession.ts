import { cache } from "react";
import { actorSchema, type Actor } from "@jumpifzero/contracts/content";
import { adminInitialsFromName } from "@/constants/adminAuth";
import type { AdminIdentity } from "@/components/admin/AdminProvider";
import { getAdminMe } from "@/lib/data/adminOperations";
import { requireSession } from "@/lib/session";

export const requireAdminActor = cache(async function requireAdminActor(): Promise<{
  readonly actor: Actor;
  readonly identity: AdminIdentity;
}> {
  const session = await requireSession("admin");
  const actor = actorSchema.parse({
    subjectId: session.subjectId,
    role: "admin",
    employeeKind: null,
  });
  let image = "";
  try {
    const profile = await getAdminMe(actor);
    image = profile.imagePath;
  } catch {
    image = "";
  }
  return {
    actor,
    identity: {
      name: session.name,
      email: session.email,
      initials: adminInitialsFromName(session.name),
      image,
    },
  };
});
