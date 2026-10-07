import { defineConfig, devices } from "@playwright/test";

const baseURL = "http://127.0.0.1:4322";

export default defineConfig({
  testDir: "./tests/e2e",
  reporter: process.env.CI ? "line" : "list",
  use: { baseURL, trace: "retain-on-failure" },
  projects: [
    { name: "chromium-desktop", use: { ...devices["Desktop Chrome"] } },
  ],
  webServer: {
    command: "npm run dev -- --host 127.0.0.1 --port 4322",
    url: `${baseURL}/docs/`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      ASTRO_TELEMETRY_DISABLED: "1",
      ASTRO_DEV_BACKGROUND: "1",
      DOCFUL_BASE_PATH: "/docs/",
    },
  },
});
