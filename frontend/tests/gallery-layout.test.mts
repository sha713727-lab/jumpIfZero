import assert from "node:assert/strict";
import test from "node:test";
import {
  GALLERY_DESKTOP,
  GALLERY_MOBILE,
  GALLERY_TABLET,
  resolveLayoutConfig,
  resolveViewport,
} from "../src/components/FloatingGallery/utils.ts";

test("resolveViewport classifies mobile tablet desktop breakpoints", () => {
  assert.deepEqual(resolveViewport(375, 800), {
    width: 375,
    height: 800,
    isMobile: true,
    isTablet: false,
  });
  assert.deepEqual(resolveViewport(800, 900), {
    width: 800,
    height: 900,
    isMobile: false,
    isTablet: true,
  });
  assert.deepEqual(resolveViewport(1440, 900), {
    width: 1440,
    height: 900,
    isMobile: false,
    isTablet: false,
  });
});

test("resolveLayoutConfig selects the matching gallery layout", () => {
  assert.equal(
    resolveLayoutConfig(resolveViewport(375, 800)),
    GALLERY_MOBILE,
  );
  assert.equal(
    resolveLayoutConfig(resolveViewport(800, 900)),
    GALLERY_TABLET,
  );
  assert.equal(
    resolveLayoutConfig(resolveViewport(1440, 900)),
    GALLERY_DESKTOP,
  );
});

test("gallery pin scrollDistance stays within tightened caps", () => {
  assert.ok(GALLERY_DESKTOP.scrollDistance <= 900);
  assert.ok(GALLERY_TABLET.scrollDistance <= 780);
  assert.ok(GALLERY_MOBILE.scrollDistance <= 680);
  assert.ok(GALLERY_DESKTOP.scrollDistance > 0);
  assert.ok(GALLERY_TABLET.scrollDistance > 0);
  assert.ok(GALLERY_MOBILE.scrollDistance > 0);
});
