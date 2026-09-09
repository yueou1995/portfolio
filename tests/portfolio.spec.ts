import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { portfolio } from "../src/data/portfolio";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
});

test("keeps the single-column structure and contact links in the footer", async ({ page }) => {
  await expect(page.getByRole("main")).toHaveCount(1);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Yue Ou");
  await expect(page.locator(".professional-title")).toHaveText("Program Manager | Engineering background, design instincts");
  await expect(page.locator(".introduction p")).toHaveText(["Program Manager | Engineering background, design instincts"]);
  await expect(page.getByRole("region", { name: "About", exact: true }).locator(".about-copy p"))
    .toHaveText([
      "I care about what's worth building, and I love figuring out how to build it. My experience across software engineering, program management, and UX helps me connect what people need with what it takes to make it happen.",
      "AI is changing what's possible. I help teams find focus, make decisions, and ship\u2014even when the path forward isn't clear.",
    ]);
  await expect(page.getByRole("main")).not.toContainText(/senior design program manager/i);
  await expect(page.getByRole("heading", { level: 2 })).toHaveText([
    "About", "Experience", "Featured Projects", "Education",
  ]);
  await expect(page.getByRole("region", { name: "About", exact: true }).locator(".education")).toHaveCount(0);
  const education = page.getByRole("region", { name: "Education", exact: true }).locator(".education");
  await expect.poll(() => education.innerText()).toBe([
    "B.Sc. in Computer Science \u00b7 Minor in Business Administration",
    "Karlsruhe Institute of Technology, Germany",
  ].join("\n"));
  await expect(education.locator(".education-degree")).toHaveText("B.Sc. in Computer Science");
  await expect(education.locator(".education-degree")).toHaveCSS("font-weight", "500");
  await expect(education.getByText("Minor in Business Administration", { exact: true })).toHaveCSS("font-weight", "400");
  await expect(education.locator("br")).toHaveCount(1);
  await expect(page.locator("nav, aside, form, header a")).toHaveCount(0);
  await expect(page.locator("a a, a[href^='tel:']")).toHaveCount(0);
  await expect(page.getByText(/\u00a9\s*\d{4}\s*Yue Ou/)).toHaveCount(0);
  await expect(page.getByText("For conversations about inclusive design, building products, or a shared idea.", { exact: true })).toHaveCount(0);

  const footer = page.getByRole("contentinfo");
  await expect(footer).toHaveCount(1);
  await expect(footer.getByRole("link")).toHaveCount(2);
  await expect(page.locator('a[href^="mailto:"]')).toHaveCount(0);
  await expect(footer.getByRole("link", { name: "GitHub", exact: false }))
    .toHaveAttribute("href", "https://github.com/yueou1995");
  await expect(footer.getByRole("link", { name: "LinkedIn", exact: false }))
    .toHaveAttribute("href", "https://www.linkedin.com/in/yueou");

  const structure = await page.evaluate(() => {
    const main = document.querySelector("main")!;
    const mainBounds = main.getBoundingClientRect();
    const sections = Array.from(main.querySelectorAll(":scope > section"));
    const experienceSection = document.querySelector('[aria-labelledby="experience-heading"]')!;
    const projectSection = document.querySelector('[aria-labelledby="projects-heading"]')!;
    const educationSection = document.querySelector('[aria-labelledby="education-heading"]')!;
    const footer = document.querySelector("footer")!;
    return {
      centered: Math.abs(mainBounds.left - (innerWidth - mainBounds.width) / 2) < 1,
      aligned: sections.every((section) => {
        const bounds = section.getBoundingClientRect();
        return Math.abs(bounds.left - mainBounds.left) < 1 && Math.abs(bounds.width - mainBounds.width) < 1;
      }),
      width: mainBounds.width,
      order: experienceSection.getBoundingClientRect().bottom <= projectSection.getBoundingClientRect().top &&
        projectSection.getBoundingClientRect().bottom <= educationSection.getBoundingClientRect().top &&
        educationSection.getBoundingClientRect().bottom <= footer.getBoundingClientRect().top,
      misplacedContacts: Array.from(document.querySelectorAll(
        'a[href^="mailto:"], a[href*="github.com"], a[href*="linkedin.com"]',
      )).filter((anchor) => !footer.contains(anchor)).length,
    };
  });
  expect(structure.centered).toBe(true);
  expect(structure.aligned).toBe(true);
  expect(structure.width).toBeLessThanOrEqual(760);
  expect(structure.order).toBe(true);
  expect(structure.misplacedContacts).toBe(0);
});

