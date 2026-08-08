import { actorSchema } from "@jumpifzero/contracts/content";
import { signBackendRequest } from "@/lib/backend/hmacSign";
import { env } from "@/lib/env";
import { verifySession } from "@/lib/session";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
): Promise<Response> {
  const params = await context.params;
  const id = params.id;
  if (!id) {
    return new Response(null, { status: 400 });
  }

  const session =
    (await verifySession("admin")) ??
    (await verifySession("employee")) ??
    (await verifySession("customer"));

  if (!session) {
    return new Response(null, { status: 401 });
  }

  const actor = actorSchema.parse({
    subjectId: session.subjectId,
    role: session.role === "customer" ? "client" : session.role,
    employeeKind: session.employeeKind ?? null,
  });

  const backendUrl = new URL(`/files/${id}/download`, `${env.backendBaseUrl}/`);
  const rawBody = Buffer.alloc(0);
  const headers = signBackendRequest({
    method: "GET",
    url: backendUrl,
    body: rawBody,
    actor,
  });

  const response = await fetch(backendUrl, {
    method: "GET",
    headers,
    cache: "no-store",
  });

  if (!response.ok) {
    return new Response(null, {
      status: response.status === 404 ? 404 : 502,
    });
  }

  const contentType =
    response.headers.get("content-type") ?? "application/octet-stream";
  const contentDisposition = response.headers.get("content-disposition");

  return new Response(response.body, {
    headers: {
      "Content-Type": contentType,
      ...(contentDisposition ? { "Content-Disposition": contentDisposition } : {}),
      "Cache-Control": "private, no-store",
    },
  });
}
