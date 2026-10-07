import { expect, test } from "@playwright/test";

test("routes and assets work beneath /docs/", async ({ page }) => {
  await page.goto("/docs/");
  await expect(page.getByRole("heading", { name: "Welcome" })).toBeVisible();
  const hrefs = await page
    .locator("a[href^='/']")
    .evaluateAll((anchors) =>
      anchors.map((anchor) => (anchor as HTMLAnchorElement).href),
    );
  expect(
    hrefs.every((href) => new URL(href).pathname.startsWith("/docs/")),
  ).toBe(true);

  await page.goto("/docs/wiki/start-here/");
  await expect(
    page.getByRole("heading", { name: "Start here", level: 1 }),
  ).toBeVisible();
  const searchIndexResponse = await page.request.get("/docs/search-index.json");
  expect(searchIndexResponse.ok()).toBe(true);
});
