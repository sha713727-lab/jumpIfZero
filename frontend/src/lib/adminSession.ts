export const ADMIN_SESSION_KEY = "jz_demo_admin_session";

export type AdminSession = {
  readonly adminId: string;
  readonly signedInAt: string;
};

export function readAdminSession(): AdminSession | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.sessionStorage.getItem(ADMIN_SESSION_KEY);

  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as AdminSession;

    if (
      typeof parsed.adminId !== "string" ||
      typeof parsed.signedInAt !== "string"
    ) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export function writeAdminSession(adminId: string): void {
  const session: AdminSession = {
    adminId,
    signedInAt: new Date().toISOString(),
  };

  window.sessionStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));
}

export function clearAdminSession(): void {
  window.sessionStorage.removeItem(ADMIN_SESSION_KEY);
}
