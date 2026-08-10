import {
  assignmentsListResponseSchema,
  clientPublicSchema,
  clientsListResponseSchema,
  filePublicSchema,
  filesListResponseSchema,
  invoicePublicSchema,
  invoicesListResponseSchema,
  messagePublicSchema,
  messagesListResponseSchema,
  passwordChangeResponseSchema,
  projectPublicSchema,
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
import { env } from "@/lib/env";
import { signBackendRequest } from "@/lib/backend/hmacSign";
import type {
  AdminClient,
  AdminFile,
  AdminInvoice,
  AdminMessage,
  AdminProject,
} from "@jumpifzero/contracts/admin";
import { backendRequest, BackendRequestError } from "@/lib/backend/client";

function formatUpdatedAt(value: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function initialsFrom(name: string): string {
  const parts = name.trim().split(/\s+/).filter((p) => p.length > 0);
  if (parts.length === 0) {
    return "?";
  }
  if (parts.length === 1) {
    return parts[0]!.slice(0, 2).toUpperCase();
  }
  return `${parts[0]!.slice(0, 1)}${parts[1]!.slice(0, 1)}`.toUpperCase();
}

export function toAdminClient(row: ClientPublic): AdminClient {
  const name = row.userName ?? row.company;
  return {
    id: row.id,
    userId: row.userId,
    name,
    email: row.userEmail ?? "",
    company: row.company,
    phone: row.phone,
    location: row.location,
    plan: row.plan,
    clientContactTitle: row.clientContactTitle,
    status: row.statusCode,
    initials: initialsFrom(name),
    memberSince: row.memberSince,
    assignedEmployeeIds: row.assignedEmployeeIds ?? [],
    version: row.version,
    updatedAt: formatUpdatedAt(row.updatedAt),
  };
}

export function toAdminProject(
  row: ProjectPublic,
  serviceTitleById: ReadonlyMap<string, string>,
): AdminProject {
  return {
    id: row.id,
    clientId: row.clientId,
    title: row.title,
    service: serviceTitleById.get(row.serviceId) ?? row.serviceId,
    status: row.statusCode,
    notes: row.notes,
    version: row.version,
    updatedAt: formatUpdatedAt(row.updatedAt),
  };
}

export function toAdminInvoice(row: InvoicePublic): AdminInvoice {
  return {
    id: row.id,
    clientId: row.clientId,
    number: row.number,
    title: row.title,
    amount: row.amount,
    billToCompany: row.billToCompany,
    status: row.statusCode,
    version: row.version,
    updatedAt: formatUpdatedAt(row.updatedAt),
  };
}

export async function getAdminInvoice(
  actor: Actor,
  id: string,
): Promise<InvoicePublic> {
  return backendRequest({
    method: "GET",
    path: `/invoices/${id}`,
    actor,
    outputSchema: invoicePublicSchema,
  });
}

export async function getAdminClient(
  actor: Actor,
  id: string,
): Promise<ClientPublic> {
  return backendRequest({
    method: "GET",
    path: `/clients/${id}`,
    actor,
    outputSchema: clientPublicSchema,
  });
}

export function toAdminMessage(row: MessagePublic): AdminMessage {
  return {
    id: row.id,
    clientId: row.clientId,
    from: row.senderRole,
    body: row.body,
    at: formatUpdatedAt(row.createdAt),
    createdAt: row.createdAt,
    read: row.readAt !== null,
    attachments: row.attachments.map((item) => ({
      fileId: item.fileId,
      name: item.originalName,
      contentType: item.contentType,
      sizeBytes: item.sizeBytes,
    })),
  };
}

export function toAdminFile(row: FilePublic): AdminFile {
  return {
    id: row.id,
    clientId: row.clientId,
    name: row.originalName,
    kind: row.kind.length > 0 ? row.kind : row.contentType,
    url: null,
    updatedAt: formatUpdatedAt(row.updatedAt),
  };
}

export async function listAdminClientsLite(
  actor: Actor,
): Promise<AdminClient[]> {
  const response = await backendRequest({
    method: "GET",
    path: "/clients",
    query: { limit: "100" },
    actor,
    outputSchema: clientsListResponseSchema,
  });
  return response.items.map(toAdminClient);
}

export async function listAdminClients(
  actor: Actor,
): Promise<AdminClient[]> {
  const response = await backendRequest({
    method: "GET",
    path: "/clients",
    query: { limit: "100" },
    actor,
    outputSchema: clientsListResponseSchema,
  });
  const detailed = await Promise.all(
    response.items.map(async (item) => {
      const full = await backendRequest({
        method: "GET",
        path: `/clients/${item.id}`,
        actor,
        outputSchema: clientPublicSchema,
      });
      return toAdminClient(full);
    }),
  );
  return detailed;
}

export async function listAdminProjects(
  actor: Actor,
  serviceTitleById: ReadonlyMap<string, string>,
): Promise<AdminProject[]> {
  const response = await backendRequest({
    method: "GET",
    path: "/projects",
    query: { limit: "100" },
    actor,
    outputSchema: projectsListResponseSchema,
  });
  return response.items.map((row) => toAdminProject(row, serviceTitleById));
}

export async function listAdminInvoices(
  actor: Actor,
): Promise<AdminInvoice[]> {
  const response = await backendRequest({
    method: "GET",
    path: "/invoices",
    query: { limit: "100" },
    actor,
    outputSchema: invoicesListResponseSchema,
  });
  return response.items.map(toAdminInvoice);
}

export async function listAdminMessagesForClients(
  actor: Actor,
  clientIds: readonly string[],
): Promise<AdminMessage[]> {
  const batches = await Promise.all(
    clientIds.map(async (clientId) => {
      const response = await backendRequest({
        method: "GET",
        path: "/messages",
        query: { limit: "100", clientId, dir: "asc" },
        actor,
        outputSchema: messagesListResponseSchema,
      });
      return response.items.map(toAdminMessage);
    }),
  );
  return batches.flat();
}

export async function listAdminFilesForClients(
  actor: Actor,
  clientIds: readonly string[],
): Promise<AdminFile[]> {
  const batches = await Promise.all(
    clientIds.map(async (clientId) => {
      const response = await backendRequest({
        method: "GET",
        path: "/files",
        query: { limit: "100", clientId },
        actor,
        outputSchema: filesListResponseSchema,
      });
      return response.items.map(toAdminFile);
    }),
  );
  return batches.flat();
}

export async function putClientAssignments(
  actor: Actor,
  clientId: string,
  employeeIds: readonly string[],
): Promise<void> {
  await backendRequest({
    method: "PUT",
    path: `/clients/${clientId}/assignments`,
    body: { employeeIds: [...employeeIds] },
    actor,
    outputSchema: assignmentsListResponseSchema,
  });
}

export async function changeAdminProjectStatus(
  actor: Actor,
  input: {
    readonly id: string;
    readonly version: number;
    readonly statusCode: "requested" | "approved" | "in_progress" | "completed";
  },
): Promise<AdminProject> {
  const row = await backendRequest({
    method: "POST",
    path: `/projects/${input.id}/status`,
    body: { version: input.version, statusCode: input.statusCode },
    actor,
    outputSchema: projectPublicSchema,
  });
  return toAdminProject(row, new Map());
}

export async function createAdminMessage(
  actor: Actor,
  input: {
    readonly clientId: string;
    readonly body: string;
    readonly fileIds?: readonly string[];
  },
): Promise<AdminMessage> {
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
  return toAdminMessage(row);
}

export async function createAdminInvoice(
  actor: Actor,
  input: {
    readonly clientId: string | null;
    readonly number: string;
    readonly title: string;
    readonly amount: string;
    readonly currency?: string;
    readonly statusCode?: "draft" | "sent" | "paid";
    readonly dueDate?: string | null;
    readonly issuedOn?: string | null;
    readonly billToCompany: string;
    readonly billToName: string;
    readonly billToEmail: string;
    readonly billToPhone: string;
    readonly billToLocation: string;
    readonly fromCompany: string;
    readonly fromEmail: string;
    readonly fromPhone: string;
    readonly idempotencyKey: string;
  },
): Promise<AdminInvoice> {
  const row = await backendRequest({
    method: "POST",
    path: "/invoices",
    body: {
      clientId: input.clientId,
      number: input.number,
      title: input.title,
      amount: input.amount,
      currency: input.currency ?? "USD",
      statusCode: input.statusCode ?? "draft",
      dueDate: input.dueDate ?? null,
      issuedOn: input.issuedOn ?? null,
      billToCompany: input.billToCompany,
      billToName: input.billToName,
      billToEmail: input.billToEmail,
      billToPhone: input.billToPhone,
      billToLocation: input.billToLocation,
      fromCompany: input.fromCompany,
      fromEmail: input.fromEmail,
      fromPhone: input.fromPhone,
    },
    headers: { "Idempotency-Key": input.idempotencyKey },
    actor,
    outputSchema: invoicePublicSchema,
  });
  return toAdminInvoice(row);
}

export async function archiveAdminInvoice(
  actor: Actor,
  input: { readonly id: string; readonly version: number },
): Promise<void> {
  await backendRequest({
    method: "POST",
    path: `/invoices/${input.id}/archive`,
    body: { version: input.version },
    actor,
    outputSchema: invoicePublicSchema,
  });
}

export async function createAdminProject(
  actor: Actor,
  input: {
    readonly clientId: string;
    readonly serviceId: string;
    readonly title: string;
    readonly notes?: string;
  },
  serviceTitleById: ReadonlyMap<string, string>,
): Promise<AdminProject> {
  const row = await backendRequest({
    method: "POST",
    path: "/projects",
    body: {
      clientId: input.clientId,
      serviceId: input.serviceId,
      title: input.title,
      notes: input.notes ?? "",
    },
    actor,
    outputSchema: projectPublicSchema,
  });
  return toAdminProject(row, serviceTitleById);
}

export async function archiveAdminFile(
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

function buildFileMultipartBody(input: {
  readonly boundary: string;
  readonly clientId: string;
  readonly filename: string;
  readonly mimeType: string;
  readonly buffer: Buffer;
  readonly kind: string;
}): Buffer {
  const parts = [
    Buffer.from(
      `--${input.boundary}\r\nContent-Disposition: form-data; name="clientId"\r\n\r\n${input.clientId}\r\n`,
      "utf8",
    ),
    Buffer.from(
      `--${input.boundary}\r\nContent-Disposition: form-data; name="kind"\r\n\r\n${input.kind}\r\n`,
      "utf8",
    ),
    Buffer.from(
      `--${input.boundary}\r\nContent-Disposition: form-data; name="file"; filename="${input.filename}"\r\nContent-Type: ${input.mimeType}\r\n\r\n`,
      "utf8",
    ),
    input.buffer,
    Buffer.from(`\r\n--${input.boundary}--\r\n`, "utf8"),
  ];
  return Buffer.concat(parts);
}

export async function uploadAdminFile(
  actor: Actor,
  input: {
    readonly clientId: string;
    readonly filename: string;
    readonly mimeType: string;
    readonly buffer: Buffer;
    readonly kind?: string;
  },
): Promise<AdminFile> {
  const boundary = `jz${crypto.randomUUID().replaceAll("-", "")}`;
  const rawBody = buildFileMultipartBody({
    boundary,
    clientId: input.clientId,
    filename: input.filename,
    mimeType: input.mimeType,
    buffer: input.buffer,
    kind: input.kind ?? "",
  });
  const url = new URL("/files", `${env.backendBaseUrl}/`);
  const headers = {
    ...signBackendRequest({
      method: "POST",
      url,
      body: rawBody,
      actor,
    }),
    "content-type": `multipart/form-data; boundary=${boundary}`,
  };
  const response = await fetch(url, {
    method: "POST",
    headers,
    body: new Uint8Array(rawBody),
    cache: "no-store",
  });
  const text = await response.text();
  if (!response.ok) {
    throw new BackendRequestError({
      status: response.status,
      code: "upload_failed",
      message: "Upload failed",
      correlationId: "",
    });
  }
  let json: unknown;
  try {
    json = text.length > 0 ? JSON.parse(text) : null;
  } catch {
    throw new BackendRequestError({
      status: 502,
      code: "invalid_response",
      message: "Invalid response",
      correlationId: "",
    });
  }
  const envelope = json as { ok?: boolean; data?: unknown };
  if (envelope.ok !== true) {
    throw new BackendRequestError({
      status: response.status,
      code: "upload_failed",
      message: "Upload failed",
      correlationId: "",
    });
  }
  const row = filePublicSchema.parse(envelope.data);
  return toAdminFile(row);
}

export async function updateAdminProject(
  actor: Actor,
  input: {
    readonly id: string;
    readonly version: number;
    readonly title: string;
    readonly notes: string;
    readonly managerEmployeeId: string | null;
    readonly nextMilestone: string;
    readonly nextMilestoneDate: string | null;
    readonly progress: number;
  },
  serviceTitleById: ReadonlyMap<string, string>,
): Promise<AdminProject> {
  const row = await backendRequest({
    method: "PATCH",
    path: `/projects/${input.id}`,
    body: {
      version: input.version,
      title: input.title,
      notes: input.notes,
      managerEmployeeId: input.managerEmployeeId,
      nextMilestone: input.nextMilestone,
      nextMilestoneDate: input.nextMilestoneDate,
      progress: input.progress,
    },
    actor,
    outputSchema: projectPublicSchema,
  });
  return toAdminProject(row, serviceTitleById);
}

export async function updateAdminProjectNotes(
  actor: Actor,
  input: {
    readonly id: string;
    readonly version: number;
    readonly notes: string;
  },
  serviceTitleById: ReadonlyMap<string, string>,
): Promise<AdminProject> {
  const existing = await backendRequest({
    method: "GET",
    path: `/projects/${input.id}`,
    actor,
    outputSchema: projectPublicSchema,
  });
  return updateAdminProject(
    actor,
    {
      id: input.id,
      version: input.version,
      title: existing.title,
      notes: input.notes,
      managerEmployeeId: existing.managerEmployeeId,
      nextMilestone: existing.nextMilestone,
      nextMilestoneDate: existing.nextMilestoneDate,
      progress: existing.progress,
    },
    serviceTitleById,
  );
}

export async function markAdminMessageRead(
  actor: Actor,
  id: string,
): Promise<AdminMessage> {
  const row = await backendRequest({
    method: "POST",
    path: `/messages/${id}/read`,
    actor,
    outputSchema: messagePublicSchema,
  });
  return toAdminMessage(row);
}

export async function updateUserSelf(
  actor: Actor,
  input: {
    readonly version: number;
    readonly name: string;
    readonly title: string | null;
  },
): Promise<{ readonly name: string; readonly title: string | null }> {
  const row = await backendRequest({
    method: "PATCH",
    path: "/users/me",
    body: input,
    actor,
    outputSchema: userPublicSchema,
  });
  return { name: row.name, title: row.title };
}

export async function getAdminMe(actor: Actor): Promise<{
  readonly id: string;
  readonly version: number;
  readonly name: string;
  readonly email: string;
  readonly title: string | null;
  readonly role: string;
  readonly imagePath: string;
}> {
  const row = await backendRequest({
    method: "GET",
    path: "/users/me",
    actor,
    outputSchema: userPublicSchema,
  });
  return {
    id: row.id,
    version: row.version,
    name: row.name,
    email: row.email,
    title: row.title,
    role: row.role,
    imagePath: row.imagePath,
  };
}

export async function updateAdminMeProfile(
  actor: Actor,
  input: {
    readonly version: number;
    readonly name: string;
    readonly title: string | null;
    readonly imagePath: string;
  },
): Promise<{
  readonly version: number;
  readonly name: string;
  readonly email: string;
  readonly title: string | null;
  readonly imagePath: string;
}> {
  const row = await backendRequest({
    method: "PATCH",
    path: "/users/me",
    body: {
      version: input.version,
      name: input.name,
      title: input.title,
      imagePath: input.imagePath,
    },
    actor,
    outputSchema: userPublicSchema,
  });
  return {
    version: row.version,
    name: row.name,
    email: row.email,
    title: row.title,
    imagePath: row.imagePath,
  };
}

export async function updateAdminClient(
  actor: Actor,
  input: {
    readonly id: string;
    readonly version: number;
    readonly company: string;
    readonly phone: string;
    readonly statusCode: "active" | "paused";
    readonly memberSince: string;
    readonly clientContactTitle: string;
    readonly location: string;
    readonly plan: string;
  },
): Promise<AdminClient> {
  const row = await backendRequest({
    method: "PATCH",
    path: `/clients/${input.id}`,
    body: {
      version: input.version,
      company: input.company,
      phone: input.phone,
      statusCode: input.statusCode,
      memberSince: input.memberSince,
      clientContactTitle: input.clientContactTitle,
      location: input.location,
      plan: input.plan,
    },
    actor,
    outputSchema: clientPublicSchema,
  });
  return toAdminClient(row);
}

export async function getAdminUser(
  actor: Actor,
  userId: string,
): Promise<UserPublic> {
  return backendRequest({
    method: "GET",
    path: `/users/${userId}`,
    actor,
    outputSchema: userPublicSchema,
  });
}

export async function updateAdminClientContact(
  actor: Actor,
  input: {
    readonly clientId: string;
    readonly clientVersion: number;
    readonly userId: string;
    readonly name: string;
    readonly email: string;
    readonly company: string;
    readonly phone: string;
    readonly location: string;
    readonly plan: string;
    readonly clientContactTitle: string;
    readonly statusCode: "active" | "paused";
    readonly memberSince: string;
  },
): Promise<AdminClient> {
  const user = await getAdminUser(actor, input.userId);
  await updateAdminAccount(actor, {
    userId: input.userId,
    version: user.version,
    name: input.name.trim(),
    email: input.email.trim(),
    title: user.title,
  });
  const client = await updateAdminClient(actor, {
    id: input.clientId,
    version: input.clientVersion,
    company: input.company.trim(),
    phone: input.phone.trim(),
    statusCode: input.statusCode,
    memberSince: input.memberSince,
    clientContactTitle: input.clientContactTitle.trim(),
    location: input.location.trim(),
    plan: input.plan.trim(),
  });
  return {
    ...client,
    name: input.name.trim(),
    email: input.email.trim(),
    initials: initialsFrom(input.name.trim()),
  };
}

export async function updateAdminAccount(
  actor: Actor,
  input: {
    readonly userId: string;
    readonly version: number;
    readonly name: string;
    readonly email: string;
    readonly title: string | null;
  },
): Promise<{
  readonly version: number;
  readonly name: string;
  readonly email: string;
  readonly title: string | null;
  readonly imagePath: string;
}> {
  const row = await backendRequest({
    method: "PATCH",
    path: `/users/${input.userId}`,
    body: {
      version: input.version,
      name: input.name,
      email: input.email,
      title: input.title,
    },
    actor,
    outputSchema: userPublicSchema,
  });
  return {
    version: row.version,
    name: row.name,
    email: row.email,
    title: row.title,
    imagePath: row.imagePath,
  };
}

export async function changeUserPassword(
  actor: Actor,
  input: {
    readonly currentPassword: string;
    readonly newPassword: string;
  },
): Promise<void> {
  await backendRequest({
    method: "POST",
    path: "/auth/password/change",
    body: input,
    actor,
    outputSchema: passwordChangeResponseSchema,
  });
}
