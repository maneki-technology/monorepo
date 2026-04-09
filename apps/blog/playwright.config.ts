import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  retries: 0,
  use: {
    baseURL: "http://localhost:5175",
    headless: true,
    viewport: { width: 1280, height: 900 },
  },
  webServer: {
    command: "npx vite --port 5175",
    port: 5175,
    reuseExistingServer: true,
    timeout: 30_000,
  },
});
