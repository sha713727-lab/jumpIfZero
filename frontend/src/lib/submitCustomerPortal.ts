"use server";

import {
  actorSchema,
  filePublicSchema,
  passwordChangeResponseSchema,
} from "@jumpifzero/contracts";
import { BackendRequestError, backendRequest } from "@/lib/backend/client";
import { signBackendRequest } from "@/lib/backend/hmacSign";
import {
  archiveCustomerFile,
  createCustomerMessage,
  getOwnClient,
  getOwnUser,
  markCustomerMessageRead,
  toCustomerClient,
  toCustomerFile,
  toCustomerShell,
  toCustomerUser,
  updateOwnClient,
  updateOwnUser,
  type CustomerClient,
  type CustomerFile,
  type CustomerMessage,
  type CustomerShell,
  type CustomerUser,
} from "@/lib/data/customerPortal";
import { env } from "@/lib/env";
import { requireSession, type SessionPayload } from "@/lib/session";

export type CustomerPortalActionResult<T = void> =
  | ({ readonly ok: true } & (T extends void ? object : { readonly data: T }))
  | {
      readonly ok: false;
      readonly reason: "unauthorized" | "conflict" | "validation" | "server";
    };

function actorFromSession(session: SessionPayload) {
  return actorSchema.parse({
    subjectId: session.subjectId,
    role: "client",
    employeeKind: null,
  });
}

function mapBackendError(error: unknown): CustomerPortalActionResult<never> {
  if (error instanceof BackendRequestError) {
    if (error.status === 401 || error.status === 403) {
      return { ok: false, reason: "unauthorized" };
    }
    if (error.status === 409) {
      return { ok: false, reason: "conflict" };
    }
    if (error.status === 400 || error.status === 422) {
      return { ok: false, reason: "validation" };
    }
  }
  return { ok: false, reason: "server" };
}

function buildFileMultipartBody(input: {
  readonly boundary: string;
  readonly clientId: string;
  readonly kind: string;
  readonly filename: string;
  readonly mimeType: string;
  readonly buffer: Buffer;
}): Buffer {
  const clientPart = Buffer.from(
    `--${input.boundary}\r\nContent-Disposition: form-data; name="clientId"\r\n\r\n${input.clientId}\r\n`,
    "utf8",
  );
  const kindPart = Buffer.from(
    `--${input.boundary}\r\nContent-Disposition: form-data; name="kind"\r\n\r\n${input.kind}\r\n`,
    "utf8",
  );
  const filePart = Buffer.from(
    `--${input.boundary}\r\nContent-Disposition: form-data; name="file"; filename="${input.filename}"\r\nContent-Type: ${input.mimeType}\r\n\r\n`,
    "utf8",
  );
  const suffix = Buffer.from(`\r\n--${input.boundary}--\r\n`, "utf8");
  return Buffer.concat([clientPart, kindPart, filePart, input.buffer, suffix]);
}

async function shellFromActor(actor: ReturnType<typeof actorFromSession>): Promise<CustomerShell> {
  const [userRow, clientRow] = await Promise.all([
    getOwnUser(actor),
    getOwnClient(actor),
  ]);
  return toCustomerShell(toCustomerUser(userRow), toCustomerClient(clientRow));
}

export async function updateUserMeAction(input: {
  readonly version: number;
  readonly name: string;
  readonly title: string;
}): Promise<CustomerPortalActionResult<{ readonly user: CustomerUser; readonly shell: CustomerShell }>> {
  try {
    const session = await requireSession("customer");
    const actor = actorFromSession(session);
    const user = await updateOwnUser(actor, {
      version: input.version,
      name: input.name.trim(),
      title: input.title.trim().length > 0 ? input.title.trim() : null,
    });
    return { ok: true, data: { user, shell: await shellFromActor(actor) } };
  } catch (error) {
    return mapBackendError(error);
  }
}

export async function updateClientMeAction(input: {
  readonly version: number;
  readonly company: string;
  readonly phone: string;
  readonly location: string;
  readonly clientContactTitle: string;
}): Promise<CustomerPortalActionResult<{ readonly client: CustomerClient; readonly shell: CustomerShell }>> {
  try {
    const session = await requireSession("customer");
    const actor = actorFromSession(session);
    const client = await updateOwnClient(actor, {
      version: input.version,
      company: input.company.trim(),
      phone: input.phone.trim(),
      location: input.location.trim(),
      clientContactTitle: input.clientContactTitle.trim(),
    });
    return { ok: true, data: { client, shell: await shellFromActor(actor) } };
  } catch (error) {
    return mapBackendError(error);
  }
}

