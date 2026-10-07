import { defineConfig, devices } from "@playwright/test";

const baseURL = "http://127.0.0.1:4321";

export default defineConfig({
  testDir: "./tests/e2e",
  testMatch: ["**/performance.spec.ts"],
  workers: 1,
  reporter: process.env.CI ? "line" : "list",
  use: { baseURL, trace: "retain-on-failure" },
  projects: [
    { name: "chromium-desktop", use: { ...devices["Desktop Chrome"] } },
    {
      name: "chromium-mobile",
      use: { ...devices["iPhone 13"], browserName: "chromium" },
    },
  ],
  webServer: {
    command: "npm run dev -- --host 127.0.0.1",
    url: baseURL,
    env: { ASTRO_TELEMETRY_DISABLED: "1", ASTRO_DEV_BACKGROUND: "1" },
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
