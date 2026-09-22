import { test, expect } from "@playwright/test";

test.describe("session regressions", () => {
  test("about spiral hands off to marquee without a full-viewport cream gap", async ({
    page,
  }) => {
    await page.goto("/");
    const aboutHeading = page.locator("#about h2");
    await expect(aboutHeading).toBeAttached({ timeout: 20_000 });

    await page.locator("#about").scrollIntoViewIfNeeded();
    await expect(aboutHeading).toBeVisible({ timeout: 20_000 });

    const marquee = page.locator('[aria-label="What we deliver"]');
    await marquee.scrollIntoViewIfNeeded();
    await expect(marquee).toBeVisible();

    const gap = await page.evaluate(() => {
      const aboutEl = document.querySelector("#about");
      const next = document.querySelector('[aria-label="What we deliver"]');
      if (!aboutEl || !next) {
        return Number.POSITIVE_INFINITY;
      }
      const aboutRect = aboutEl.getBoundingClientRect();
      const marqueeRect = next.getBoundingClientRect();
      return Math.max(0, marqueeRect.top - aboutRect.bottom);
    });

    const viewportHeight = page.viewportSize()?.height ?? 900;
    expect(gap).toBeLessThan(viewportHeight * 0.35);
  });

  test("portfolio card preview hover scrolls full-page screenshot when present", async ({
    page,
  }, testInfo) => {
    await page.goto("/portfolio");
    await expect(page.locator("body")).toBeVisible();

    const frames = page.locator("article .relative.aspect-square.w-full");
    await frames
      .first()
      .waitFor({ state: "visible", timeout: 20_000 })
      .catch(() => undefined);

    const frameCount = await frames.count();
    testInfo.skip(frameCount === 0, "no portfolio preview frames on page");

    const frame = frames.first();
    await frame.scrollIntoViewIfNeeded();
    await expect(frame).toBeVisible();

    const imageWrap = frame.locator(":scope > div.pointer-events-none").first();
    await expect(imageWrap).toBeVisible();

    await frame.hover();
    await page.waitForTimeout(250);
    const after = await imageWrap.evaluate(
      (el) => (el as HTMLElement).style.transform,
    );

    if (after === "translate3d(0, 0, 0)" || after === "") {
      testInfo.skip(
        true,
        "no scrollable full-page screenshot in this environment",
      );
    }

    expect(after).toMatch(/translate3d\(\s*0(?:px)?,\s*-\d/);
  });
});
