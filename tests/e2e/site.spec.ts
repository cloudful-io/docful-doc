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

test("switches between light, dark, and auto appearance", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/");
  const root = page.locator("html");
  const appearance = page.getByRole("combobox", { name: "Appearance" });
  await expect(root).toHaveAttribute("data-theme", "dark");
  await appearance.selectOption("light");
  await expect(root).toHaveAttribute("data-theme", "light");
  await expect
    .poll(() =>
      page.evaluate(() => localStorage.getItem("docful-doc-appearance")),
    )
    .toBe("light");
  await page.reload();
  await expect(root).toHaveAttribute("data-theme", "light");
  await expect(appearance).toHaveValue("light");
  await appearance.selectOption("auto");
  await expect(root).toHaveAttribute("data-theme", "dark");
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
  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await expect(
    page.getByRole("button", { name: "Show navigation" }),
  ).toBeVisible();
  await expect(sidebar).toBeHidden();
  await toggle.click();
  await expect(sidebar).toBeVisible();
});

test("opens and closes navigation on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const toggle = page.getByRole("button", { name: "Open navigation" });
  const sidebar = page.getByRole("complementary", {
    name: "Documentation navigation",
  });
  await expect(sidebar).toBeHidden();
  await toggle.click();
  await expect(
    page.getByRole("button", { name: "Close navigation" }),
  ).toHaveAttribute("aria-expanded", "true");
  await page.keyboard.press("Escape");
  await expect(sidebar).toBeHidden();
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
