import { z } from "@jumpifzero/contracts/z";
import { env } from "@/lib/env";
import { signGatewayRequest } from "@/lib/backend/hmacSign";

const errorEnvelopeSchema = z.object({
  ok: z.literal(false),
  code: z.string(),
  message: z.string(),
  correlationId: z.string(),
});

const successEnvelopeSchema = z.object({
  ok: z.literal(true),
  data: z.unknown(),
  correlationId: z.string(),
});

export class GatewayRequestError extends Error {
  readonly status: number;
  readonly code: string;
  readonly correlationId: string;

  constructor(input: {
    readonly status: number;
    readonly code: string;
    readonly message: string;
    readonly correlationId: string;
  }) {
    super(input.message);
    this.name = "GatewayRequestError";
    this.status = input.status;
    this.code = input.code;
    this.correlationId = input.correlationId;
  }
}

export async function gatewayBackendRequest<T>(input: {
  readonly method: string;
  readonly path: string;
  readonly query?: Record<string, string>;
  readonly body?: unknown;
  readonly outputSchema: z.ZodType<T>;
}): Promise<T> {
  const url = new URL(input.path, `${env.backendBaseUrl}/`);
  if (input.query) {
    for (const [key, value] of Object.entries(input.query)) {
      url.searchParams.set(key, value);
    }
  }

  const rawBody =
    input.body === undefined
      ? Buffer.alloc(0)
      : Buffer.from(JSON.stringify(input.body), "utf8");

  const headers = signGatewayRequest({
    method: input.method,
    url,
    body: rawBody,
  });

  if (input.body !== undefined) {
    headers["content-type"] = "application/json";
  }

  const init: RequestInit = {
    method: input.method,
    headers,
    cache: "no-store",
  };

  if (input.body !== undefined) {
    init.body = rawBody;
  }

  const response = await fetch(url, init);
  const text = await response.text();
  let json: unknown;
  try {
    json = text.length > 0 ? JSON.parse(text) : null;
  } catch {
    throw new GatewayRequestError({
      status: response.status,
      code: "INTERNAL",
      message: "Invalid backend response",
      correlationId: "unknown",
    });
  }

  if (!response.ok) {
    const parsedError = errorEnvelopeSchema.safeParse(json);
    if (parsedError.success) {
      throw new GatewayRequestError({
        status: response.status,
        code: parsedError.data.code,
        message: parsedError.data.message,
        correlationId: parsedError.data.correlationId,
      });
    }
    throw new GatewayRequestError({
      status: response.status,
      code: "INTERNAL",
      message: "Backend request failed",
      correlationId: "unknown",
    });
  }

  const envelope = successEnvelopeSchema.safeParse(json);
  if (!envelope.success) {
    throw new GatewayRequestError({
      status: response.status,
      code: "INTERNAL",
      message: "Invalid backend success envelope",
      correlationId: "unknown",
    });
  }

  return input.outputSchema.parse(envelope.data.data);
}
