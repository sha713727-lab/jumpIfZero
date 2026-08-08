import { z } from "zod";

const PLACEHOLDER_SECRETS = new Set([
  "changeme",
  "change_me",
  "replace_me",
  "your-secret-here",
  "placeholder",
  "secret",
  "password",
  "00000000000000000000000000000000",
  "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  "dev-only-hmac-secret-do-not-use!!",
  "dev-only-prev-hmac-do-not-use!!!!",
  "replace-with-jz-app-password-32chars",
]);

const PLACEHOLDER_AEAD_KEYS = new Set([
  "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=",
  "AQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQE=",
]);

function emptyToUndefined(value: unknown): unknown {
  if (value === undefined || value === null) {
    return undefined;
  }
  if (typeof value === "string" && value.trim() === "") {
    return undefined;
  }
  return value;
}

function isUniformString(value: string): boolean {
  if (value.length === 0) {
    return true;
  }
  const first = value[0];
  for (let i = 1; i < value.length; i += 1) {
    if (value[i] !== first) {
      return false;
    }
  }
  return true;
}

const secretSchema = z
  .string()
  .trim()
  .min(32)
  .refine((value) => !PLACEHOLDER_SECRETS.has(value.toLowerCase()), {
    message: "secret must not be a placeholder value",
  })
  .refine((value) => !/^replace_?me/i.test(value), {
    message: "secret must not be a placeholder value",
  })
  .refine((value) => !/^change_?me/i.test(value), {
    message: "secret must not be a placeholder value",
  })
  .refine((value) => !isUniformString(value), {
    message: "secret must not be a uniform placeholder",
  });

function isUniformBytes(bytes: Buffer): boolean {
  if (bytes.byteLength === 0) {
    return true;
  }
  const first = bytes[0];
  for (let i = 1; i < bytes.byteLength; i += 1) {
    if (bytes[i] !== first) {
      return false;
    }
  }
  return true;
}

const aeadKeySchema = z
  .string()
  .trim()
  .refine((value) => !PLACEHOLDER_AEAD_KEYS.has(value), {
    message: "TAX_ID_AEAD_KEY must not be a placeholder value",
  })
  .refine(
    (value) => {
      try {
        const bytes = Buffer.from(value, "base64");
        return bytes.byteLength === 32 && !isUniformBytes(bytes);
      } catch {
        return false;
      }
    },
    {
      message:
        "TAX_ID_AEAD_KEY must be base64 encoding of exactly 32 non-uniform bytes",
    },
  );

function parseBoolEnv(value: unknown, defaultValue: boolean): boolean {
  if (value === undefined || value === null || value === "") {
    return defaultValue;
  }
  if (typeof value === "boolean") {
    return value;
  }
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (normalized === "true" || normalized === "1") {
      return true;
    }
    if (normalized === "false" || normalized === "0") {
      return false;
    }
  }
  throw new Error("expected boolean");
}

const boolWithDefault = (defaultValue: boolean) =>
  z.preprocess((value) => {
    try {
      return parseBoolEnv(value, defaultValue);
    } catch {
      return value;
    }
  }, z.boolean());

