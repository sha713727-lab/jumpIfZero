import { requireEmployeeKind } from "@/lib/auth/requireEmployeeAccess";

export default async function EmployeeFilesLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await requireEmployeeKind("delivery");
  return children;
}
