"use server";

import {
  clearSession,
  requireSession,
  type SessionRole,
} from "@/lib/session";

export async function submitSignOut(role: SessionRole): Promise<void> {
  await requireSession(role);
  await clearSession();
}
