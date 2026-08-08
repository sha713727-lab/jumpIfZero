"use server";

import type { CustomerPortalBootstrap } from "@/lib/data/customerPortal";
import {
  loadCustomerFilesBootstrap,
  loadCustomerInvoicesBootstrap,
  loadCustomerMessagesBootstrap,
  loadCustomerPortalBootstrap,
  loadCustomerProjectsBootstrap,
  loadCustomerShellBootstrap,
} from "@/lib/data/customerPortal";
import { actorSchema } from "@jumpifzero/contracts/content";
import { requireSession } from "@/lib/session";

export type CustomerDomain =
  | "home"
  | "projects"
  | "invoices"
  | "messages"
  | "files"
  | "shell";

async function customerActor() {
  const session = await requireSession("customer");
  return actorSchema.parse({
    subjectId: session.subjectId,
    role: "client",
    employeeKind: null,
  });
}

export async function loadCustomerDomainAction(
  domain: CustomerDomain,
): Promise<CustomerPortalBootstrap> {
  const actor = await customerActor();
  if (domain === "home") {
    return loadCustomerPortalBootstrap(actor);
  }
  if (domain === "projects") {
    return loadCustomerProjectsBootstrap(actor);
  }
  if (domain === "invoices") {
    return loadCustomerInvoicesBootstrap(actor);
  }
  if (domain === "messages") {
    return loadCustomerMessagesBootstrap(actor);
  }
  if (domain === "files") {
    return loadCustomerFilesBootstrap(actor);
  }
  return loadCustomerShellBootstrap(actor);
}
