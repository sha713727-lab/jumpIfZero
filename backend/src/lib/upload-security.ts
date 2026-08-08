import path from "node:path";
import { BadRequestError } from "./errors.ts";

const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
]);

export function detectMagicMime(buffer: Buffer): string | null {
  if (
    buffer.byteLength >= 3 &&
    buffer[0] === 0xff &&
    buffer[1] === 0xd8 &&
    buffer[2] === 0xff
  ) {
    return "image/jpeg";
  }
  if (
    buffer.byteLength >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return "image/png";
  }
  if (
    buffer.byteLength >= 12 &&
    buffer.toString("ascii", 0, 4) === "RIFF" &&
    buffer.toString("ascii", 8, 12) === "WEBP"
  ) {
    return "image/webp";
  }
  if (buffer.byteLength >= 5 && buffer.toString("ascii", 0, 5) === "%PDF-") {
    return "application/pdf";
  }
  if (
    buffer.byteLength >= 12 &&
    buffer.toString("ascii", 4, 8) === "ftyp"
  ) {
    return "video/mp4";
  }
  if (
    buffer.byteLength >= 4 &&
    buffer[0] === 0x1a &&
    buffer[1] === 0x45 &&
    buffer[2] === 0xdf &&
    buffer[3] === 0xa3
  ) {
    return "video/webm";
  }
  return null;
}

export function assertAllowedUploadMime(buffer: Buffer): string {
  const mime = detectMagicMime(buffer);
  if (mime === null || !ALLOWED_MIME.has(mime)) {
    throw new BadRequestError("Unsupported file type");
  }
  return mime;
}

export function assertSafeStorageKey(storageKey: string): void {
  if (storageKey.length === 0 || storageKey.length > 1024) {
    throw new BadRequestError("Invalid storage key");
  }
  if (
    storageKey.includes("\0") ||
    storageKey.includes("\\") ||
    path.isAbsolute(storageKey) ||
    storageKey.split("/").some((part) => part === ".." || part === "")
  ) {
    throw new BadRequestError("Invalid storage key");
  }
}

export function resolveStoragePath(
  root: string,
  storageKey: string,
): string {
  assertSafeStorageKey(storageKey);
  const resolvedRoot = path.resolve(root);
  const resolved = path.resolve(resolvedRoot, storageKey);
  const relative = path.relative(resolvedRoot, resolved);
  if (
    relative.startsWith("..") ||
    path.isAbsolute(relative) ||
    relative.length === 0
  ) {
    throw new BadRequestError("Invalid storage key");
  }
  return resolved;
}

export function sanitizeDownloadFilename(originalName: string): string {
  const cleaned = originalName
    .replace(/[\u0000-\u001f\u007f]/g, "")
    .trim()
    .slice(0, 200);
  return cleaned.length > 0 ? cleaned : "download";
}

export function contentDispositionHeader(
  disposition: "attachment" | "inline",
  originalName: string,
): string {
  const cleaned = sanitizeDownloadFilename(originalName);
  const ascii = cleaned
    .replace(/[^\x20-\x7e]/g, "_")
    .replace(/["\\]/g, "_");
  const encoded = encodeURIComponent(cleaned).replace(
    /['()*]/g,
    (char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`,
  );
  return `${disposition}; filename="${ascii}"; filename*=UTF-8''${encoded}`;
}