test("puts UI Traps first and includes the site work as the second DPM bullet", async ({ page }) => {
  const projects = page.getByRole("region", { name: "Featured Projects", exact: true });
  await expect(projects.locator(".project-title > span:first-child")).toHaveText([
    "UI Traps",
    "Microsoft Inclusive Design",
    "Inclusive Design for Cognition",
    "Microsoft Immersive Reader",
  ]);

  const experience = page.locator(".experience-entry").filter({
    has: page.getByRole("heading", { name: "Design Program Manager", exact: true }),
  });
  const highlights = experience.locator(".experience-highlights > li");
  await expect(highlights).toHaveCount(4);
  await expect(highlights.nth(1)).toHaveText("Led the launch and evolution of the Microsoft Inclusive Design site, with resources adopted by 30+ enterprise customers and featured in the UN Women toolkit.");
  await expect(highlights.nth(1).locator("strong, b")).toHaveCount(0);
});

test("links Experience mentions to their featured project destinations", async ({ page, isMobile }) => {
  const experience = page.getByRole("region", { name: "Experience", exact: true });
  const references = [
    {
      text: "Microsoft Inclusive Design site",
      projectId: "inclusive-design",
      highlight: "Led the launch and evolution of the Microsoft Inclusive Design site, with resources adopted by 30+ enterprise customers and featured in the UN Women toolkit.",
    },
    {
      text: "Immersive Reader",
      projectId: "immersive-reader",
      highlight: "Built full-stack features for OneNote Learning Tools (Immersive Reader), improving reading accessibility for learners of all abilities.",
    },
  ];
  await expect(experience.getByRole("link")).toHaveCount(references.length);
  for (const { text, projectId, highlight } of references) {
    const link = experience.getByRole("link", { name: `${text} (opens in a new tab)`, exact: true });
    const projectLink = page.locator(`#${projectId}-title a`);
    await expect(link).toHaveAttribute("href", (await projectLink.getAttribute("href"))!);
    await expect(link).toHaveAttribute("target", "_blank");
    await expect(link).toHaveAttribute("rel", "noopener noreferrer");
    await expect(link).toHaveCSS("display", "inline");
    await expect(link).toHaveCSS("text-decoration-line", "none");
    await expect(link).toHaveCSS("color", "rgb(184, 154, 255)");
    await expect(link).toHaveCSS("font-weight", "400");
    await expect(experience.locator(".experience-highlights > li").filter({
      has: page.getByRole("link", { name: `${text} (opens in a new tab)`, exact: true }),
    })).toHaveText(highlight);
    if (!isMobile) {
      await link.hover();
      await expect(link).toHaveCSS("text-decoration-line", "none");
      await expect(link).toHaveCSS("color", "rgb(211, 191, 255)");
      await page.mouse.move(0, 0);
    }
    await link.focus();
    await expect(link).toHaveCSS("text-decoration-line", "none");
    await expect(link).toHaveCSS("outline-style", "solid");
  }
});

test("includes the updated Azure Copilot experience highlight", async ({ page }) => {
  const highlight = page.getByRole("region", { name: "Experience", exact: true })
    .locator(".experience-highlights > li")
    .filter({ hasText: "Improved accessibility and responsible AI practices" });
  await expect(highlight).toHaveText("Improved accessibility and responsible AI practices for Azure Copilot. Co-led a design sprint to identify customer needs and opportunities to improve onboarding, retention, and Azure usage.");
  await expect(highlight.locator("strong, b")).toHaveCount(0);
});

