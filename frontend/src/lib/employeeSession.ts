export const EMPLOYEE_SESSION_KEY = "jz_demo_employee_session";

export type EmployeeSession = {
  readonly employeeId: string;
  readonly signedInAt: string;
};

export function readEmployeeSession(): EmployeeSession | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.sessionStorage.getItem(EMPLOYEE_SESSION_KEY);

  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as EmployeeSession;

    if (
      typeof parsed.employeeId !== "string" ||
      typeof parsed.signedInAt !== "string"
    ) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export function writeEmployeeSession(employeeId: string): void {
  const session: EmployeeSession = {
    employeeId,
    signedInAt: new Date().toISOString(),
  };

  window.sessionStorage.setItem(EMPLOYEE_SESSION_KEY, JSON.stringify(session));
}

export function clearEmployeeSession(): void {
  window.sessionStorage.removeItem(EMPLOYEE_SESSION_KEY);
}
