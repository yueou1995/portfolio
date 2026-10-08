import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("switches themes without moving content and remembers the selection", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  await page.goto("/");
  const root = page.locator("html");
  const spotlightAlpha = () => page.locator(".spotlight").evaluate((element) => {
    const color = getComputedStyle(element).backgroundImage.match(/rgba\(([^)]+)\)/)!;
    return Number(color[1].split(",")[3]);
  });
  await expect(root).toHaveAttribute("data-theme", "dark");
  await expect(page.locator("body")).toHaveCSS("background-color", "rgb(16, 14, 23)");
  expect(await spotlightAlpha()).toBeCloseTo(0.1, 2);
  const originalHeading = await page.getByRole("heading", { level: 1 }).boundingBox();

  await page.getByRole("button", { name: "Switch to light mode", exact: true }).click();
  await expect(root).toHaveAttribute("data-theme", "light");
  await expect(page.locator("body")).toHaveCSS("background-color", "rgb(245, 243, 252)");
  expect(await spotlightAlpha()).toBeCloseTo(0.03, 2);
  await expect(page.locator("body")).toHaveCSS("color-scheme", "light");
  await expect(page.getByRole("button", { name: "Switch to dark mode", exact: true })).toBeVisible();
  await page.mouse.move(0, 0);
  await expect(page.locator(".theme-tooltip")).toBeHidden();
  expect(await page.getByRole("heading", { level: 1 }).boundingBox()).toEqual(originalHeading);
  expect(await page.evaluate(() => localStorage.getItem("yue-portfolio-theme"))).toBe("light");

  await page.reload();
  await expect(root).toHaveAttribute("data-theme", "light");
  await page.getByRole("button", { name: "Switch to dark mode", exact: true }).click();
  await expect(root).toHaveAttribute("data-theme", "dark");
  await page.reload();
  await expect(root).toHaveAttribute("data-theme", "dark");
  await expect(page.getByRole("button", { name: "Switch to light mode", exact: true })).toBeVisible();
  expect(errors).toEqual([]);
});

test("restores a saved light theme before React hydration", async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem("yue-portfolio-theme", "light"));
  await page.route("**/_next/**/*.js", (route) => route.abort());
  await page.goto("/", { waitUntil: "load" });
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await expect(page.locator("body")).toHaveCSS("background-color", "rgb(245, 243, 252)");
  await expect(page.getByRole("heading", { name: "Yue Ou", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Switch to dark mode", exact: true })).toBeVisible();
});

test("supports keyboard switching, visible focus, and reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Skip to content" })).toBeFocused();
  await page.keyboard.press("Tab");
  const toggle = page.getByRole("button", { name: "Switch to light mode", exact: true });
  await expect(toggle).toBeFocused();
  await expect(toggle).toHaveCSS("outline-width", "2px");
  await expect(toggle).toHaveCSS("outline-style", "solid");
  await expect(toggle).toHaveCSS("transition-duration", "0s");
  await expect(page.locator(".theme-tooltip")).toBeVisible();
  await page.keyboard.press("Enter");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await expect(page.getByRole("button", { name: "Switch to dark mode", exact: true })).toBeFocused();
  await expect(page.locator(".spotlight")).toHaveCSS("display", "none");
  await page.keyboard.press("Space");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
});

test("keeps the control top-right and the light layout unclipped", async ({ page }, testInfo) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Switch to light mode", exact: true }).click();
  const originalViewport = page.viewportSize()!;
  for (const width of [320, 390, 768, 1440, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    const layout = await page.evaluate(() => {
      const main = document.querySelector("main")!.getBoundingClientRect();
      const heading = document.querySelector("h1")!.getBoundingClientRect();
      const toggle = document.querySelector(".theme-toggle")!.getBoundingClientRect();
      return {
        overflow: document.documentElement.scrollWidth > innerWidth,
        rightAligned: Math.abs(main.right - toggle.right) < 1,
        nextToName: toggle.left > heading.right && Math.abs(toggle.top - heading.top) < 6,
        width: toggle.width,
        height: toggle.height,
      };
    });
    expect(layout.overflow, `${width}px light layout`).toBe(false);
    expect(layout.rightAligned).toBe(true);
    expect(layout.nextToName).toBe(true);
    expect(layout.width).toBe(44);
    expect(layout.height).toBe(44);
  }
  await page.setViewportSize(originalViewport);
  await page.getByRole("contentinfo").scrollIntoViewIfNeeded();
  for (const image of await page.locator(".project-thumbnail").all()) {
    await expect.poll(() => image.evaluate((element: HTMLImageElement) => element.complete && element.naturalWidth > 0)).toBe(true);
  }
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.mouse.move(0, 0);
  await page.screenshot({ path: testInfo.outputPath("light-full-page.png"), fullPage: true, animations: "disabled" });
});

test("has no detected accessibility violations in either theme", async ({ page }) => {
  await page.goto("/");
  for (const theme of ["dark", "light"]) {
    if (theme === "light") {
      await page.getByRole("button", { name: "Switch to light mode", exact: true }).click();
    }
    await expect(page.locator("html")).toHaveAttribute("data-theme", theme);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
      .analyze();
    expect(results.violations, `${theme} accessibility`).toEqual([]);
  }
});

test("still switches when browser storage is unavailable", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.addInitScript(() => {
    Object.defineProperty(window, "localStorage", {
      get() { throw new DOMException("Storage blocked", "SecurityError"); },
    });
  });
  await page.goto("/");
  await page.getByRole("button", { name: "Switch to light mode", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await page.getByRole("button", { name: "Switch to dark mode", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  expect(errors).toEqual([]);
});