import { defineConfig, devices } from "@playwright/test";

const baseURL = "http://localhost:4321";
const projects = [
  { name: "chromium-desktop", use: { ...devices["Desktop Chrome"] } },
  {
    name: "chromium-mobile",
    use: { ...devices["iPhone 13"], browserName: "chromium" as const },
  },
  {
    name: "webkit",
    testIgnore: ["**/base-path.spec.ts", "**/performance.spec.ts"],
    use: { ...devices["Desktop Safari"] },
  },
];

if (process.env.PLAYWRIGHT_FIREFOX === "1") {
  projects.push({
    name: "firefox",
    testIgnore: ["**/base-path.spec.ts", "**/performance.spec.ts"],
    use: { ...devices["Desktop Firefox"] },
  });
}

if (process.env.PLAYWRIGHT_EDGE === "1") {
  projects.push({
    name: "edge",
    testIgnore: ["**/base-path.spec.ts", "**/performance.spec.ts"],
    use: { ...devices["Desktop Edge"], channel: "msedge" },
  } as (typeof projects)[number]);
}

export default defineConfig({
  testDir: "./tests/e2e",
  testIgnore: ["**/base-path.spec.ts", "**/performance.spec.ts"],
  fullyParallel: true,
  workers: 2,
  reporter: process.env.CI ? "line" : "list",
  use: { baseURL, trace: "retain-on-failure" },
  projects,
  webServer: {
    command: "npm run dev -- --host localhost",
    url: baseURL,
    env: { ASTRO_TELEMETRY_DISABLED: "1", ASTRO_DEV_BACKGROUND: "1" },
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
