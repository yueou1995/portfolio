import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import { portfolio } from "../src/data/portfolio.ts";

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: { width: 1200, height: 800 },
  deviceScaleFactor: 1,
  reducedMotion: "reduce",
  colorScheme: "light",
});

try {
  await mkdir("public/projects", { recursive: true });
  for (const project of portfolio.projects) {
    if (!project.thumbnail?.src.startsWith("/projects/") || !project.thumbnail.src.endsWith(".jpg")) continue;
    await page.goto(project.href, { waitUntil: "load" });
    await page.locator("h1").waitFor({ state: "visible" });
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({
      path: `public${project.thumbnail.src}`,
      type: "jpeg",
      quality: 88,
      animations: "disabled",
      scale: "css",
    });
    console.log(`${project.title}: captured 1200 x 800`);
  }
} finally {
  await browser.close();
}