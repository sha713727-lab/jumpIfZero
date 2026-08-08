const REDACTED = "[REDACTED]";

const SENSITIVE_KEY =
  /pass(word|phrase)?|secret|token|authorization|cookie|signature|hmac|tax[_-]?id|aead|session|ciphertext|email/i;

export type LogLevel = "debug" | "info" | "warn" | "error";

type LogInput = {
  readonly msg: string;
  readonly correlationId?: string;
  readonly route?: string;
  readonly subjectId?: string;
  readonly durationMs?: number;
  readonly status?: number;
  readonly err?: unknown;
};

function redactValue(key: string, value: unknown): unknown {
  if (SENSITIVE_KEY.test(key)) {
    return REDACTED;
  }
  if (Array.isArray(value)) {
    return value.map((item, index) => redactValue(String(index), item));
  }
  if (value !== null && typeof value === "object") {
    return redactObject(value as Record<string, unknown>);
  }
  return value;
}

function redactObject(input: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(input)) {
    out[key] = redactValue(key, value);
  }
  return out;
}

function serializeError(err: unknown): Record<string, unknown> {
  if (err instanceof Error) {
    return {
      name: err.name,
      message: err.message,
    };
  }
  return { message: "non-error throw" };
}

function write(level: LogLevel, fields: LogInput): void {
  const payload: Record<string, unknown> = {
    ts: new Date().toISOString(),
    level,
  };

  for (const [key, value] of Object.entries(fields)) {
    if (value === undefined) {
      continue;
    }
    if (key === "err") {
      payload.err = serializeError(value);
      continue;
    }
    payload[key] = redactValue(key, value);
  }

  process.stdout.write(`${JSON.stringify(payload)}\n`);
}

export const logger = {
  debug(fields: LogInput): void {
    write("debug", fields);
  },
  info(fields: LogInput): void {
    write("info", fields);
  },
  warn(fields: LogInput): void {
    write("warn", fields);
  },
  error(fields: LogInput): void {
    write("error", fields);
  },
} as const;
