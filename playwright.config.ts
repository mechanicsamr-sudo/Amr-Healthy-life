import { defineConfig } from "@playwright/test";

// الاختبارات تعمل على النسخة المبنية (out) بمقاس شاشة قريب من Samsung Galaxy S25 Ultra.
export default defineConfig({
  testDir: "tests/e2e",
  timeout: 60_000,
  fullyParallel: false,
  workers: 1,
  reporter: [["list"]],
  use: {
    baseURL: "http://localhost:4173",
    viewport: { width: 412, height: 891 },
    deviceScaleFactor: 3.5,
    isMobile: true,
    hasTouch: true,
    locale: "ar-EG",
    timezoneId: "Africa/Cairo",
    serviceWorkers: "block",
  },
  webServer: {
    command: "PORT=4173 node scripts/serve.mjs",
    url: "http://localhost:4173",
    reuseExistingServer: true,
  },
});