test("includes Inclusive Design for Cognition with its summary, contribution, and link", async ({ page }) => {
  const project = page.getByRole("article", { name: "Inclusive Design for Cognition (opens in a new tab)", exact: true });
  await expect(project).toBeVisible();
  const link = project.getByRole("link");
  await expect(link).toHaveAttribute("href", "https://www.microsoft.com/en-us/garage/wall-of-fame/inclusive-design-for-cognition/");
  await expect(link).toHaveAttribute("target", "_blank");
  await expect(link).toHaveAttribute("rel", "noopener noreferrer");
  await expect(project.locator(".project-description, .project-contribution")).toHaveText([
    "Co-led the project. It won the 2022 Microsoft Global Hackathon and was inducted into the Microsoft Garage Wall of Fame.",
    "A Microsoft Garage project using co-design to reduce cognitive barriers in digital experiences.",
  ]);
  await expect(project.locator("strong")).toHaveText("Co-led the project.");
});

test("includes Microsoft Immersive Reader with its summary, contribution, and link", async ({ page }) => {
  const project = page.getByRole("article", { name: "Microsoft Immersive Reader (opens in a new tab)", exact: true });
  await expect(project).toBeVisible();
  const link = project.getByRole("link");
  await expect(link).toHaveAttribute("href", "https://learn.microsoft.com/en-us/training/educator-center/product-guides/immersive-reader/");
  await expect(link).toHaveAttribute("target", "_blank");
  await expect(link).toHaveAttribute("rel", "noopener noreferrer");
  await expect(project.locator(".project-description, .project-contribution")).toHaveText([
    "Built full-stack features and tooling for Immersive Reader.",
    "A reading tool that supports comprehension with read-aloud, translation, and personalized reading settings across Microsoft products.",
  ]);
  await expect(project.locator("strong")).toHaveText("Built full-stack features and tooling");
  await expect(project.getByRole("img")).toHaveAttribute("src", /immersive-reader\.avif/);
});

test("puts contributions before project summaries with focused emphasis", async ({ page }) => {
  const projects = page.getByRole("region", { name: "Featured Projects", exact: true });
  await expect(projects.locator("h3 + .project-contribution + .project-description"))
    .toHaveCount(portfolio.projects.length);
  await expect(projects.locator(".project-contribution strong")).toHaveText([
    "Vibe coded this personal project",
    "Led the site\u2019s launch and evolution",
    "Co-led the project.",
    "Built full-stack features and tooling",
  ]);

  for (const project of await projects.locator(".project-card").all()) {
    const contribution = project.locator(".project-contribution");
    const titleColor = await project.locator(".project-title")
      .evaluate((element) => getComputedStyle(element).color);
    await expect(contribution).toHaveCSS("font-size", "14px");
    await expect(contribution).toHaveCSS("font-weight", "400");
    await expect(contribution).toHaveCSS("color", titleColor);
    await expect(contribution.locator("strong")).toHaveCSS("font-weight", "600");
    await expect(project.locator(".project-description")).toHaveCSS("font-size", "14px");
  }
});

test("keeps body copy free of unintended bold emphasis", async ({ page }) => {
  const bodyCopy = page.locator(".about-copy, .experience-highlights, .project-description");
  await expect(bodyCopy).not.toHaveCount(0);
  await expect(bodyCopy.locator("strong, b")).toHaveCount(0);
  const emphasizedText = await bodyCopy.evaluateAll((blocks) => blocks
    .flatMap((block) => [block, ...block.querySelectorAll("*")])
    .filter((element) => Number(getComputedStyle(element).fontWeight) > 400)
    .map((element) => element.textContent?.trim()),
  );
  expect(emphasizedText).toEqual([]);
});

