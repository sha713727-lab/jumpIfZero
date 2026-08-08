import { backendEnvSchema, type BackendEnv } from "@jumpifzero/contracts";

function readProcessEnv(): Record<string, string | undefined> {
  return {
    NODE_ENV: process.env.NODE_ENV,
    HOST: process.env.HOST,
    PORT: process.env.PORT,
    DATABASE_HOST: process.env.DATABASE_HOST,
    DATABASE_PORT: process.env.DATABASE_PORT,
    DATABASE_NAME: process.env.DATABASE_NAME,
    DATABASE_USER: process.env.DATABASE_USER,
    DATABASE_PASSWORD: process.env.DATABASE_PASSWORD,
    HMAC_SECRET: process.env.HMAC_SECRET,
    HMAC_SECRET_PREVIOUS: process.env.HMAC_SECRET_PREVIOUS,
    HMAC_KEY_ID: process.env.HMAC_KEY_ID,
    HMAC_KEY_ID_PREVIOUS: process.env.HMAC_KEY_ID_PREVIOUS,
    HMAC_GATEWAY_SUBJECT_ID: process.env.HMAC_GATEWAY_SUBJECT_ID,
    TAX_ID_AEAD_KEY: process.env.TAX_ID_AEAD_KEY,
    TAX_ID_AEAD_KEY_PREVIOUS: process.env.TAX_ID_AEAD_KEY_PREVIOUS,
    FILE_STORAGE_ROOT: process.env.FILE_STORAGE_ROOT,
    FILE_STORAGE_BACKEND: process.env.FILE_STORAGE_BACKEND,
    S3_BUCKET: process.env.S3_BUCKET,
    S3_REGION: process.env.S3_REGION,
    S3_ENDPOINT: process.env.S3_ENDPOINT,
    S3_ACCESS_KEY_ID: process.env.S3_ACCESS_KEY_ID,
    S3_SECRET_ACCESS_KEY: process.env.S3_SECRET_ACCESS_KEY,
    S3_FORCE_PATH_STYLE: process.env.S3_FORCE_PATH_STYLE,
    RATE_LIMIT_BACKEND: process.env.RATE_LIMIT_BACKEND,
    NONCE_BACKEND: process.env.NONCE_BACKEND,
    REDIS_URL: process.env.REDIS_URL,
    OTEL_ENABLED: process.env.OTEL_ENABLED,
    OTEL_SERVICE_NAME: process.env.OTEL_SERVICE_NAME,
    OTEL_EXPORTER_OTLP_ENDPOINT: process.env.OTEL_EXPORTER_OTLP_ENDPOINT,
    SENTRY_DSN: process.env.SENTRY_DSN,
    CORS_ORIGIN: process.env.CORS_ORIGIN,
    REQUEST_TIMEOUT_MS: process.env.REQUEST_TIMEOUT_MS,
    BODY_MAX_BYTES: process.env.BODY_MAX_BYTES,
    SLOW_QUERY_MS: process.env.SLOW_QUERY_MS,
    DATABASE_POOL_MAX: process.env.DATABASE_POOL_MAX,
    DATABASE_IDLE_TIMEOUT_MS: process.env.DATABASE_IDLE_TIMEOUT_MS,
    DATABASE_CONNECTION_TIMEOUT_MS: process.env.DATABASE_CONNECTION_TIMEOUT_MS,
    SHUTDOWN_DRAIN_MS: process.env.SHUTDOWN_DRAIN_MS,
    METRICS_ENABLED: process.env.METRICS_ENABLED,
    EMAIL_PROVIDER: process.env.EMAIL_PROVIDER,
    EMAIL_FROM: process.env.EMAIL_FROM,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
  };
}

const parsed = backendEnvSchema.safeParse(readProcessEnv());

if (!parsed.success) {
  const details = parsed.error.issues
    .map((issue) => `${issue.path.join(".") || "(root)"}: ${issue.message}`)
    .join("; ");
  throw new Error(`Invalid backend environment: ${details}`);
}

export const env: BackendEnv = parsed.data;
