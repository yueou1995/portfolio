import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { chromium } from "@playwright/test";
import { portfolio } from "../src/data/portfolio.ts";

const font = await readFile(new URL(
  "../node_modules/@fontsource-variable/manrope/files/manrope-latin-wght-normal.woff2",
  import.meta.url,
));
const browser = await chromium.launch();

try {
  const page = await browser.newPage({
    viewport: { width: 1200, height: 630 },
    deviceScaleFactor: 1,
    reducedMotion: "reduce",
  });
  await page.setContent(`
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="utf-8">
        <style>
          @font-face {
            font-family: Manrope;
            src: url(data:font/woff2;base64,${font.toString("base64")}) format("woff2");
            font-weight: 200 800;
            font-style: normal;
          }
          * { box-sizing: border-box; letter-spacing: 0; }
          html, body { width: 1200px; height: 630px; margin: 0; }
          body {
            --background: #100e17;
            --foreground: #f5f3ff;
            --accent: #b89aff;
            background-color: var(--background);
            background-image:
              linear-gradient(rgb(184 154 255 / 0.025) 1px, transparent 1px),
              linear-gradient(90deg, rgb(184 154 255 / 0.025) 1px, transparent 1px);
            background-size: 64px 64px;
            background-position: center;
            color: var(--foreground);
            font-family: Manrope, sans-serif;
          }
          main {
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            padding: 56px;
          }
          h1 { margin: 0; font-size: 96px; font-weight: 650; line-height: 1.15; }
          p { margin: 20px 0 0; color: var(--accent); font-size: 36px; font-weight: 500; line-height: 1.4; }
        </style>
      </head>
      <body>
        <main>
          <h1></h1>
          <p></p>
        </main>
      </body>
    </html>
  `);
  await page.locator("h1").evaluate((element, name) => {
    element.textContent = name;
  }, portfolio.name);
  await page.locator("p").evaluate((element, title) => {
    element.textContent = title;
  }, portfolio.title);
  await page.evaluate(() => document.fonts.ready);
  assert.equal(await page.locator("img, svg").count(), 0);
  assert.deepEqual(await page.locator("main > *").allTextContents(), [portfolio.name, portfolio.title]);
  assert.ok(await page.evaluate(() => document.fonts.check("650 96px Manrope")));
  const cropSafe = await page.locator("h1, p").evaluateAll((elements) =>
    elements.every((element) => {
      const bounds = element.getBoundingClientRect();
      return bounds.left >= 309 && bounds.right <= 891 && bounds.top >= 56 && bounds.bottom <= 574;
    }),
  );
  assert.ok(cropSafe, "The name and role must fit inside the centered square crop.");
  await page.screenshot({
    path: "src/app/opengraph-image.png",
    type: "png",
    animations: "disabled",
    scale: "css",
  });
  console.log("Created src/app/opengraph-image.png: 1200 x 630, local Manrope font, square-crop-safe content.");
} finally {
  await browser.close();
}