test("reflows without clipping at phone, tablet, and desktop widths", async ({ page }, testInfo) => {
  const originalViewport = page.viewportSize()!;
  for (const width of [320, 390, 768, 1440, 1920]) {
    await page.setViewportSize({ width, height: 900 });
    const layout = await page.evaluate(() => {
      const entry = document.querySelector(".experience-entry")!;
      const period = entry.firstElementChild!.getBoundingClientRect();
      const details = entry.lastElementChild!.getBoundingClientRect();
      const elements = Array.from(document.querySelectorAll("main p, main h1, main h2, main h3, main a, main img, footer a"));
      return {
        overflow: document.documentElement.scrollWidth > innerWidth,
        textOutsideViewport: elements.some((element) => {
          const bounds = element.getBoundingClientRect();
          return bounds.left < 0 || bounds.right > innerWidth + 1;
        }),
        stacked: period.bottom <= details.top,
        sideBySide: period.right < details.left,
        standaloneTargets: Array.from(document.querySelectorAll("main a:not(.inline-link), footer a"), (anchor) => anchor.getBoundingClientRect().height),
      };
    });
    expect(layout.overflow, `overflow at ${width}px`).toBe(false);
    expect(layout.textOutsideViewport, `clipped text at ${width}px`).toBe(false);
    expect(width < 640 ? layout.stacked : layout.sideBySide).toBe(true);
    expect(layout.standaloneTargets.every((height) => height >= 44)).toBe(true);
  }
  await page.setViewportSize(originalViewport);
  await page.getByRole("contentinfo").scrollIntoViewIfNeeded();
  for (const image of await page.locator(".project-thumbnail").all()) {
    await expect.poll(() => image.evaluate((element: HTMLImageElement) => element.complete && element.naturalWidth > 0)).toBe(true);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: testInfo.outputPath("full-page.png"), fullPage: true, animations: "disabled" });
});

test("supports the skip link, keyboard focus, and project feedback", async ({ page }) => {
  await page.keyboard.press("Tab");
  const skipLink = page.getByRole("link", { name: "Skip to content" });
  await expect(skipLink).toBeFocused();
  await expect(skipLink).toBeInViewport();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("main")).toBeFocused();

  for (const control of await page.locator("main button, main a, footer a").all()) {
    await page.keyboard.press("Tab");
    await expect(control).toBeFocused();
    await expect(control).toHaveCSS("outline-style", "solid");
    await expect(control).toHaveCSS("outline-width", "2px");
  }
  const projectLink = page.locator(".project-title").first();
  await projectLink.focus();
  await expect(projectLink).toHaveCSS("color", "rgb(184, 154, 255)");
  const background = await page.locator(".project-card").first().evaluate((element) =>
    getComputedStyle(element).backgroundColor.match(/[\d.]+/g)!.map(Number),
  );
  expect(background.slice(0, 3)).toEqual([184, 154, 255]);
  expect(background[3]).toBeCloseTo(0.045, 2);
});

test("has no detected WCAG A or AA accessibility violations", async ({ page }) => {
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(results.violations).toEqual([]);
});

test("serves the YO favicon through page metadata", async ({ page }) => {
  const icon = page.locator('link[rel="icon"][type="image/svg+xml"]');
  await expect(icon).toHaveCount(1);
  await expect(icon).toHaveAttribute("sizes", "any");
  const iconUrl = await icon.getAttribute("href");
  expect(iconUrl).toMatch(/^\/icon\.svg(?:\?|$)/);
  const response = await page.request.get(iconUrl!);
  expect(response.ok()).toBe(true);
  expect(response.headers()["content-type"]).toContain("image/svg+xml");
  expect(await response.text()).toContain("<title>Yue Ou</title>");
});

