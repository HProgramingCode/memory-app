// tests/e2e/01_login_dashboard.spec.ts
// testcase/e2e/01_login_dashboard.md 準拠

import { test, expect } from "@playwright/test";

test.describe("未認証", () => {
  test("TC-E2E-01-01: 未認証でトップにアクセスしたとき、ログイン画面にリダイレクトされる", async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name === "chromium-authenticated");
    await page.goto("/", { waitUntil: "networkidle" });
    await expect(page).toHaveURL(/\/login/);
    await expect(
      page.getByRole("button", { name: /Google でログイン/ }),
    ).toBeVisible();
  });

  test("TC-E2E-01-03: ログインページで Google ログインボタンが表示される", async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name === "chromium-authenticated");
    await page.goto("/login");
    await expect(
      page.getByRole("button", { name: /Google でログイン/ }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /Memory App/ }),
    ).toBeVisible();
  });
});

test.describe("認証済み ダッシュボード表示", () => {
  test("TC-E2E-01-02: 認証済みでトップにアクセスしたとき、ダッシュボードが表示される", async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== "chromium-authenticated");
    await page.goto("/", { waitUntil: "networkidle" });
    await expect(page).not.toHaveURL(/\/login/);

    // ダッシュボードのメイン要素がレンダリングされるまで待つ
    const dashboardContent = page
      .getByRole("button", { name: /学習を開始する/ })
      .or(page.getByText(/ALL CLEAR/));
    await expect(dashboardContent).toBeVisible({ timeout: 15000 });
  });
});
