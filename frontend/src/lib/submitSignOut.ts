"use server";

import { assertSameOrigin } from "@/lib/assertSameOrigin";
import {
  clearSession,
  requireSession,
  type SessionRole,
} from "@/lib/session";

export async function submitSignOut(role: SessionRole): Promise<void> {
  await assertSameOrigin();
  await requireSession(role);
  await clearSession(role);
}
