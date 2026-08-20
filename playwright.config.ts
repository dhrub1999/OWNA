import { defineConfig, devices } from "@playwright/test";

/**
 * End-to-end coverage of the core loop.
 *
 * Runs against a real dev server and a real Supabase project, so it is opt-in
 * rather than part of the default test run:
 *
 *   OWNA_E2E=1 bun run test:e2e
 */
const baseURL = process.env.OWNA_E2E_BASE_URL ?? "http://localhost:3000";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: process.env.OWNA_E2E_BASE_URL
    ? undefined
    : {
        command: "bun run dev",
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
});
