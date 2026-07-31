import { requireEmployeeKind } from "@/lib/auth/requireEmployeeAccess";

export default async function EmployeeClientsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await requireEmployeeKind("delivery");
  return children;
}
