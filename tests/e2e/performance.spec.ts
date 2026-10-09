import { expect, test } from "@playwright/test";
import os from "node:os";

test("records 30 page-load Core Web Vitals trials for the active Chrome device profile", async ({
  browser,
  baseURL,
}, testInfo) => {
  test.skip(
    !testInfo.project.name.startsWith("chromium-"),
    "Performance profile is measured in Chrome.",
  );
  test.setTimeout(180_000);
  const mobile = testInfo.project.name.includes("mobile");
  const viewport = mobile
    ? { width: 390, height: 844 }
    : { width: 1365, height: 900 };
  const samples: Array<{
    lcp: number;
    cls: number;
    inp: number;
    search: number;
  }> = [];
  for (let trial = 0; trial < 30; trial += 1) {
    const context = await browser.newContext({ viewport });
    const page = await context.newPage();
    await page.addInitScript(() => {
      const metrics = { lcp: 0, cls: 0, inp: 0 };
      Object.assign(window, { __docfulMetrics: metrics });
      new PerformanceObserver((list) => {
        const last = list.getEntries().at(-1);
        if (last) metrics.lcp = last.startTime;
      }).observe({ type: "largest-contentful-paint", buffered: true });
      new PerformanceObserver((list) => {
        metrics.cls += list.getEntries().reduce((total, entry) => {
          const shift = entry as PerformanceEntry & {
            hadRecentInput?: boolean;
            value?: number;
          };
          return total + (shift.hadRecentInput ? 0 : (shift.value ?? 0));
        }, 0);
      }).observe({ type: "layout-shift", buffered: true });
      try {
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            const event = entry as PerformanceEntry & {
              interactionId?: number;
            };
            if (event.interactionId)
              metrics.inp = Math.max(metrics.inp, event.duration);
          }
        }).observe({
          type: "event",
          buffered: true,
          durationThreshold: 16,
        } as PerformanceObserverInit & { durationThreshold: number });
      } catch {
        // Event Timing may be unavailable in an older browser build.
      }
    });
    await page.goto(baseURL ?? "/", { waitUntil: "load" });
    const searchStart = Date.now();
    await page
      .getByRole("searchbox", { name: "Search documentation" })
      .fill("task lists");
    await page
      .getByRole("searchbox", { name: "Search documentation" })
      .press("Enter");
    await expect(page.locator("[data-search-status]")).toContainText(
      "matching",
    );
    const search = Date.now() - searchStart;
    await page.waitForTimeout(100);
    const metrics = await page.evaluate(
      () =>
        (
          window as unknown as {
            __docfulMetrics: { lcp: number; cls: number; inp: number };
          }
        ).__docfulMetrics,
    );
    samples.push({ ...metrics, search });
    await context.close();
  }
  const p75 = (values: number[]) =>
    values.sort((a, b) => a - b)[Math.ceil(values.length * 0.75) - 1];
  const lcpP75 = p75(samples.map((sample) => sample.lcp));
  const clsP75 = p75(samples.map((sample) => sample.cls));
  const inpP75 = p75(samples.map((sample) => sample.inp));
  const searchP75 = p75(samples.map((sample) => sample.search));
  console.info(
    JSON.stringify({
      profile: testInfo.project.name,
      browser: `Chromium ${browser.version()}`,
      viewport,
      runtime: `${os.platform()} ${os.arch()}`,
      cache: "fresh browser context for each trial",
      cpu: "unthrottled local workstation CPU",
      network: "unthrottled local loopback development server",
      samples: 30,
      lcpP75Ms: Number(lcpP75.toFixed(1)),
      clsP75: Number(clsP75.toFixed(3)),
      inpP75Ms: Number(inpP75.toFixed(1)),
      searchResponseP75Ms: Number(searchP75.toFixed(1)),
    }),
  );
  expect(samples).toHaveLength(30);
});