export const backendEnvSchema = z
  .object({
    NODE_ENV: z.enum(["development", "production", "test"]),
    HOST: z.string().trim().min(1).max(255),
    PORT: z.coerce.number().int().min(1).max(65535),
    DATABASE_HOST: z.string().trim().min(1).max(255),
    DATABASE_PORT: z.coerce.number().int().min(1).max(65535),
    DATABASE_NAME: z.string().trim().min(1).max(63),
    DATABASE_USER: z.literal("jz_app"),
    DATABASE_PASSWORD: secretSchema,
    HMAC_SECRET: secretSchema,
    HMAC_SECRET_PREVIOUS: z.preprocess(
      emptyToUndefined,
      secretSchema.optional(),
    ),
    HMAC_KEY_ID: z.string().trim().min(1).max(64),
    HMAC_KEY_ID_PREVIOUS: z.preprocess(
      emptyToUndefined,
      z.string().trim().min(1).max(64).optional(),
    ),
    HMAC_GATEWAY_SUBJECT_ID: z.uuid(),
    TAX_ID_AEAD_KEY: aeadKeySchema,
    TAX_ID_AEAD_KEY_PREVIOUS: z.preprocess(
      emptyToUndefined,
      aeadKeySchema.optional(),
    ),
    FILE_STORAGE_ROOT: z.string().trim().min(1).max(4096),
    FILE_STORAGE_BACKEND: z.preprocess((value) => {
      const normalized = emptyToUndefined(value);
      return normalized === undefined ? "local" : normalized;
    }, z.enum(["local", "s3"])),
    S3_BUCKET: z.preprocess(emptyToUndefined, z.string().trim().min(1).max(255).optional()),
    S3_REGION: z.preprocess(emptyToUndefined, z.string().trim().min(1).max(64).optional()),
    S3_ENDPOINT: z.preprocess(emptyToUndefined, z.string().trim().url().optional()),
    S3_ACCESS_KEY_ID: z.preprocess(emptyToUndefined, z.string().trim().min(1).max(256).optional()),
    S3_SECRET_ACCESS_KEY: z.preprocess(emptyToUndefined, z.string().trim().min(1).max(512).optional()),
    S3_FORCE_PATH_STYLE: boolWithDefault(false),
    RATE_LIMIT_BACKEND: z.preprocess((value) => {
      const normalized = emptyToUndefined(value);
      return normalized === undefined ? "postgres" : normalized;
    }, z.enum(["postgres", "redis"])),
    NONCE_BACKEND: z.preprocess((value) => {
      const normalized = emptyToUndefined(value);
      return normalized === undefined ? "postgres" : normalized;
    }, z.enum(["postgres", "redis"])),
    REDIS_URL: z.preprocess(emptyToUndefined, z.string().trim().url().optional()),
    OTEL_ENABLED: boolWithDefault(false),
    OTEL_SERVICE_NAME: z.preprocess((value) => {
      const normalized = emptyToUndefined(value);
      return normalized === undefined ? "jumpifzero-backend" : normalized;
    }, z.string().trim().min(1).max(128)),
    OTEL_EXPORTER_OTLP_ENDPOINT: z.preprocess(
      emptyToUndefined,
      z.string().trim().url().optional(),
    ),
    SENTRY_DSN: z.preprocess(emptyToUndefined, z.string().trim().url().optional()),
    CORS_ORIGIN: z.string().trim().max(2048).pipe(z.url()),
    REQUEST_TIMEOUT_MS: z.coerce.number().int().min(1000).max(120000),
    BODY_MAX_BYTES: z.coerce.number().int().min(1024).max(52_428_800),
    SLOW_QUERY_MS: z.coerce.number().int().min(50).max(60000),
    DATABASE_POOL_MAX: z.preprocess(
      (value) =>
        value === undefined || value === null || value === "" ? "10" : value,
      z.coerce.number().int().min(1).max(100),
    ),
    DATABASE_IDLE_TIMEOUT_MS: z.preprocess(
      (value) =>
        value === undefined || value === null || value === ""
          ? "30000"
          : value,
      z.coerce.number().int().min(1000).max(300000),
    ),
    DATABASE_CONNECTION_TIMEOUT_MS: z.preprocess(
      (value) =>
        value === undefined || value === null || value === ""
          ? "5000"
          : value,
      z.coerce.number().int().min(1000).max(60_000),
    ),
    SHUTDOWN_DRAIN_MS: z.preprocess(
      (value) =>
        value === undefined || value === null || value === ""
          ? "15000"
          : value,
      z.coerce.number().int().min(1000).max(120_000),
    ),
    METRICS_ENABLED: boolWithDefault(false),
    EMAIL_PROVIDER: z.preprocess((value) => {
      const normalized = emptyToUndefined(value);
      return normalized === undefined ? "demo" : normalized;
    }, z.enum(["demo", "resend"])),
    EMAIL_FROM: z.preprocess((value) => {
      const normalized = emptyToUndefined(value);
      return normalized === undefined
        ? "billing@jumpifzero.com"
        : normalized;
    }, z.string().trim().email().max(320)),
    RESEND_API_KEY: z.preprocess(
      emptyToUndefined,
      z.string().trim().min(1).max(256).optional(),
    ),
  })
  .superRefine((data, ctx) => {
    const hasPrevSecret = data.HMAC_SECRET_PREVIOUS !== undefined;
    const hasPrevKeyId = data.HMAC_KEY_ID_PREVIOUS !== undefined;
    if (hasPrevSecret !== hasPrevKeyId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "HMAC_KEY_ID_PREVIOUS and HMAC_SECRET_PREVIOUS must both be set or both omitted",
        path: hasPrevSecret
          ? ["HMAC_KEY_ID_PREVIOUS"]
          : ["HMAC_SECRET_PREVIOUS"],
      });
    }
    if (
      hasPrevKeyId &&
      data.HMAC_KEY_ID_PREVIOUS === data.HMAC_KEY_ID
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "HMAC_KEY_ID_PREVIOUS must differ from HMAC_KEY_ID",
        path: ["HMAC_KEY_ID_PREVIOUS"],
      });
    }
    if (
      hasPrevSecret &&
      data.HMAC_SECRET_PREVIOUS === data.HMAC_SECRET
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "HMAC_SECRET_PREVIOUS must differ from HMAC_SECRET",
        path: ["HMAC_SECRET_PREVIOUS"],
      });
    }
    if (data.FILE_STORAGE_BACKEND === "s3") {
      if (data.S3_BUCKET === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "S3_BUCKET is required when FILE_STORAGE_BACKEND=s3",
          path: ["S3_BUCKET"],
        });
      }
      if (data.S3_REGION === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "S3_REGION is required when FILE_STORAGE_BACKEND=s3",
          path: ["S3_REGION"],
        });
      }
    }
    if (
      (data.RATE_LIMIT_BACKEND === "redis" || data.NONCE_BACKEND === "redis") &&
      data.REDIS_URL === undefined
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message:
          "REDIS_URL is required when RATE_LIMIT_BACKEND or NONCE_BACKEND is redis",
        path: ["REDIS_URL"],
      });
    }
    if (data.OTEL_ENABLED && data.OTEL_EXPORTER_OTLP_ENDPOINT === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "OTEL_EXPORTER_OTLP_ENDPOINT is required when OTEL_ENABLED=true",
        path: ["OTEL_EXPORTER_OTLP_ENDPOINT"],
      });
    }
    if (data.EMAIL_PROVIDER === "resend" && data.RESEND_API_KEY === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "RESEND_API_KEY is required when EMAIL_PROVIDER=resend",
        path: ["RESEND_API_KEY"],
      });
    }
  });

export type BackendEnv = z.infer<typeof backendEnvSchema>;
