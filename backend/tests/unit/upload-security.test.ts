import assert from "node:assert/strict";
import test from "node:test";
import {
  assertAllowedUploadMime,
  assertSafeStorageKey,
  contentDispositionHeader,
  detectMagicMime,
  resolveStoragePath,
  sanitizeDownloadFilename,
} from "../../src/lib/upload-security.ts";

const PNG = Buffer.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x00,
]);

test("detectMagicMime recognizes png jpeg webp pdf", () => {
  assert.equal(detectMagicMime(PNG), "image/png");
  assert.equal(
    detectMagicMime(Buffer.from([0xff, 0xd8, 0xff, 0xe0])),
    "image/jpeg",
  );
  const webp = Buffer.alloc(12);
  webp.write("RIFF", 0);
  webp.write("WEBP", 8);
  assert.equal(detectMagicMime(webp), "image/webp");
  assert.equal(detectMagicMime(Buffer.from("%PDF-1.4")), "application/pdf");
  assert.equal(detectMagicMime(Buffer.from("not-a-file")), null);
});

test("assertAllowedUploadMime rejects unknown bytes", () => {
  assert.equal(assertAllowedUploadMime(PNG), "image/png");
  assert.throws(() => assertAllowedUploadMime(Buffer.from("MZ")), /Unsupported/);
});

test("assertSafeStorageKey rejects traversal and absolute paths", () => {
  assert.doesNotThrow(() => assertSafeStorageKey("uploads/a.png"));
  assert.throws(() => assertSafeStorageKey("../etc/passwd"));
  assert.throws(() => assertSafeStorageKey("/abs/path"));
  assert.throws(() => assertSafeStorageKey("uploads\\win"));
  assert.throws(() => assertSafeStorageKey("uploads//a.png"));
});

test("resolveStoragePath stays under root", () => {
  const resolved = resolveStoragePath("/var/lib/jumpifzero/files", "uploads/a.png");
  assert.match(resolved.replaceAll("\\", "/"), /uploads\/a\.png$/);
  assert.throws(() =>
    resolveStoragePath("/var/lib/jumpifzero/files", "uploads/../../etc/passwd"),
  );
});

test("sanitizeDownloadFilename strips CR LF and controls", () => {
  assert.equal(
    sanitizeDownloadFilename("report\r\nSet-Cookie: x=1.pdf"),
    "reportSet-Cookie: x=1.pdf",
  );
  assert.equal(sanitizeDownloadFilename("  notes.pdf  "), "notes.pdf");
  assert.equal(sanitizeDownloadFilename("\u0000\u001f"), "download");
});

test("contentDispositionHeader is injection-safe", () => {
  const header = contentDispositionHeader(
    "attachment",
    'evil\r\nX-Injected: yes".pdf',
  );
  assert.equal(header.includes("\r"), false);
  assert.equal(header.includes("\n"), false);
  assert.match(header, /^attachment; filename="/);
  assert.match(header, /filename\*=UTF-8''/);
});

test("contentDispositionHeader preserves safe ascii names", () => {
  assert.equal(
    contentDispositionHeader("attachment", "quarterly-report.pdf"),
    'attachment; filename="quarterly-report.pdf"; filename*=UTF-8\'\'quarterly-report.pdf',
  );
});
