import { defineConfig, devices } from "@playwright/test";
import path from "path";
import dotenv from "dotenv";

/** E2E で起動するサーバーが .env と同じ DB・認証を使うよう、親プロセスで .env を読んでおく（子プロセスは process.env を継承） */
dotenv.config({ path: path.resolve(__dirname, ".env"), quiet: true });

/** Playwright の webServer に渡す環境変数（型エラーを避けるため string のみ） */
const webServerEnv: Record<string, string> = {
  ...process.env,
  DATABASE_URL: process.env.DATABASE_URL ?? "file:./dev.db",
  AUTH_URL: process.env.AUTH_URL ?? "http://localhost:3000",
};

if (process.env.AUTH_SECRET) {
  webServerEnv.AUTH_SECRET = process.env.AUTH_SECRET;
}
if (process.env.AUTH_GOOGLE_ID) {
  webServerEnv.AUTH_GOOGLE_ID = process.env.AUTH_GOOGLE_ID;
}
if (process.env.AUTH_GOOGLE_SECRET) {
  webServerEnv.AUTH_GOOGLE_SECRET = process.env.AUTH_GOOGLE_SECRET;
}

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: "./tests",
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: "html",
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('')`. */
    baseURL: "http://localhost:3000",

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: "on-first-retry",

    /* 失敗時のみ動画を保存（常に残す場合は 'on'） */
    //video: "on",
    video: "retain-on-failure",

    /* 失敗時のスクリーンショット */
    screenshot: "only-on-failure",
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "chromium-authenticated",
      use: {
        ...devices["Desktop Chrome"],
        storageState: "tests/.auth/user.json",
      },
    },

    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },

    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Run your local dev server before starting the tests. SKIP_WEBSERVER=1 のときは起動しない（手動で npm run dev している場合） */
  ...(process.env.SKIP_WEBSERVER
    ? {}
    : {
        webServer: {
          command: "npm run dev",
          url: "http://localhost:3000",
          reuseExistingServer: !process.env.CI,
          timeout: 120_000,
          env: webServerEnv,
        },
      }),
});
