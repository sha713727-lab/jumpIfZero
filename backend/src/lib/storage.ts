import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { createHash, randomUUID } from "node:crypto";
import { createReadStream } from "node:fs";
import { mkdir, writeFile, unlink } from "node:fs/promises";
import path from "node:path";
import { Readable } from "node:stream";
import { env } from "../config/env.ts";
import { logger } from "./logger.ts";
import { recordUpload } from "./metrics.ts";
import { resolveStoragePath } from "./upload-security.ts";

export function sha256HexBuffer(buffer: Buffer): string {
  return createHash("sha256").update(buffer).digest("hex");
}

let s3Client: S3Client | null = null;

function getS3Client(): S3Client {
  if (s3Client !== null) {
    return s3Client;
  }
  s3Client = new S3Client({
    region: env.S3_REGION ?? "us-east-1",
    ...(env.S3_ENDPOINT !== undefined ? { endpoint: env.S3_ENDPOINT } : {}),
    forcePathStyle: env.S3_FORCE_PATH_STYLE,
    ...(env.S3_ACCESS_KEY_ID !== undefined &&
    env.S3_SECRET_ACCESS_KEY !== undefined
      ? {
          credentials: {
            accessKeyId: env.S3_ACCESS_KEY_ID,
            secretAccessKey: env.S3_SECRET_ACCESS_KEY,
          },
        }
      : {}),
  });
  return s3Client;
}

async function saveLocal(input: {
  readonly buffer: Buffer;
  readonly storageKey: string;
}): Promise<void> {
  const fullPath = resolveStoragePath(env.FILE_STORAGE_ROOT, input.storageKey);
  await mkdir(path.dirname(fullPath), { recursive: true });
  await writeFile(fullPath, input.buffer);
}

async function saveS3(input: {
  readonly buffer: Buffer;
  readonly storageKey: string;
}): Promise<void> {
  await getS3Client().send(
    new PutObjectCommand({
      Bucket: env.S3_BUCKET,
      Key: input.storageKey,
      Body: input.buffer,
    }),
  );
}

export async function saveUpload(input: {
  readonly buffer: Buffer;
  readonly extension: string;
  readonly prefix?: "uploads" | "cms";
}): Promise<{ readonly storageKey: string; readonly checksumSha256: string }> {
  const checksumSha256 = sha256HexBuffer(input.buffer);
  const prefix = input.prefix ?? "uploads";
  const storageKey = `${prefix}/${randomUUID()}.${input.extension.replace(/^\./, "")}`;

  if (env.FILE_STORAGE_BACKEND === "s3") {
    try {
      await saveS3({ buffer: input.buffer, storageKey });
      recordUpload();
      return { storageKey, checksumSha256 };
    } catch (err) {
      logger.warn({
        msg: "s3 upload failed; falling back to local storage",
        err,
      });
    }
  }

  await saveLocal({ buffer: input.buffer, storageKey });
  recordUpload();
  return { storageKey, checksumSha256 };
}

export function openUploadStream(storageKey: string): Readable {
  if (env.FILE_STORAGE_BACKEND === "s3") {
    const stream = new Readable({
      read() {},
    });
    void (async () => {
      try {
        const result = await getS3Client().send(
          new GetObjectCommand({
            Bucket: env.S3_BUCKET,
            Key: storageKey,
          }),
        );
        const body = result.Body;
        if (body === undefined || body === null) {
          stream.destroy(new Error("empty s3 object"));
          return;
        }
        const nodeStream = body as Readable;
        nodeStream.on("data", (chunk: Buffer) => {
          stream.push(chunk);
        });
        nodeStream.on("end", () => {
          stream.push(null);
        });
        nodeStream.on("error", (err: Error) => {
          stream.destroy(err);
        });
      } catch (err) {
        logger.warn({
          msg: "s3 download failed; falling back to local storage",
          err,
        });
        try {
          const fullPath = resolveStoragePath(env.FILE_STORAGE_ROOT, storageKey);
          const local = createReadStream(fullPath);
          local.on("data", (chunk: string | Buffer) => {
            stream.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
          });
          local.on("end", () => {
            stream.push(null);
          });
          local.on("error", (localErr: Error) => {
            stream.destroy(localErr);
          });
        } catch (localErr) {
          stream.destroy(
            localErr instanceof Error ? localErr : new Error("storage read failed"),
          );
        }
      }
    })();
    return stream;
  }

  const fullPath = resolveStoragePath(env.FILE_STORAGE_ROOT, storageKey);
  return createReadStream(fullPath);
}

export async function deleteUpload(storageKey: string): Promise<void> {
  if (env.FILE_STORAGE_BACKEND === "s3") {
    try {
      await getS3Client().send(
        new DeleteObjectCommand({
          Bucket: env.S3_BUCKET,
          Key: storageKey,
        }),
      );
    } catch (err) {
      logger.warn({
        msg: "s3 delete failed; attempting local delete",
        err,
      });
    }
  }
  const fullPath = resolveStoragePath(env.FILE_STORAGE_ROOT, storageKey);
  try {
    await unlink(fullPath);
  } catch {
    return;
  }
}

export function extensionForMime(mime: string): string {
  switch (mime) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "application/pdf":
      return "pdf";
    case "video/mp4":
      return "mp4";
    case "video/webm":
      return "webm";
    default:
      return "bin";
  }
}