test("loads real lazy thumbnails and accurate metadata without runtime errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  await page.reload();
  const projects = page.getByRole("region", { name: "Featured Projects" });
  await projects.scrollIntoViewIfNeeded();
  await expect(projects.locator(".project-title")).toHaveCount(4);
  await expect(projects.locator("img")).toHaveCount(4);
  for (const project of portfolio.projects) {
    if (!project.thumbnail) continue;
    const image = projects.getByRole("article", { name: `${project.title} (opens in a new tab)`, exact: true }).getByRole("img");
    await image.scrollIntoViewIfNeeded();
    await expect(image).toHaveAttribute("loading", "lazy");
    await expect(image).toHaveAttribute("width", String(project.thumbnail.width));
    await expect(image).toHaveAttribute("height", String(project.thumbnail.height));
    await expect(image).toHaveAttribute("alt", project.thumbnail.alt);
    await expect.poll(() => image.evaluate((element: HTMLImageElement) => element.complete && element.naturalWidth > 0)).toBe(true);
  }
  await expect(page).toHaveTitle("Yue Ou | Design Program Manager");
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute("content", "Yue Ou | Design Program Manager");
  await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /^Yue Ou is a Design Program Manager at Microsoft/);
  await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute("content", "summary_large_image");
  for (const [selector, attribute] of [
    ['meta[property="og:url"]', "content"],
    ['link[rel="canonical"]', "href"],
  ]) {
    const url = await page.locator(selector).getAttribute(attribute);
    expect(new URL(url!).href).toBe("https://portfolio.ou-yue.workers.dev/");
  }
  expect(errors).toEqual([]);
});

test("limits the spotlight to fine hover pointers and handles enter, leave, and blur", async ({ page, isMobile }) => {
  const spotlight = page.locator(".spotlight");
  await expect(spotlight).toHaveAttribute("data-active", "false");
  await expect(spotlight).toHaveCSS("opacity", "0");
  await expect(spotlight).toHaveCSS("pointer-events", "none");
  await expect(spotlight).toHaveCSS("position", "fixed");
  await expect(page.locator("body")).not.toHaveCSS("cursor", "none");
  const eligible = await page.evaluate(() => matchMedia("(hover: hover) and (pointer: fine)").matches);
  expect(eligible).toBe(!isMobile);

  if (!eligible) {
    await page.mouse.move(200, 160);
    await expect(spotlight).toHaveAttribute("data-active", "false");
    await expect(spotlight).toHaveCSS("opacity", "0");
    return;
  }

  await expect(async () => {
    await page.mouse.move(199, 159);
    await page.mouse.move(200, 160);
    await expect(spotlight).toHaveAttribute("data-active", "true");
  }).toPass();
  await expect(spotlight).toHaveCSS("--spotlight-x", "200px");
  await expect(spotlight).toHaveCSS("--spotlight-y", "160px");
  await expect(spotlight).toHaveCSS("opacity", "1");
  await page.evaluate(() => window.scrollTo(0, 300));
  await expect(spotlight).toHaveCSS("--spotlight-y", "160px");

  await page.locator("html").dispatchEvent("pointerleave", { pointerType: "mouse" });
  await expect(spotlight).toHaveAttribute("data-active", "false");
  await expect(spotlight).toHaveCSS("opacity", "0");
  await page.locator("html").dispatchEvent("pointerenter", { pointerType: "mouse", clientX: 180, clientY: 140 });
  await expect(spotlight).toHaveAttribute("data-active", "true");
  await page.evaluate(() => window.dispatchEvent(new Event("blur")));
  await expect(spotlight).toHaveAttribute("data-active", "false");

  await page.evaluate(() => {
    window.dispatchEvent(new PointerEvent("pointermove", { pointerType: "mouse", clientX: 50, clientY: 60 }));
    document.documentElement.dispatchEvent(new PointerEvent("pointerleave", { pointerType: "mouse" }));
  });
  await page.evaluate(() => new Promise<void>((resolve) => requestAnimationFrame(() => resolve())));
  await expect(spotlight).toHaveAttribute("data-active", "false");
});

