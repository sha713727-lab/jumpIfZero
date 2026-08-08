import { test } from "node:test";
import assert from "node:assert/strict";
import { isSameOriginRequest } from "../src/lib/sameOrigin.ts";

test("isSameOriginRequest accepts matching Origin", () => {
  assert.equal(
    isSameOriginRequest({
      siteUrl: "https://jumpifzero.example",
      origin: "https://jumpifzero.example",
      referer: null,
    }),
    true,
  );
});

test("isSameOriginRequest rejects cross-site Origin", () => {
  assert.equal(
    isSameOriginRequest({
      siteUrl: "https://jumpifzero.example",
      origin: "https://evil.example",
      referer: "https://jumpifzero.example/login",
    }),
    false,
  );
});

test("isSameOriginRequest accepts matching Referer when Origin absent", () => {
  assert.equal(
    isSameOriginRequest({
      siteUrl: "https://jumpifzero.example",
      origin: null,
      referer: "https://jumpifzero.example/login",
    }),
    true,
  );
});

test("isSameOriginRequest rejects missing Origin and Referer", () => {
  assert.equal(
    isSameOriginRequest({
      siteUrl: "https://jumpifzero.example",
      origin: null,
      referer: null,
    }),
    false,
  );
});
