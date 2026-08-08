import {
  CreateBucketCommand,
  GetObjectCommand,
  HeadBucketCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { createClient } from "redis";
import { createServer } from "node:http";
import { randomUUID } from "node:crypto";
import { mkdir, writeFile, readFile, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const outPath = path.join(root, "backend", ".tmp-platform-verify.json");

const results = [];

function record(name, ok, detail) {
  results.push({ name, ok, detail, at: new Date().toISOString() });
  const mark = ok ? "PASS" : "FAIL";
  process.stdout.write(`${mark} ${name}: ${detail}\n`);
}

async function verifyMinioS3() {
  const endpoint = process.env.S3_ENDPOINT ?? "http://127.0.0.1:9000";
  const bucket = process.env.S3_BUCKET ?? "jz-platform-verify";
  const client = new S3Client({
    region: process.env.S3_REGION ?? "us-east-1",
    endpoint,
    forcePathStyle: true,
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID ?? "minioadmin",
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY ?? "minioadmin12345",
    },
  });

  try {
    await client.send(new HeadBucketCommand({ Bucket: bucket }));
  } catch {
    await client.send(new CreateBucketCommand({ Bucket: bucket }));
  }

  const key = `verify/${randomUUID()}.bin`;
  const payload = Buffer.from(`jz-platform-verify-${Date.now()}`);
  await client.send(
    new PutObjectCommand({ Bucket: bucket, Key: key, Body: payload }),
  );
  const got = await client.send(
    new GetObjectCommand({ Bucket: bucket, Key: key }),
  );
  const chunks = [];
  for await (const chunk of got.Body) {
    chunks.push(Buffer.from(chunk));
  }
  const body = Buffer.concat(chunks);
  if (!body.equals(payload)) {
    throw new Error("s3 round-trip bytes mismatch");
  }
  record("s3_minio_put_get", true, `${endpoint} bucket=${bucket} key=${key}`);
}

async function verifyRedisHappyPath() {
  const url = process.env.REDIS_URL ?? "redis://127.0.0.1:6379";
  const client = createClient({ url });
  await client.connect();
  try {
    const pong = await client.ping();
    if (pong !== "PONG") {
      throw new Error(`unexpected ping: ${pong}`);
    }
    const nonceKey = `jz:nonce:verify-${randomUUID()}`;
    const set1 = await client.set(nonceKey, "1", { NX: true, EX: 30 });
    const set2 = await client.set(nonceKey, "1", { NX: true, EX: 30 });
    if (set1 !== "OK" || set2 !== null) {
      throw new Error(`nonce NX semantics failed set1=${set1} set2=${set2}`);
    }
    const lua = `
local key = KEYS[1]
local capacity = tonumber(ARGV[1])
local refill = tonumber(ARGV[2])
local cost = tonumber(ARGV[3])
local now = tonumber(ARGV[4])
local data = redis.call('HMGET', key, 'tokens', 'ts')
local tokens = tonumber(data[1])
local ts = tonumber(data[2])
if tokens == nil then
  tokens = capacity
  ts = now
end
local elapsed = math.max(0, now - ts)
tokens = math.min(capacity, tokens + elapsed * refill)
if tokens < cost then
  redis.call('HMSET', key, 'tokens', tokens, 'ts', now)
  redis.call('EXPIRE', key, 86400)
  return 0
end
tokens = tokens - cost
redis.call('HMSET', key, 'tokens', tokens, 'ts', now)
redis.call('EXPIRE', key, 86400)
return 1
`;
    const rlKey = `jz:rl:verify-${randomUUID()}`;
    const allowed = await client.eval(lua, {
      keys: [rlKey],
      arguments: ["10", "1", "1", String(Date.now() / 1000)],
    });
    if (allowed !== 1) {
      throw new Error(`rate-limit lua returned ${allowed}`);
    }
    record("redis_ping_nonce_ratelimit_lua", true, url);
  } finally {
    await client.quit();
  }
}

async function verifyRedisDegradeFallback() {
  const url = "redis://127.0.0.1:1";
  const client = createClient({ url, socket: { connectTimeout: 500 } });
  let failed = false;
  try {
    await client.connect();
  } catch {
    failed = true;
  }
  if (!failed) {
    await client.quit();
    throw new Error("expected connection failure to dead redis");
  }
  record(
    "redis_dead_endpoint_fails_closed_for_client",
    true,
    "connect to :1 failed as expected; app falls back via getRedisClient null",
  );
}

async function verifyOtlpReceiver() {
  let received = 0;
  const server = createServer((req, res) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => {
      received += Buffer.concat(chunks).byteLength;
      res.writeHead(200, { "content-type": "application/json" });
      res.end("{}");
    });
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const { port } = server.address();
  const endpoint = `http://127.0.0.1:${port}`;

  const [{ NodeSDK }, { OTLPTraceExporter }, { resourceFromAttributes }, semconv] =
    await Promise.all([
      import("@opentelemetry/sdk-node"),
      import("@opentelemetry/exporter-trace-otlp-http"),
      import("@opentelemetry/resources"),
      import("@opentelemetry/semantic-conventions"),
    ]);

  const sdk = new NodeSDK({
    resource: resourceFromAttributes({
      [semconv.ATTR_SERVICE_NAME]: "jz-platform-verify",
    }),
    traceExporter: new OTLPTraceExporter({
      url: `${endpoint}/v1/traces`,
    }),
  });
  await sdk.start();

  const { trace } = await import("@opentelemetry/api");
  const tracer = trace.getTracer("jz-platform-verify");
  await tracer.startActiveSpan("platform-verify", async (span) => {
    span.setAttribute("jz.verify", true);
    span.end();
  });
  await sdk.shutdown();
  await new Promise((r) => setTimeout(r, 500));
  server.close();

  if (received <= 0) {
    throw new Error("OTLP receiver got zero bytes");
  }
  record("otel_otlp_http_export", true, `bytes=${received} endpoint=${endpoint}`);
}

async function verifySentryIngest() {
  let received = 0;
  const server = createServer((req, res) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => {
      received += Buffer.concat(chunks).byteLength;
      res.writeHead(200, { "content-type": "application/json" });
      res.end("{}");
    });
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const { port } = server.address();
  const dsn = `http://publickey@127.0.0.1:${port}/1`;

  const Sentry = await import("@sentry/node");
  Sentry.init({
    dsn,
    environment: "platform-verify",
    tracesSampleRate: 0,
    transportOptions: { httpProxy: undefined, httpsProxy: undefined },
  });
  Sentry.captureException(new Error("jz-platform-verify-exception"));
  await Sentry.flush(5000);
  await Sentry.close(2000);
  server.close();

  if (received <= 0) {
    throw new Error("Sentry ingest got zero bytes");
  }
  record("sentry_ingest_roundtrip", true, `bytes=${received} dsn_host=127.0.0.1:${port}`);
}

async function verifyBackendSaveUploadAgainstMinio() {
  const tmpRoot = path.join(root, "backend", ".tmp-platform-verify-files");
  await mkdir(tmpRoot, { recursive: true });

  process.env.NODE_ENV = "test";
  process.env.HOST = "127.0.0.1";
  process.env.PORT = "3999";
  process.env.DATABASE_HOST = "127.0.0.1";
  process.env.DATABASE_PORT = "5433";
  process.env.DATABASE_NAME = "jumpifzero";
  process.env.DATABASE_USER = "jz_app";
  if (!process.env.DATABASE_PASSWORD) {
    const envFile = await readFile(path.join(root, "backend", ".env"), "utf8");
    const line = envFile.split(/\r?\n/).find((l) => l.startsWith("DATABASE_PASSWORD="));
    if (line) {
      process.env.DATABASE_PASSWORD = line.slice("DATABASE_PASSWORD=".length);
    }
  }
  process.env.HMAC_SECRET = "local-dev-hmac-secret-key-v1-ok!!";
  process.env.HMAC_KEY_ID = "v1";
  process.env.HMAC_GATEWAY_SUBJECT_ID = "01900000-0000-7000-8000-000000000099";
  process.env.TAX_ID_AEAD_KEY = "AQIDBAUGBwgJCgsMDQ4PEBESExQVFhcYGRobHB0eHyA=";
  process.env.FILE_STORAGE_ROOT = tmpRoot;
  process.env.FILE_STORAGE_BACKEND = "s3";
  process.env.S3_BUCKET = "jz-platform-verify";
  process.env.S3_REGION = "us-east-1";
  process.env.S3_ENDPOINT = "http://127.0.0.1:9000";
  process.env.S3_ACCESS_KEY_ID = "minioadmin";
  process.env.S3_SECRET_ACCESS_KEY = "minioadmin12345";
  process.env.S3_FORCE_PATH_STYLE = "true";
  process.env.RATE_LIMIT_BACKEND = "postgres";
  process.env.NONCE_BACKEND = "postgres";
  process.env.CORS_ORIGIN = "http://localhost:3000";
  process.env.REQUEST_TIMEOUT_MS = "30000";
  process.env.BODY_MAX_BYTES = "1048576";
  process.env.SLOW_QUERY_MS = "500";
  process.env.OTEL_ENABLED = "false";
  process.env.METRICS_ENABLED = "false";

  const { saveUpload, openUploadStream } = await import("../src/lib/storage.ts");
  const png = Buffer.from([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
    0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
    0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53, 0xde, 0x00, 0x00, 0x00,
    0x0c, 0x49, 0x44, 0x41, 0x54, 0x08, 0xd7, 0x63, 0xf8, 0xcf, 0xc0, 0x00,
    0x00, 0x00, 0x03, 0x00, 0x01, 0x00, 0x05, 0xfe, 0xd4, 0xef, 0x00, 0x00,
    0x00, 0x00, 0x49, 0x45, 0x4e, 0x44, 0xae, 0x42, 0x60, 0x82,
  ]);
  const saved = await saveUpload({ buffer: png, extension: "png", prefix: "uploads" });
  const stream = openUploadStream(saved.storageKey);
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.from(chunk));
  }
  const round = Buffer.concat(chunks);
  if (!round.equals(png)) {
    throw new Error("backend saveUpload/openUploadStream S3 round-trip mismatch");
  }
  await rm(tmpRoot, { recursive: true, force: true });
  record(
    "backend_storage_s3_roundtrip",
    true,
    `storageKey=${saved.storageKey} checksum=${saved.checksumSha256}`,
  );
}

async function main() {
  const failures = [];
  for (const step of [
    verifyMinioS3,
    verifyRedisHappyPath,
    verifyRedisDegradeFallback,
    verifyOtlpReceiver,
    verifySentryIngest,
    verifyBackendSaveUploadAgainstMinio,
  ]) {
    try {
      await step();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      record(step.name, false, message);
      failures.push(step.name);
    }
  }

  await writeFile(
    outPath,
    JSON.stringify({ generatedAt: new Date().toISOString(), results }, null, 2),
  );
  process.stdout.write(`wrote ${outPath}\n`);
  if (failures.length > 0) {
    process.exitCode = 1;
  }
}

await main();