test("honors reduced motion at load and when the preference changes", async ({ page, isMobile }) => {
  const spotlight = page.locator(".spotlight");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.reload();
  await page.mouse.move(150, 150);
  await expect(spotlight).toHaveCSS("display", "none");
  await expect(spotlight).toHaveAttribute("data-active", "false");
  const projectLink = page.locator(".project-title").first();
  await projectLink.focus();
  await expect(projectLink).toHaveCSS("transition-duration", "0s");
  await expect(projectLink.locator(".link-arrow")).toHaveCSS("transform", "none");

  if (!isMobile) {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await expect(async () => {
      await page.mouse.move(160, 150);
      await page.mouse.move(170, 160);
      await expect(spotlight).toHaveAttribute("data-active", "true");
    }).toPass();
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.mouse.move(180, 170);
    await expect(spotlight).toHaveAttribute("data-active", "false");
    await expect(spotlight).toHaveCSS("display", "none");
  }
});

test.describe("without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("provides a static sharing image for link previews", async ({ page }) => {
    const image = page.locator('meta[property="og:image"]');
    await expect(image).toHaveCount(1);
    const imageUrl = new URL((await image.getAttribute("content"))!);
    expect(imageUrl.origin).toBe("https://portfolio.ou-yue.workers.dev");
    expect(imageUrl.pathname).toBe("/opengraph-image.png");
    await expect(page.locator('meta[property="og:image:type"]')).toHaveAttribute("content", "image/png");
    await expect(page.locator('meta[property="og:image:width"]')).toHaveAttribute("content", "1200");
    await expect(page.locator('meta[property="og:image:height"]')).toHaveAttribute("content", "630");
    await expect(page.locator('meta[property="og:image:alt"]')).toHaveAttribute("content", "Yue Ou, Design Program Manager.");
    await expect(page.locator('meta[name="twitter:image"]')).toHaveAttribute("content", imageUrl.href);
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute("content", "summary_large_image");

    const crawlerResponse = await page.request.get("/", {
      headers: { "User-Agent": "facebookexternalhit/1.1" },
    });
    expect(crawlerResponse.ok()).toBe(true);
    expect(await crawlerResponse.text()).toContain(imageUrl.href);
    const imageResponse = await page.request.get(`${imageUrl.pathname}${imageUrl.search}`);
    expect(imageResponse.ok()).toBe(true);
    expect(imageResponse.headers()["content-type"]).toContain("image/png");
    expect((await imageResponse.body()).byteLength).toBeLessThan(5 * 1024 * 1024);
  });

  test("keeps all content and links available", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Yue Ou", exact: true })).toBeVisible();
    await expect(page.locator(".introduction p")).toHaveText(["Program Manager | Engineering background, design instincts"]);
    await expect(page.getByRole("heading", { level: 2 })).toHaveCount(4);
    await expect(page.locator("main a")).toHaveCount(6);
    await expect(page.locator(".experience-highlights a")).toHaveCount(2);
    await expect(page.locator("footer a")).toHaveCount(2);
    await expect(page.locator('a[href^="mailto:"]')).toHaveCount(0);
    await expect(page.locator(".experience-entry")).toHaveCount(3);
    await expect.poll(() => page.locator(".education").innerText()).toBe([
      "B.Sc. in Computer Science \u00b7 Minor in Business Administration",
      "Karlsruhe Institute of Technology, Germany",
    ].join("\n"));
    await expect(page.locator(".spotlight")).toHaveCSS("opacity", "0");
    await expect(page.locator(".theme-toggle")).toBeHidden();
    await page.getByRole("contentinfo").scrollIntoViewIfNeeded();
    await expect(page.getByRole("contentinfo").getByRole("link", { name: "GitHub", exact: false })).toBeVisible();
    await expect(page.getByRole("contentinfo").getByRole("link", { name: "LinkedIn", exact: false })).toBeVisible();
  });
});