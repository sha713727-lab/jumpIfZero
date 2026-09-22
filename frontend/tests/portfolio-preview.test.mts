import assert from "node:assert/strict";
import test from "node:test";
import {
  previewDurationMs,
  previewScrollDistance,
} from "../src/components/portfolio/portfolioPreviewMath.ts";

test("previewScrollDistance is non-negative overflow height", () => {
  assert.equal(previewScrollDistance(2400, 400), 2000);
  assert.equal(previewScrollDistance(400, 400), 0);
  assert.equal(previewScrollDistance(300, 400), 0);
});

test("previewDurationMs clamps to 3s–12s using 180px/s", () => {
  assert.equal(previewDurationMs(0), 3000);
  assert.equal(previewDurationMs(-10), 3000);
  assert.equal(previewDurationMs(180), 3000);
  assert.equal(previewDurationMs(900), 5000);
  assert.equal(previewDurationMs(10_000), 12000);
});
