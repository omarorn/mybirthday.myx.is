import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 30_000,
  retries: 0,
  use: {
    baseURL: "http://localhost:8787",
    viewport: { width: 390, height: 844 },
  },
  webServer: {
    command: "npm run dev",
    port: 8787,
    reuseExistingServer: true,
    timeout: 20_000,
  },
  projects: [{ name: "chromium", use: { browserName: "chromium" } }],
});
