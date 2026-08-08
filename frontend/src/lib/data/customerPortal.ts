import {
  clientPublicSchema,
  filePublicSchema,
  filesListResponseSchema,
  invoicesListResponseSchema,
  messagePublicSchema,
  messagesListResponseSchema,
  projectsListResponseSchema,
  userPublicSchema,
  type Actor,
  type ClientPublic,
  type FilePublic,
  type InvoicePublic,
  type MessagePublic,
  type ProjectPublic,
  type UserPublic,
} from "@jumpifzero/contracts";
import { backendRequest } from "@/lib/backend/client";
import type {
  CustomerClient,
  CustomerFile,
  CustomerInvoice,
  CustomerMessage,
  CustomerPortalBootstrap,
  CustomerProject,
  CustomerShell,
  CustomerUser,
  InvoiceStatus,
} from "@/lib/data/customerPortalTypes";

export type {
  CustomerActivity,
  CustomerClient,
  CustomerFile,
  CustomerInvoice,
  CustomerMessage,
  CustomerMetric,
  CustomerPortalBootstrap,
  CustomerProject,
  CustomerShell,
  CustomerUser,
  InvoiceStatus,
} from "@/lib/data/customerPortalTypes";

export {
  buildCustomerMetrics,
  buildRecentActivity,
} from "@/lib/data/customerPortalView";

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function formatMemberSince(value: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function formatRelativeTime(value: string): string {
  const date = new Date(value);
  const diffMs = Date.now() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  if (diffHours < 1) {
    return "Just now";
  }
  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) {
    return "Yesterday";
  }
  if (diffDays < 7) {
    return `${diffDays} days ago`;
  }
  return formatDate(value);
}

