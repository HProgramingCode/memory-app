# E2E テスト（Playwright）実装ガイド

ジュニアエンジニア向けに、E2E テスト（`tests/e2e/*.spec.ts`）の実装内容と背景知識を解説する。

---

## 目次

1. [E2E テストとは](#1-e2e-テストとは)
2. [なぜ E2E テストを書くのか](#2-なぜ-e2e-テストを書くのか)
3. [使用ツール: Playwright](#3-使用ツール-playwright)
4. [ファイル構成](#4-ファイル構成)
5. [環境構築と実行方法](#5-環境構築と実行方法)
6. [コード解説](#6-コード解説)
7. [実装手順（ゼロから書く場合）](#7-実装手順ゼロから書く場合)
8. [よくある疑問とトラブルシューティング](#8-よくある疑問とトラブルシューティング)
9. [ベストプラクティス](#9-ベストプラクティス)

---

## 1. E2E テストとは

**E2E（End-to-End）テスト**は、ユーザーの操作をシミュレートしてアプリ全体の動作を検証する手法。

```
ユーザー → ブラウザ → フロントエンド → API → データベース
           ↑
      E2E テストはここをシミュレート
```

### ユニットテストとの違い

| 観点 | ユニットテスト | E2E テスト |
|------|---------------|-----------|
| テスト対象 | 1つの関数 | アプリ全体 |
| 実行環境 | Node.js のみ | 実際のブラウザ |
| 実行速度 | 速い（ms） | 遅い（秒〜分） |
| 信頼性 | 高い | やや不安定になりやすい |
| 検出できるバグ | ロジックのバグ | UI・統合・UX のバグ |

### E2E テストで検証できること

- ページ遷移が正しく動作するか
- ボタンをクリックしたら期待通りの動作をするか
- フォーム入力 → 保存 → 一覧に反映されるか
- 認証が正しく機能するか

---

## 2. なぜ E2E テストを書くのか

### 1. ユーザー視点での品質保証

ユニットテストでは関数単体が正しくても、画面全体として動かないことがある。

```
例: 
- API は正しくデータを返す ✓
- フロントエンドの表示ロジックも正しい ✓
- でも props の渡し方が間違っていて画面に何も出ない ✗
```

E2E なら「画面に表示される」ことを直接検証できる。

### 2. リグレッション（回帰）の検知

```
「ログイン機能を修正したら、なぜかカード作成が動かなくなった」
```

こうした予期せぬ影響を自動で検知できる。

### 3. 手動テストの自動化

毎回「ログインして、カード作って、復習して…」を手でやるのは大変。自動化すれば数分で完了。

---

## 3. 使用ツール: Playwright

[Playwright](https://playwright.dev/) は Microsoft 製の E2E テストフレームワーク。

### Playwright の特徴

- **マルチブラウザ**: Chrome, Firefox, Safari を1つの API でテスト
- **自動待機**: 要素が表示されるまで自動でリトライ
- **並列実行**: 複数テストを同時実行
- **デバッグツール**: 失敗時の動画・スクリーンショット・トレース

### 主要な関数・オブジェクト

```typescript
import { test, expect, Page } from "@playwright/test";
```

| 名前 | 役割 |
|------|------|
| `test` | テストケースを定義 |
| `test.describe` | テストをグループ化 |
| `test.beforeEach` | 各テスト前に実行 |
| `expect` | アサーション |
| `page` | ブラウザページの操作 |

### page の主要メソッド

```typescript
// ナビゲーション
await page.goto("/");                    // URL に移動
await page.reload();                     // ページをリロード

// 要素の取得（ロケーター）
page.getByRole("button", { name: /保存/ })  // ロール + 名前
page.getByText("Hello")                      // テキストで取得
page.getByTestId("save-button")              // data-testid で取得
page.locator("css=.my-class")                // CSS セレクタ（非推奨）

// 操作
await locator.click();                   // クリック
await locator.fill("テキスト");           // 入力
await locator.press("Enter");            // キー押下

// 待機
await page.waitForURL(/\/dashboard/);    // URL が変わるまで待機
await page.waitForLoadState("networkidle"); // ネットワークが落ち着くまで
```

### よく使うアサーション

```typescript
// 可視性
await expect(locator).toBeVisible();     // 要素が表示されている
await expect(locator).toBeHidden();      // 要素が非表示

// テキスト
await expect(locator).toHaveText("Hello"); // テキストが一致
await expect(locator).toContainText("He"); // テキストを含む

// URL
await expect(page).toHaveURL(/\/login/); // URL が正規表現にマッチ

// 存在
await expect(locator).toHaveCount(3);    // 要素が 3 つある
```

---

## 4. ファイル構成

```
memory-app/
├── tests/
│   ├── e2e/                              # ★ E2E テストコード
│   │   ├── 01_login_dashboard.spec.ts
│   │   ├── 02_card_creation_study.spec.ts
│   │   └── 03_review_srs.spec.ts
│   ├── unit/                             # ユニットテスト
│   │   └── srs.test.ts
│   └── .auth/
│       └── user.json                     # 認証状態（Git 管理外）
├── testcase/
│   ├── e2e/                              # E2E テストケース仕様
│   │   ├── 01_login_dashboard.md
│   │   ├── 02_card_creation_study.md
│   │   ├── 03_review_srs.md
│   │   └── IMPLEMENTATION_GUIDE.md       # 本ドキュメント
│   └── fixtures/
├── playwright.config.ts                  # Playwright 設定
├── playwright-report/                    # テストレポート（Git 管理外）
└── package.json
```

---

## 5. 環境構築と実行方法

### 初回セットアップ

```bash
# 1. Playwright をインストール
npm install -D @playwright/test

# 2. ブラウザをインストール
npx playwright install
```

### 認証状態の準備（重要）

本プロジェクトは Google 認証を使用。テスト用に認証状態を保存する必要がある。

```bash
# 1. アプリを起動
npm run dev

# 2. 別ターミナルで認証状態を保存
npx playwright codegen --channel=chrome --save-storage=tests/.auth/user.json http://localhost:3000/login
```

ブラウザが開くので、手動で Google ログインを完了し、ブラウザを閉じる。`tests/.auth/user.json` が作成される。

### テスト用データの投入

```bash
npm run seed:e2e
```

今日が復習日のカードを含むテストデータが投入される。

### テスト実行

```bash
# 全テスト実行
npm run test:e2e

# 特定ファイルのみ
npm run test:e2e -- tests/e2e/01_login_dashboard.spec.ts

# UI モード（デバッグ時に便利）
npx playwright test --ui

# ヘッドフル（ブラウザを表示して実行）
npx playwright test --headed
```

### レポートの確認

```bash
npx playwright show-report
```

失敗時のスクリーンショット・動画・トレースが確認できる。

---

## 6. コード解説

### 6.1 基本構造（01_login_dashboard.spec.ts）

```typescript
import { test, expect } from "@playwright/test";

test.describe("未認証", () => {
  test("TC-E2E-01-01: 未認証でトップにアクセス", async ({ page }, testInfo) => {
    // 認証済みプロジェクトではスキップ
    test.skip(testInfo.project.name === "chromium-authenticated");
    
    await page.goto("/", { waitUntil: "networkidle" });
    await expect(page).toHaveURL(/\/login/);
    await expect(
      page.getByRole("button", { name: /Google でログイン/ })
    ).toBeVisible();
  });
});
```

**ポイント:**

1. **`test.describe`**: テストをグループ化
2. **`async ({ page }, testInfo)`**: `page` はフィクスチャから自動注入
3. **`test.skip`**: 条件によりテストをスキップ
4. **`waitUntil: "networkidle"`**: ページ読み込み完了まで待機
5. **`getByRole`**: アクセシビリティロールで要素を取得（推奨）

### 6.2 プロジェクト分け（認証あり/なし）

`playwright.config.ts` で 2 つのプロジェクトを定義:

```typescript
projects: [
  {
    name: "chromium",
    use: { ...devices["Desktop Chrome"] },
  },
  {
    name: "chromium-authenticated",
    use: {
      ...devices["Desktop Chrome"],
      storageState: "tests/.auth/user.json",  // 認証状態を読み込む
    },
  },
],
```

テスト内で `testInfo.project.name` を見て、どちらで実行されているか判断。

```typescript
// 認証済みプロジェクトでのみ実行
test.skip(testInfo.project.name !== "chromium-authenticated");
```

### 6.3 カード作成フロー（02_card_creation_study.spec.ts）

```typescript
test("TC-E2E-02-02: カード作成", async ({ page }) => {
  // 1. ダッシュボードからデッキ詳細へ
  await page.goto("/");
  await page.getByRole("listitem").first().getByRole("button").first().click();
  
  // 2. カード追加画面へ
  await page.getByRole("button", { name: /カードを追加/ }).click();
  await expect(page).toHaveURL(/\/cards\/new\?deckId=/);

  // 3. フォーム入力
  const frontInput = page.getByRole("textbox").first();
  const backInput = page.getByRole("textbox").nth(1);
  await frontInput.fill("E2Eテスト問題");
  await backInput.fill("E2Eテスト回答");

  // 4. 保存
  await page.getByRole("button", { name: /^保存$/ }).click();
  
  // 5. 結果確認
  await expect(page).toHaveURL(/\/decks\/[^/]+$/);
  await expect(
    page.getByRole("listitem").filter({ hasText: "E2Eテスト問題" })
  ).toBeVisible();
});
```

**フローの可視化:**

```
ダッシュボード → デッキ詳細 → カード追加画面 → 入力 → 保存 → デッキ詳細に戻る
      │              │              │                        │
      └──────────────┴──────────────┴────────────────────────┘
                         各ステップで URL と要素を検証
```

### 6.4 ヘルパー関数（03_review_srs.spec.ts）

複雑なロジックはヘルパー関数に抽出:

```typescript
/**
 * 復習を 1 枚完了し、次の状態を返す
 */
async function answerCard(
  page: Page,
  difficulty: "難しい" | "普通" | "簡単"
): Promise<"next_card" | "completed"> {
  // 1. 「答えを見る」をクリック
  const showAnswerBtn = page.getByRole("button", { name: /答えを見る/ });
  await showAnswerBtn.waitFor({ state: "visible", timeout: 10000 });
  await page.waitForTimeout(300);  // アニメーション待機
  await showAnswerBtn.click();

  // 2. 難易度ボタンをクリック
  const difficultyRegex = new RegExp(`^${difficulty}`);
  const difficultyBtn = page.getByRole("button", { name: difficultyRegex });
  await difficultyBtn.waitFor({ state: "visible", timeout: 10000 });
  await difficultyBtn.click();

  // 3. 次のカードか完了かを判定
  await page.waitForTimeout(300);
  
  const nextCard = page.getByRole("button", { name: /答えを見る/ });
  const completed = page.getByRole("button", { name: /ダッシュボードに戻る/ });

  if (await nextCard.isVisible().catch(() => false)) {
    return "next_card";
  }
  return "completed";
}
```

**なぜヘルパー関数を使うか:**

1. **再利用**: 同じ操作を複数テストで使える
2. **可読性**: テスト本体がシンプルになる
3. **保守性**: UI が変わったらヘルパーだけ修正

### 6.5 エラーハンドリング

```typescript
test("TC-E2E-03: 復習フロー", async ({ page }) => {
  await page.goto("/");
  
  // 認証失敗チェック
  if (page.url().includes("/login")) {
    throw new Error(
      "認証失敗: /login にリダイレクトされました。tests/.auth/user.json を再作成してください。"
    );
  }

  // データ不整合チェック
  const dueText = page.getByText(/(\d+)\s*枚が待っています/);
  const hasDue = await dueText.isVisible({ timeout: 5000 }).catch(() => false);
  
  if (!hasDue) {
    throw new Error(
      "データ不整合: 今日 due のカードがありません。npm run seed:e2e を実行してください。"
    );
  }
  
  // テスト本体...
});
```

**エラーメッセージに解決策を含める**のがポイント。失敗時に何をすればいいか分かる。

---

## 7. 実装手順（ゼロから書く場合）

### Step 1: テストケース仕様を読む

`testcase/e2e/01_login_dashboard.md` などを確認し、何をテストするか把握。

### Step 2: 手動で操作してみる

実際にブラウザでアプリを操作し、フローを確認。

```bash
npm run dev
# ブラウザで http://localhost:3000 を開いて操作
```

### Step 3: テストファイルを作成

```bash
touch tests/e2e/my_feature.spec.ts
```

### Step 4: 最小限のテストを書く

```typescript
import { test, expect } from "@playwright/test";

test("ページが表示される", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/Memory App/);
});
```

### Step 5: 実行して動作確認

```bash
npm run test:e2e -- tests/e2e/my_feature.spec.ts
```

### Step 6: ステップを追加

```typescript
test("カードを作成できる", async ({ page }) => {
  // Step 1: ダッシュボードへ
  await page.goto("/");
  
  // Step 2: デッキを選択
  await page.getByRole("listitem").first().click();
  
  // Step 3: カード追加
  // ...
});
```

### Step 7: アサーションを追加

```typescript
// 各ステップ後に検証を追加
await page.goto("/");
await expect(page.getByText("今日の復習")).toBeVisible();  // ← 追加
```

### Step 8: エッジケースを追加

- カードが 0 枚の場合
- 認証が切れている場合
- など

---

## 8. よくある疑問とトラブルシューティング

### Q1: テストが不安定（たまに失敗する）

**原因と対策:**

| 原因 | 対策 |
|------|------|
| 要素が表示される前にクリック | `await expect(btn).toBeVisible()` を追加 |
| アニメーション中に操作 | `await page.waitForTimeout(300)` を追加 |
| ネットワーク待ちが不足 | `waitUntil: "networkidle"` を使用 |
| タイムアウトが短い | `{ timeout: 15000 }` で延長 |

```typescript
// 良い例: 表示を待ってからクリック
const btn = page.getByRole("button", { name: /保存/ });
await expect(btn).toBeVisible();
await btn.click();
```

### Q2: 要素が見つからない

**デバッグ方法:**

```bash
# UI モードで実行（要素を確認しながら）
npx playwright test --ui

# ヘッドフル（ブラウザ表示）
npx playwright test --headed

# 録画を確認
npx playwright show-report
```

**ロケーターの優先順位:**

```typescript
// 1. 推奨: ロール + 名前（アクセシビリティ）
page.getByRole("button", { name: /保存/ })

// 2. 推奨: テキスト
page.getByText("保存する")

// 3. 推奨: data-testid（安定性が必要な場合）
page.getByTestId("save-button")

// 4. 非推奨: CSS セレクタ（壊れやすい）
page.locator(".btn-primary")
```

### Q3: 認証エラーが出る

```
認証失敗: /login にリダイレクトされました
```

**解決策:**

```bash
# 1. 認証状態を再作成
rm tests/.auth/user.json
npx playwright codegen --channel=chrome --save-storage=tests/.auth/user.json http://localhost:3000/login

# 2. ブラウザでログインして閉じる
```

### Q4: データがない

```
データ不整合: 今日 due のカードがありません
```

**解決策:**

```bash
npm run seed:e2e
```

### Q5: ポート 3000 が使用中

```bash
# 既存プロセスを終了
lsof -i :3000
kill -9 <PID>

# または SKIP_WEBSERVER を使用
npm run dev &
SKIP_WEBSERVER=1 npm run test:e2e
```

---

## 9. ベストプラクティス

### ロケーターの選び方

```typescript
// ✅ 良い: ユーザーが見る/操作する要素で取得
page.getByRole("button", { name: /学習を開始する/ })
page.getByRole("heading", { name: "今日の復習" })
page.getByLabel("表面テキスト")

// ❌ 避ける: 実装詳細に依存
page.locator(".MuiButton-root")
page.locator("#card-123")
```

### 待機の書き方

```typescript
// ✅ 良い: Web-first assertion（自動リトライ）
await expect(page.getByText("保存しました")).toBeVisible();

// ❌ 避ける: 固定時間待機
await page.waitForTimeout(5000);
```

### テストの独立性

```typescript
// ✅ 良い: 各テストが独立
test("カード作成", async ({ page }) => {
  // 自分でデッキに移動してカードを作成
  await page.goto("/");
  // ...
});

// ❌ 避ける: 前のテストに依存
test("カード編集", async ({ page }) => {
  // 前のテストで作成したカードを編集（危険）
});
```

### エラーメッセージ

```typescript
// ✅ 良い: 解決策を含める
if (!hasDue) {
  throw new Error(
    "データ不整合: 今日 due のカードがありません。npm run seed:e2e を実行してください。"
  );
}

// ❌ 避ける: 原因が分からない
if (!hasDue) {
  throw new Error("テスト失敗");
}
```

### コメントの使い方

```typescript
test("復習フロー", async ({ page }) => {
  // ダッシュボードにアクセス
  await page.goto("/");
  
  // 「学習を開始する」をクリック
  await page.getByRole("button", { name: /学習を開始する/ }).click();
  
  // TC-E2E-03-01: 「難しい」を選択
  await answerCard(page, "難しい");
});
```

**コメントは「何をしているか」ではなく「なぜ/何のテストか」を書く。**

---

## 参照

| ドキュメント | 内容 |
|--------------|------|
| `testcase/e2e/*.md` | テストケース仕様（何をテストするか） |
| `testcase/README.md` | テスト全体の方針・実行手順 |
| `playwright.config.ts` | Playwright 設定 |
| [Playwright 公式ドキュメント](https://playwright.dev/) | 詳細な API リファレンス |
| [Playwright ロケーター](https://playwright.dev/docs/locators) | 要素の取得方法 |
| [Playwright アサーション](https://playwright.dev/docs/test-assertions) | 検証方法 |
