"use server";

import { actorSchema } from "@jumpifzero/contracts/content";
import type { EmployeeCrmBootstrap } from "@/lib/data/adminCrmBootstrap";
import { loadEmployeeCrmBootstrap } from "@/lib/data/adminCrmBootstrap";
import type { EmployeeDeliveryBootstrap } from "@/lib/data/employeeDeliveryBootstrap";
import { loadEmployeeDeliveryBootstrap } from "@/lib/data/employeeDeliveryBootstrap";
import { requireEmployeeSession } from "@/lib/auth/requireEmployeeAccess";

export type EmployeeDomain = "crm" | "delivery";

export async function loadEmployeeDomainAction(
  domain: EmployeeDomain,
): Promise<EmployeeCrmBootstrap | EmployeeDeliveryBootstrap> {
  const access = await requireEmployeeSession();
  const actor = actorSchema.parse({
    subjectId: access.session.subjectId,
    role: "employee",
    employeeKind: access.kind,
  });
  if (domain === "crm") {
    return loadEmployeeCrmBootstrap(actor, access.employeeId);
  }
  return loadEmployeeDeliveryBootstrap(actor, access.employeeId);
}
