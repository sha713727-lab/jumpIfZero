import type { EmployeeKind } from "@/constants/adminDemo";

export type EmployeeNavId =
  | "overview"
  | "projects"
  | "clients"
  | "messages"
  | "files"
  | "sales"
  | "leads"
  | "profile";

export type EmployeeNavItem = {
  readonly id: EmployeeNavId;
  readonly name: string;
  readonly href: string;
};

const deliveryNav: readonly EmployeeNavItem[] = [
  { id: "overview", name: "Overview", href: "/employee" },
  { id: "projects", name: "Projects", href: "/employee/projects" },
  { id: "clients", name: "Clients", href: "/employee/clients" },
  { id: "messages", name: "Messages", href: "/employee/messages" },
  { id: "files", name: "Files", href: "/employee/files" },
  { id: "profile", name: "Profile", href: "/employee/profile" },
] as const;

const salesNav: readonly EmployeeNavItem[] = [
  { id: "overview", name: "Overview", href: "/employee" },
  { id: "sales", name: "Sales", href: "/employee/sales" },
  { id: "leads", name: "Leads", href: "/employee/leads" },
  { id: "messages", name: "Messages", href: "/employee/messages" },
  { id: "profile", name: "Profile", href: "/employee/profile" },
] as const;

export function employeeNavForKind(
  kind: EmployeeKind,
): readonly EmployeeNavItem[] {
  return kind === "sales" ? salesNav : deliveryNav;
}

export const deliveryPathPrefixes = [
  "/employee/projects",
  "/employee/clients",
  "/employee/files",
] as const;

export const salesPathPrefixes = [
  "/employee/sales",
  "/employee/leads",
] as const;

export function isPathAllowedForKind(
  pathname: string,
  kind: EmployeeKind,
): boolean {
  if (
    pathname === "/employee" ||
    pathname === "/employee/profile" ||
    pathname === "/employee/messages" ||
    pathname.startsWith("/employee/profile") ||
    pathname.startsWith("/employee/messages")
  ) {
    return true;
  }

  if (kind === "sales") {
    return salesPathPrefixes.some(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
    );
  }

  return deliveryPathPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export const employeeOverviewCopy = {
  welcome: "Welcome back",
  deliveryLede: "Your assigned clients, projects, and conversations.",
  salesLede: "Your sales, leads, follow-ups, and team chat.",
  signOut: "Sign out",
} as const;
