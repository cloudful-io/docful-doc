import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("renders the nested wiki and navigation hierarchy", async ({ page }) => {
  await page.goto("/");
  if ((page.viewportSize()?.width ?? 0) <= 700) {
    await page.getByRole("button", { name: "Open navigation" }).click();
  }
  await expect(
    page.getByRole("navigation", { name: "Wiki pages" }),
  ).toBeVisible();
  await expect(
    page
      .getByRole("navigation", { name: "Wiki pages" })
      .getByRole("link", { name: "Search and navigation" }),
  ).toBeVisible();
  await expect(
    page
      .getByRole("navigation", { name: "Wiki pages" })
      .getByRole("link", { name: "Start here" }),
  ).toBeVisible();
});

test("searches page body text and links to the result", async ({ page }) => {
  await page.goto("/");
  await page
    .getByRole("searchbox", { name: "Search documentation" })
    .fill("task lists");
  await page.getByRole("button", { name: "Search", exact: true }).click();
  await expect(page.locator("[data-search-status]")).toContainText("matching");
  await expect(page.locator("[data-search-results] a").first()).toBeVisible();
});

test("provides section links and copies rendered page text", async ({
  page,
}) => {
  await page.addInitScript(() => {
    let clipboardText = "";
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: async (text: string) => {
          clipboardText = text;
        },
        readText: async () => clipboardText,
      },
    });
  });
  await page.goto("/wiki/start-here/");
  await expect(
    page.getByRole("navigation", { name: "On this page" }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Markdown features" }).first().click();
  await expect(page).toHaveURL(/#markdown-features$/);
  await page.getByRole("button", { name: "Copy page text" }).click();
  await expect(page.locator("[data-copy-status]")).toHaveText(
    "Page text copied.",
  );
  await expect
    .poll(() => page.evaluate(() => navigator.clipboard.readText()))
    .toContain("Welcome to your documentation site");
});

test("changes Light, Dark, and System appearance from the theme menu", async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/");
  if ((page.viewportSize()?.width ?? 0) <= 700) {
    await page.getByRole("button", { name: "Open navigation" }).click();
  }
  const root = page.locator("html");
  const appearance = page.locator("[data-theme-picker-toggle]");
  const menu = page.getByRole("menu");
  await expect(
    page.getByRole("complementary", { name: "Documentation navigation" }),
  ).toContainText("System");
  await expect(appearance).toBeInViewport();
  await expect(root).toHaveAttribute("data-theme", "dark");
  await expect(appearance).toHaveAccessibleName(
    "Change theme, current mode System",
  );
  await expect(appearance.locator('[data-theme-icon="auto"]')).toBeVisible();
  await appearance.focus();
  await page.keyboard.press("Enter");
  await expect(menu).toBeVisible();
  const menuBox = await menu.boundingBox();
  const sidebarBox = await page
    .getByRole("complementary", { name: "Documentation navigation" })
    .boundingBox();
  expect(menuBox).not.toBeNull();
  expect(sidebarBox).not.toBeNull();
  expect(menuBox!.x).toBeGreaterThanOrEqual(sidebarBox!.x);
  expect(menuBox!.x + menuBox!.width).toBeLessThanOrEqual(
    sidebarBox!.x + sidebarBox!.width,
  );
  await expect(
    page.getByRole("menuitemradio", { name: "System" }),
  ).toHaveAttribute("aria-checked", "true");
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Enter");
  await expect(root).toHaveAttribute("data-theme", "light");
  await expect(appearance).toHaveAccessibleName(
    "Change theme, current mode Light",
  );
  await expect(appearance.locator('[data-theme-icon="light"]')).toBeVisible();
  await expect
    .poll(() =>
      page.evaluate(() => localStorage.getItem("docful-doc-appearance")),
    )
    .toBe("light");
  await page.reload();
  if ((page.viewportSize()?.width ?? 0) <= 700) {
    await page.getByRole("button", { name: "Open navigation" }).click();
  }
  await expect(root).toHaveAttribute("data-theme", "light");
  await expect(appearance).toHaveAccessibleName(
    "Change theme, current mode Light",
  );
  await appearance.focus();
  await page.keyboard.press("Enter");
  await expect(menu).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(menu).toBeHidden();
  await expect(appearance).toBeFocused();
  await page.emulateMedia({ colorScheme: "dark" });
  await expect
    .poll(() =>
      page.evaluate(
        () => window.matchMedia("(prefers-color-scheme: dark)").matches,
      ),
    )
    .toBe(true);
  await appearance.focus();
  await page.keyboard.press("Enter");
  await page.getByRole("menuitemradio", { name: "System" }).click();
  await expect(root).toHaveAttribute("data-theme", "dark");
  await expect(appearance).toHaveAccessibleName(
    "Change theme, current mode System",
  );
  await expect
    .poll(() =>
      page.evaluate(() => localStorage.getItem("docful-doc-appearance")),
    )
    .toBeNull();
  await page.emulateMedia({ colorScheme: "light" });
  await expect(root).toHaveAttribute("data-theme", "light");
});