export async function sendMessageAction(input: {
  readonly body: string;
  readonly fileIds?: readonly string[];
}): Promise<CustomerPortalActionResult<CustomerMessage>> {
  try {
    const session = await requireSession("customer");
    const actor = actorFromSession(session);
    const client = await getOwnClient(actor);
    const body = input.body.trim();
    const fileIds = input.fileIds ?? [];
    if (body.length === 0 && fileIds.length === 0) {
      return { ok: false, reason: "validation" };
    }
    const data = await createCustomerMessage(actor, {
      clientId: client.id,
      body,
      fileIds,
    });
    return { ok: true, data };
  } catch (error) {
    return mapBackendError(error);
  }
}

export async function markMessageReadAction(input: {
  readonly id: string;
}): Promise<CustomerPortalActionResult<CustomerMessage>> {
  try {
    const session = await requireSession("customer");
    const actor = actorFromSession(session);
    const data = await markCustomerMessageRead(actor, input.id);
    return { ok: true, data };
  } catch (error) {
    return mapBackendError(error);
  }
}

export async function uploadFileAction(
  formData: FormData,
): Promise<CustomerPortalActionResult<CustomerFile>> {
  try {
    const session = await requireSession("customer");
    const actor = actorFromSession(session);
    const client = await getOwnClient(actor);
    const file = formData.get("file");
    const kindRaw = formData.get("kind");

    if (!(file instanceof File) || file.size === 0) {
      return { ok: false, reason: "validation" };
    }

    const kind =
      typeof kindRaw === "string" && kindRaw.trim().length > 0
        ? kindRaw.trim().slice(0, 64)
        : "";
    const buffer = Buffer.from(await file.arrayBuffer());
    const boundary = `jz${crypto.randomUUID().replaceAll("-", "")}`;
    const rawBody = buildFileMultipartBody({
      boundary,
      clientId: client.id,
      kind,
      filename: file.name,
      mimeType: file.type.length > 0 ? file.type : "application/octet-stream",
      buffer,
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
      if (response.status === 401 || response.status === 403) {
        return { ok: false, reason: "unauthorized" };
      }
      if (response.status === 400 || response.status === 422) {
        return { ok: false, reason: "validation" };
      }
      return { ok: false, reason: "server" };
    }

    let json: unknown;
    try {
      json = text.length > 0 ? JSON.parse(text) : null;
    } catch {
      return { ok: false, reason: "server" };
    }

    const envelope = json as {
      ok?: boolean;
      data?: unknown;
    };

    if (envelope.ok !== true) {
      return { ok: false, reason: "server" };
    }

    const parsed = filePublicSchema.safeParse(envelope.data);
    if (!parsed.success) {
      return { ok: false, reason: "server" };
    }

    return { ok: true, data: toCustomerFile(parsed.data) };
  } catch (error) {
    if (
      error instanceof Error &&
      (error.message.includes("Unauthorized") ||
        error.message.includes("Forbidden"))
    ) {
      return { ok: false, reason: "unauthorized" };
    }
    return { ok: false, reason: "server" };
  }
}

export async function archiveFileAction(input: {
  readonly id: string;
}): Promise<CustomerPortalActionResult> {
  try {
    const session = await requireSession("customer");
    await archiveCustomerFile(actorFromSession(session), input.id);
    return { ok: true };
  } catch (error) {
    return mapBackendError(error);
  }
}

export async function changePasswordAction(input: {
  readonly currentPassword: string;
  readonly newPassword: string;
}): Promise<CustomerPortalActionResult> {
  try {
    const session = await requireSession("customer");
    const actor = actorFromSession(session);
    await backendRequest({
      method: "POST",
      path: "/auth/password/change",
      body: {
        currentPassword: input.currentPassword,
        newPassword: input.newPassword,
      },
      actor,
      outputSchema: passwordChangeResponseSchema,
    });
    return { ok: true };
  } catch (error) {
    return mapBackendError(error);
  }
}
