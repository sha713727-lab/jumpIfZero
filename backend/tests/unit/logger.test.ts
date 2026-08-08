import assert from "node:assert/strict";
import { Transform } from "node:stream";
import test from "node:test";
import { logger } from "../../src/lib/logger.ts";

test("logger redacts sensitive keys and omits stack traces", async () => {
  const chunks: string[] = [];
  const capture = new Transform({
    transform(chunk, _enc, cb) {
      chunks.push(String(chunk));
      cb();
    },
  });
  const original = process.stdout.write.bind(process.stdout);
  process.stdout.write = ((
    chunk: string | Uint8Array,
    encoding?: BufferEncoding | ((err?: Error | null) => void),
    cb?: (err?: Error | null) => void,
  ) => {
    chunks.push(String(chunk));
    if (typeof encoding === "function") {
      encoding(null);
      return true;
    }
    if (cb) {
      cb(null);
    }
    return true;
  }) as typeof process.stdout.write;

  try {
    logger.error({
      msg: "failed",
      correlationId: "cid",
      err: Object.assign(new Error("boom"), { stack: "SECRET_STACK" }),
      password: "should-not-appear",
    });
  } finally {
    process.stdout.write = original;
  }

  void capture;
  const line = chunks.join("");
  assert.match(line, /"level":"error"/);
  assert.match(line, /"correlationId":"cid"/);
  assert.doesNotMatch(line, /SECRET_STACK/);
  assert.doesNotMatch(line, /should-not-appear/);
  assert.match(line, /\[REDACTED\]/);
});
