// tests/e2e/02_card_creation_study.spec.ts
// testcase/e2e/02_card_creation_study.md 準拠

import { test, expect } from "@playwright/test";

test.describe("カード作成 → 学習実行", () => {
  test.beforeEach(async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "chromium-authenticated");
  });

  test("TC-E2E-02-01: デッキ詳細から「カードを追加」で新規カード登録画面に遷移する", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(
      page.getByRole("button", { name: /学習を開始する/ }).or(page.getByText(/ALL CLEAR/))
    ).toBeVisible();

    await page.getByRole("listitem").first().getByRole("button").first().click();
    await expect(page).toHaveURL(/\/decks\/[^/]+$/);

    await page.getByRole("button", { name: /カードを追加/ }).click();
    await expect(page).toHaveURL(/\/cards\/new\?deckId=/);
    await expect(page.getByRole("heading", { name: /カードの登録/ })).toBeVisible();
    await expect(page.getByRole("textbox").first()).toBeVisible();
  });

  test("TC-E2E-02-02: 表面・裏面を入力して保存するとカードが作成され、デッキ詳細に戻る", async ({
    page,
  }) => {
    await page.goto("/");
    await page.getByRole("listitem").first().getByRole("button").first().click();
    await page.getByRole("button", { name: /カードを追加/ }).click();
    await expect(page).toHaveURL(/\/cards\/new\?deckId=/);

    const frontInput = page.getByRole("textbox").first();
    const backInput = page.getByRole("textbox").nth(1);
    await frontInput.fill("E2Eテスト問題");
    await backInput.fill("E2Eテスト回答");

    await page.getByRole("button", { name: /^保存$/ }).click();
    await expect(page).toHaveURL(/\/decks\/[^/]+$/, { timeout: 15000 });
    await expect(
      page.getByRole("listitem").filter({ hasText: "E2Eテスト問題" }).first()
    ).toBeVisible({ timeout: 10000 });
  });

  test("TC-E2E-02-03: 復習「学習を開始する」から復習画面に入り、カードの有無に応じた表示になる", async ({
    page,
  }) => {
    await page.goto("/");
    const startButton = page.getByRole("button", { name: /学習を開始する/ });
    if (await startButton.isVisible()) {
      await startButton.click();
    } else {
      await page.goto("/review");
    }
    await expect(page).toHaveURL(/\/review/);

    const hasCard = page.getByRole("button", { name: /答えを見る/ });
    const hasEmptyMessage = page.getByText(/今日の復習はありません|このデッキにカードがありません/);
    const hasBackButton = page.getByRole("button", { name: /ダッシュボードに戻る/ });

    await expect(hasCard.or(hasEmptyMessage).or(hasBackButton)).toBeVisible();
  });

  test("TC-E2E-02-04: デッキの「自由学習」から該当デッキのカードが並ぶ復習画面になる", async ({
    page,
  }) => {
    await page.goto("/");
    await page.getByRole("listitem").first().getByRole("button").first().click();
    await expect(page).toHaveURL(/\/decks\/[^/]+$/);

    const freeStudyButton = page.getByRole("button", { name: /自由学習/ });
    await freeStudyButton.click();
    await expect(page).toHaveURL(/\/review\?deckId=.*&mode=free/);

    const resumeDialog = page.getByRole("dialog").getByRole("button", { name: /続きから/ });
    if (await resumeDialog.isVisible()) await resumeDialog.click();

    const hasCard = page.getByRole("button", { name: /答えを見る/ });
    const hasNext = page.getByRole("button", { name: /次へ/ });
    const hasEmpty = page.getByText(/このデッキにカードがありません/);
    const hasComplete = page.getByRole("button", { name: /ダッシュボードに戻る/ });

    await expect(hasCard.or(hasNext).or(hasEmpty).or(hasComplete)).toBeVisible();
  });
});
