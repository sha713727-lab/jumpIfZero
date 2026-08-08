import { cmsMediaKeyQuerySchema } from "@jumpifzero/contracts/content";
import { signGatewayRequest } from "@/lib/backend/hmacSign";
import { env } from "@/lib/env";

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const parsed = cmsMediaKeyQuerySchema.safeParse({
    key: url.searchParams.get("key") ?? "",
  });

  if (!parsed.success) {
    return new Response(null, { status: 400 });
  }

  const backendUrl = new URL("/content/media", `${env.backendBaseUrl}/`);
  backendUrl.searchParams.set("key", parsed.data.key);

  const rawBody = Buffer.alloc(0);
  const headers = signGatewayRequest({
    method: "GET",
    url: backendUrl,
    body: rawBody,
  });

  const response = await fetch(backendUrl, {
    method: "GET",
    headers,
    cache: "no-store",
  });

  if (!response.ok) {
    return new Response(null, { status: response.status === 404 ? 404 : 502 });
  }

  const contentType =
    response.headers.get("content-type") ?? "application/octet-stream";

  return new Response(response.body, {
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "private, max-age=3600",
    },
  });
}