function formatMoney(amount: string, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(Number(amount));
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function initialsFrom(name: string): string {
  const parts = name.trim().split(/\s+/).filter((part) => part.length > 0);
  if (parts.length === 0) {
    return "?";
  }
  if (parts.length === 1) {
    return parts[0]!.slice(0, 2).toUpperCase();
  }
  return `${parts[0]!.slice(0, 1)}${parts[1]!.slice(0, 1)}`.toUpperCase();
}

function fileTypeLabel(contentType: string, kind: string): string {
  if (kind.length > 0) {
    return kind.toUpperCase();
  }
  const part = contentType.split("/")[1];
  if (part) {
    return part.split("+")[0]!.toUpperCase();
  }
  return "FILE";
}

function projectStatusLabel(
  code: ProjectPublic["statusCode"],
): CustomerProject["status"] {
  if (code === "in_progress") {
    return "In progress";
  }
  if (code === "approved") {
    return "Review";
  }
  if (code === "completed") {
    return "Completed";
  }
  return "Requested";
}

function invoiceStatusLabel(code: InvoicePublic["statusCode"]): InvoiceStatus {
  if (code === "paid") {
    return "Paid";
  }
  if (code === "sent") {
    return "Due";
  }
  return "Open";
}

function senderDisplay(role: MessagePublic["senderRole"]): {
  readonly from: string;
  readonly role: string;
} {
  if (role === "client") {
    return { from: "You", role: "Customer" };
  }
  if (role === "employee") {
    return { from: "JZ Team", role: "Delivery" };
  }
  return { from: "JZ Team", role: "Account" };
}

export function toCustomerUser(row: UserPublic): CustomerUser {
  return {
    id: row.id,
    name: row.name,
    title: row.title ?? "",
    email: row.email,
    version: row.version,
  };
}

export function toCustomerClient(row: ClientPublic): CustomerClient {
  return {
    id: row.id,
    company: row.company,
    phone: row.phone,
    location: row.location,
    clientContactTitle: row.clientContactTitle,
    plan: row.plan,
    memberSince: row.memberSince,
    statusCode: row.statusCode,
    version: row.version,
  };
}

export function toCustomerShell(
  user: CustomerUser,
  client: CustomerClient,
): CustomerShell {
  return {
    name: user.name,
    company: client.company,
    initials: initialsFrom(user.name),
    email: user.email,
    plan: client.plan,
    memberSince: formatMemberSince(client.memberSince),
    status: client.statusCode === "active" ? "Active" : "Paused",
  };
}

export function toCustomerProject(row: ProjectPublic): CustomerProject {
  const milestone =
    row.nextMilestone.trim().length > 0 ? row.nextMilestone : "—";
  const milestoneDate =
    row.nextMilestoneDate === null
      ? milestone
      : `${milestone} · ${formatDate(row.nextMilestoneDate)}`;

  return {
    id: row.id,
    name: row.title,
    service: "Project",
    status: projectStatusLabel(row.statusCode),
    progress: row.progress,
    manager: row.managerEmployeeId === null ? "—" : "JZ Team",
    updated: formatRelativeTime(row.updatedAt),
    updatedAt: row.updatedAt,
    nextMilestone: milestoneDate,
  };
}

export function toCustomerInvoice(row: InvoicePublic): CustomerInvoice {
  return {
    id: row.id,
    number: row.number,
    title: row.title,
    amount: formatMoney(row.amount, row.currency),
    issued: row.issuedOn === null ? "—" : formatDate(row.issuedOn),
    issuedOn: row.issuedOn,
    due: row.dueDate === null ? "—" : formatDate(row.dueDate),
    status: invoiceStatusLabel(row.statusCode),
  };
}

export function toCustomerMessage(row: MessagePublic): CustomerMessage {
  const sender = senderDisplay(row.senderRole);
  const attachments = row.attachments.map((item) => ({
    fileId: item.fileId,
    name: item.originalName,
    contentType: item.contentType,
    sizeBytes: item.sizeBytes,
  }));
  const preview =
    row.body.trim().length > 0
      ? row.body
      : attachments.length > 0
        ? attachments.map((item) => item.name).join(", ")
        : "";
  return {
    id: row.id,
    from: sender.from,
    role: sender.role,
    preview,
    body: row.body,
    time: formatRelativeTime(row.createdAt),
    createdAt: row.createdAt,
    unread: row.readAt === null && row.senderRole !== "client",
    senderRole: row.senderRole,
    attachments,
  };
}

export function toCustomerFile(row: FilePublic): CustomerFile {
  return {
    id: row.id,
    name: row.originalName,
    type: fileTypeLabel(row.contentType, row.kind),
    size: formatFileSize(row.sizeBytes),
    uploaded: formatDate(row.createdAt),
    project: "",
  };
}

export async function getOwnClient(actor: Actor): Promise<ClientPublic> {
  return backendRequest({
    method: "GET",
    path: "/clients/me",
    actor,
    outputSchema: clientPublicSchema,
  });
}

export async function getOwnUser(actor: Actor): Promise<UserPublic> {
  return backendRequest({
    method: "GET",
    path: "/users/me",
    actor,
    outputSchema: userPublicSchema,
  });
}

export async function updateOwnUser(
  actor: Actor,
  input: { readonly version: number; readonly name: string; readonly title: string | null },
): Promise<CustomerUser> {
  const row = await backendRequest({
    method: "PATCH",
    path: "/users/me",
    body: input,
    actor,
    outputSchema: userPublicSchema,
  });
  return toCustomerUser(row);
}

export async function updateOwnClient(
  actor: Actor,
  input: {
    readonly version: number;
    readonly company: string;
    readonly phone: string;
    readonly clientContactTitle: string;
    readonly location: string;
  },
): Promise<CustomerClient> {
  const row = await backendRequest({
    method: "PATCH",
    path: "/clients/me",
    body: input,
    actor,
    outputSchema: clientPublicSchema,
  });
  return toCustomerClient(row);
}

export async function createCustomerMessage(
  actor: Actor,
  input: {
    readonly clientId: string;
    readonly body: string;
    readonly fileIds?: readonly string[];
  },
): Promise<CustomerMessage> {
  const row = await backendRequest({
    method: "POST",
    path: "/messages",
    body: {
      clientId: input.clientId,
      body: input.body,
      ...(input.fileIds !== undefined && input.fileIds.length > 0
        ? { fileIds: [...input.fileIds] }
        : {}),
    },
    actor,
    outputSchema: messagePublicSchema,
  });
  return toCustomerMessage(row);
}

export async function markCustomerMessageRead(
  actor: Actor,
  id: string,
): Promise<CustomerMessage> {
  const row = await backendRequest({
    method: "POST",
    path: `/messages/${id}/read`,
    actor,
    outputSchema: messagePublicSchema,
  });
  return toCustomerMessage(row);
}

export async function archiveCustomerFile(
  actor: Actor,
  id: string,
): Promise<void> {
  await backendRequest({
    method: "POST",
    path: `/files/${id}/archive`,
    actor,
    outputSchema: filePublicSchema,
  });
}

export async function loadCustomerIdentity(
  actor: Actor,
): Promise<{
  readonly user: CustomerUser;
  readonly client: CustomerClient;
  readonly shell: CustomerShell;
  readonly clientId: string;
}> {
  const [clientRow, userRow] = await Promise.all([
    getOwnClient(actor),
    getOwnUser(actor),
  ]);
  const user = toCustomerUser(userRow);
  const client = toCustomerClient(clientRow);
  return {
    user,
    client,
    shell: toCustomerShell(user, client),
    clientId: clientRow.id,
  };
}

export async function loadCustomerPortalBootstrap(
  actor: Actor,
): Promise<CustomerPortalBootstrap> {
  const identity = await loadCustomerIdentity(actor);
  const clientId = identity.clientId;

  const [projectsResponse, invoicesResponse, messagesResponse, filesResponse] =
    await Promise.all([
      backendRequest({
        method: "GET",
        path: "/projects",
        query: { limit: "100", clientId },
        actor,
        outputSchema: projectsListResponseSchema,
      }),
      backendRequest({
        method: "GET",
        path: "/invoices",
        query: { limit: "100", clientId },
        actor,
        outputSchema: invoicesListResponseSchema,
      }),
      backendRequest({
        method: "GET",
        path: "/messages",
        query: { limit: "100", clientId, dir: "asc" },
        actor,
        outputSchema: messagesListResponseSchema,
      }),
      backendRequest({
        method: "GET",
        path: "/files",
        query: { limit: "100", clientId },
        actor,
        outputSchema: filesListResponseSchema,
      }),
    ]);

  return {
    user: identity.user,
    client: identity.client,
    shell: identity.shell,
    projects: projectsResponse.items.map(toCustomerProject),
    invoices: invoicesResponse.items.map(toCustomerInvoice),
    messages: [...messagesResponse.items]
      .sort(
        (left, right) =>
          new Date(left.createdAt).getTime() -
          new Date(right.createdAt).getTime(),
      )
      .map(toCustomerMessage),
    files: filesResponse.items.map(toCustomerFile),
  };
}

export async function loadCustomerProjectsBootstrap(
  actor: Actor,
): Promise<CustomerPortalBootstrap> {
  const identity = await loadCustomerIdentity(actor);
  const response = await backendRequest({
    method: "GET",
    path: "/projects",
    query: { limit: "100", clientId: identity.clientId },
    actor,
    outputSchema: projectsListResponseSchema,
  });
  return {
    ...identity,
    projects: response.items.map(toCustomerProject),
    invoices: [],
    messages: [],
    files: [],
  };
}

export async function loadCustomerInvoicesBootstrap(
  actor: Actor,
): Promise<CustomerPortalBootstrap> {
  const identity = await loadCustomerIdentity(actor);
  const response = await backendRequest({
    method: "GET",
    path: "/invoices",
    query: { limit: "100", clientId: identity.clientId },
    actor,
    outputSchema: invoicesListResponseSchema,
  });
  return {
    ...identity,
    projects: [],
    invoices: response.items.map(toCustomerInvoice),
    messages: [],
    files: [],
  };
}

export async function loadCustomerMessagesBootstrap(
  actor: Actor,
): Promise<CustomerPortalBootstrap> {
  const identity = await loadCustomerIdentity(actor);
  const response = await backendRequest({
    method: "GET",
    path: "/messages",
    query: { limit: "100", clientId: identity.clientId, dir: "asc" },
    actor,
    outputSchema: messagesListResponseSchema,
  });
  return {
    ...identity,
    projects: [],
    invoices: [],
    messages: [...response.items]
      .sort(
        (left, right) =>
          new Date(left.createdAt).getTime() -
          new Date(right.createdAt).getTime(),
      )
      .map(toCustomerMessage),
    files: [],
  };
}

export async function loadCustomerFilesBootstrap(
  actor: Actor,
): Promise<CustomerPortalBootstrap> {
  const identity = await loadCustomerIdentity(actor);
  const response = await backendRequest({
    method: "GET",
    path: "/files",
    query: { limit: "100", clientId: identity.clientId },
    actor,
    outputSchema: filesListResponseSchema,
  });
  return {
    ...identity,
    projects: [],
    invoices: [],
    messages: [],
    files: response.items.map(toCustomerFile),
  };
}

export async function loadCustomerShellBootstrap(
  actor: Actor,
): Promise<CustomerPortalBootstrap> {
  const identity = await loadCustomerIdentity(actor);
  return {
    ...identity,
    projects: [],
    invoices: [],
    messages: [],
    files: [],
  };
}
