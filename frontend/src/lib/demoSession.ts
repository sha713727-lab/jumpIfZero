export const DEMO_SESSION_KEY = "jz_demo_customer_session";

export type DemoSession = {
  readonly customerId: string;
  readonly signedInAt: string;
};

export function readDemoSession(): DemoSession | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.sessionStorage.getItem(DEMO_SESSION_KEY);

  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as DemoSession;

    if (
      typeof parsed.customerId !== "string" ||
      typeof parsed.signedInAt !== "string"
    ) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export function writeDemoSession(customerId: string): void {
  const session: DemoSession = {
    customerId,
    signedInAt: new Date().toISOString(),
  };

  window.sessionStorage.setItem(DEMO_SESSION_KEY, JSON.stringify(session));
}

export function clearDemoSession(): void {
  window.sessionStorage.removeItem(DEMO_SESSION_KEY);
}
