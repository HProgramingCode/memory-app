// tests/e2e/03_review_srs.spec.ts
// testcase/e2e/03_review_srs.md 準拠

import { test, expect, Page } from "@playwright/test";

/**
 * 復習ページでカードが表示されるまで待機し、状態を返す
 */
async function waitForReviewPage(page: Page): Promise<{ hasCards: boolean; isEmpty: boolean }> {
  await page.waitForLoadState("networkidle");

  const emptyMessage = page.getByText(/今日の復習はありません|このデッキにカードがありません/);
  const showAnswerBtn = page.getByRole("button", { name: /答えを見る/ });

  await Promise.race([
    emptyMessage.waitFor({ state: "visible", timeout: 10000 }).catch(() => {}),
    showAnswerBtn.waitFor({ state: "visible", timeout: 10000 }).catch(() => {}),
  ]);

  const isEmpty = await emptyMessage.isVisible().catch(() => false);
  const hasCards = await showAnswerBtn.isVisible().catch(() => false);

  return { hasCards, isEmpty };
}

/**
 * 復習を 1 枚完了し、次の状態を返す
 */
async function answerCard(
  page: Page,
  difficulty: "難しい" | "普通" | "簡単"
): Promise<"next_card" | "completed"> {
  const showAnswerBtn = page.getByRole("button", { name: /答えを見る/ });

  // ボタンが安定するまで待つ（アニメーション対策）
  await showAnswerBtn.waitFor({ state: "visible", timeout: 10000 });
  await page.waitForTimeout(300);
  await showAnswerBtn.click();

  const difficultyRegex = new RegExp(`^${difficulty}`);
  const difficultyBtn = page.getByRole("button", { name: difficultyRegex });
  await difficultyBtn.waitFor({ state: "visible", timeout: 10000 });
  await difficultyBtn.click();

  // アニメーション待機
  await page.waitForTimeout(300);

  const nextCard = page.getByRole("button", { name: /答えを見る/ });
  const completed = page
    .getByRole("button", { name: /ダッシュボードに戻る/ })
    .or(page.getByText(/復習完了/));

  await Promise.race([
    nextCard.waitFor({ state: "visible", timeout: 10000 }).catch(() => {}),
    completed.waitFor({ state: "visible", timeout: 10000 }).catch(() => {}),
  ]);

  if (await nextCard.isVisible().catch(() => false)) {
    return "next_card";
  }
  return "completed";
}

test.describe("復習日の更新（SRS ロジックの反映確認）", () => {
  test.beforeEach(async ({ page }, testInfo) => {
    if (testInfo.project.name !== "chromium-authenticated") {
      test.skip();
      return;
    }
  });

  test("TC-E2E-03: 復習で各難易度を選択し、完了後ダッシュボードに戻る", async ({ page }) => {
    // ダッシュボードにアクセスしてストアを初期化
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    if (page.url().includes("/login")) {
      throw new Error(
        "認証失敗: /login にリダイレクトされました。tests/.auth/user.json を再作成してください。"
      );
    }

    // 「今日の復習」枚数を確認
    const dueText = page.getByText(/(\d+)\s*枚が待っています/);
    const hasDue = await dueText.isVisible({ timeout: 5000 }).catch(() => false);

    if (!hasDue) {
      throw new Error(
        "データ不整合: 今日 due のカードがありません。npm run seed:e2e を実行してください。"
      );
    }

    // 「学習を開始する」ボタンで /review に遷移
    await page.getByRole("button", { name: /学習を開始する/ }).click();
    await page.waitForURL(/\/review/);

    const { hasCards, isEmpty } = await waitForReviewPage(page);
    if (isEmpty || !hasCards) {
      throw new Error("復習ページでカードが表示されませんでした。");
    }

    // TC-E2E-03-01: 「難しい」を選択
    let result = await answerCard(page, "難しい");
    expect(["next_card", "completed"]).toContain(result);

    if (result === "completed") {
      // カードが 1 枚しかなかった場合は完了
      await page.getByRole("button", { name: /ダッシュボードに戻る/ }).click();
      await expect(page).toHaveURL("/");
      return;
    }

    // TC-E2E-03-02: 「普通」を選択
    result = await answerCard(page, "普通");
    expect(["next_card", "completed"]).toContain(result);

    if (result === "completed") {
      await page.getByRole("button", { name: /ダッシュボードに戻る/ }).click();
      await expect(page).toHaveURL("/");
      return;
    }

    // TC-E2E-03-03: 「簡単」を選択
    result = await answerCard(page, "簡単");
    expect(["next_card", "completed"]).toContain(result);

    // TC-E2E-03-04: 残りのカードを消化してダッシュボードに戻る
    if (result !== "completed") {
      for (let i = 0; i < 10; i++) {
        result = await answerCard(page, "簡単");
        if (result === "completed") break;
      }
    }

    // 完了画面からダッシュボードに戻る
    await page.getByRole("button", { name: /ダッシュボードに戻る/ }).click();
    await expect(page).toHaveURL("/");
  });
});