test("collapses and reopens the page navigation", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto("/");
  const toggle = page.locator("[data-sidebar-toggle]");
  await expect(toggle).toHaveAccessibleName("Hide navigation");
  await expect(toggle.locator("svg")).toBeVisible();
  await expect(toggle).toHaveCSS("width", "40px");
  const sidebar = page.getByRole("complementary", {
    name: "Documentation navigation",
  });
  const pageTree = page.getByRole("navigation", { name: "Wiki pages" });
  const themePicker = page.locator("[data-theme-picker-toggle]");
  await pageTree.evaluate((nav) => {
    const list = nav.querySelector("ul");
    for (let index = 0; index < 50; index += 1) {
      const item = document.createElement("li");
      const link = document.createElement("a");
      link.href = `#extra-${index}`;
      link.textContent = `Extra page ${index}`;
      item.append(link);
      list?.append(item);
    }
  });
  const footer = page.locator(".sidebar-footer");
  const footerBeforeScroll = await footer.boundingBox();
  await pageTree.evaluate((nav) => {
    nav.scrollTop = nav.scrollHeight;
  });
  const footerAfterScroll = await footer.boundingBox();
  expect(footerBeforeScroll?.y).toBe(footerAfterScroll?.y);
  expect(footerAfterScroll?.y).toBeGreaterThanOrEqual(0);
  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await expect(toggle).toHaveAccessibleName("Show navigation");
  await expect(sidebar).toBeVisible();
  await expect(pageTree).toBeHidden();
  await expect(themePicker).toBeVisible();
  await expect(toggle).toBeInViewport();
  const toggleBox = await toggle.boundingBox();
  const themeBox = await themePicker.boundingBox();
  const footerBox = await page.locator(".sidebar-footer").boundingBox();
  const sidebarBox = await sidebar.boundingBox();
  expect(toggleBox).not.toBeNull();
  expect(themeBox).not.toBeNull();
  expect(footerBox).not.toBeNull();
  expect(sidebarBox).not.toBeNull();
  expect(Math.abs(toggleBox!.y - themeBox!.y)).toBeLessThan(1);
  expect(
    sidebarBox!.y + sidebarBox!.height - (footerBox!.y + footerBox!.height),
  ).toBeLessThan(40);
  await toggle.click();
  await expect(toggle).toHaveAccessibleName("Hide navigation");
  await expect(pageTree).toBeVisible();
});

test("opens and closes navigation on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const toggle = page.getByRole("button", { name: "Open navigation" });
  const sidebar = page.getByRole("complementary", {
    name: "Documentation navigation",
  });
  const pageTree = page.getByRole("navigation", { name: "Wiki pages" });
  await expect(sidebar).toBeVisible();
  await expect(pageTree).toBeHidden();
  await expect(
    page.getByRole("button", { name: "Open navigation" }),
  ).toBeVisible();
  const themePicker = page.locator("[data-theme-picker-toggle]");
  await expect(themePicker).toBeVisible();
  const toggleBox = await toggle.boundingBox();
  const themeBox = await themePicker.boundingBox();
  expect(toggleBox).not.toBeNull();
  expect(themeBox).not.toBeNull();
  expect(Math.abs(toggleBox!.y - themeBox!.y)).toBeLessThan(1);
  await toggle.click();
  await expect(
    page.getByRole("button", { name: "Close navigation" }),
  ).toHaveAttribute("aria-expanded", "true");
  await expect(pageTree).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(sidebar).toBeVisible();
  await expect(pageTree).toBeHidden();
  await expect(
    page.getByRole("button", { name: "Open navigation" }),
  ).toBeFocused();
});

test("keeps page content readable without JavaScript", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("/wiki/start-here/");
  await expect(
    page.getByRole("heading", { name: "Start here", level: 1 }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Markdown features" }),
  ).toBeVisible();
  await context.close();
});

test("sanitizes raw HTML and unsafe link protocols", async ({ page }) => {
  await page.goto("/wiki/start-here/");
  await expect(page.locator("[data-wiki-content] script")).toHaveCount(0);
  await expect
    .poll(() =>
      page.evaluate(() => Boolean((window as any).__docfulUnsafeMarkupRan)),
    )
    .toBe(false);
  const unsafeLink = page
    .locator("[data-wiki-content] a")
    .filter({ hasText: "Unsafe protocol example" });
  await expect(unsafeLink).toHaveCount(1);
  await expect(unsafeLink).not.toHaveAttribute("href", /^javascript:/i);
  await expect(
    page.locator("[data-wiki-content] input[type='checkbox']").first(),
  ).toHaveAttribute("aria-label", /Add a Markdown page/);
});

test("has no serious automated accessibility violations on the reader page", async ({
  page,
}) => {
  await page.goto("/wiki/start-here/");
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .analyze();
  expect(results.violations).toEqual([]);
});
