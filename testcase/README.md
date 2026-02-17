# テストケース一覧

`requirements/15_test_requirement.md` に基づくテスト実装用のケース定義。  
実装時はこの md を参照し、Playwright（E2E）および Vitest/Jest（ユニット）で実装する。

## 方針

- **E2E:** メインシナリオ 1〜3 本（計 3〜10 テスト）。画面遷移とデータ永続化を優先。
- **ユニット:** SRS 計算ロジックのみ。純粋関数の境界値・代表パターンをカバー。

## ディレクトリ構成

```
testcase/
├── README.md               # 本ファイル
├── e2e/                    # E2E（Playwright）用シナリオ
│   ├── 01_login_dashboard.md
│   ├── 02_card_creation_study.md
│   └── 03_review_srs.md
├── unit/                   # ユニットテスト用
│   └── 01_srs.md
└── fixtures/               # テスト用ダミーデータ
    ├── README.md
    ├── card.ts
    ├── deck.ts
    └── study-record.ts
```

## 実装時の前提

- **認証:** E2E では `project` でログイン済み `storageState` を再利用する想定。初回は手動ログインして `npx playwright codegen` 等で state を保存してもよい。
- **データ:** シード（`prisma/seed.ts`）のテストユーザー・デッキ・カードを利用するか、テスト内で作成する。
- **環境:** `npm run build` および `npm run start` で起動したアプリに対して実行するか、`webServer` で `npm run dev` を起動する。

## 並列実行時の注意

- 各テストは独立して実行できるよう、テスト固有のデータを作成・削除する設計を推奨。
- シードデータを参照する場合は、テスト専用ユーザーまたはデッキを用意し、他テストと競合しないようにする。
- Playwright の `fullyParallel: true` を有効にする場合、テスト間で状態を共有しないこと。

## アサーション方針

- `expect(locator).toBeVisible()`, `expect(locator).toHaveText()` 等の **Web-first assertions** を使用する。
- `page.waitForTimeout()` は使用しない（フレーキーテストの原因になる）。
- ネットワーク待機が必要な場合は `page.waitForResponse()` や `expect(locator).toBeVisible()` の自動リトライに頼る。

## data-testid 付与候補（安定性向上のため）

将来的にセレクタが不安定になった場合に備え、以下の箇所に `data-testid` を付与してよい。

| コンポーネント | 要素 | 推奨 testid |
|----------------|------|-------------|
| `TodayReviewCard` | 復習枚数表示 | `due-count` |
| `TodayReviewCard` | 学習開始ボタン | `start-review-button` |
| 復習画面 | 評価ボタン（難しい） | `rating-again` |
| 復習画面 | 評価ボタン（普通） | `rating-hard` |
| 復習画面 | 評価ボタン（簡単） | `rating-good` |
| 復習画面 | カード表面 | `card-front` |
| 復習画面 | カード裏面 | `card-back` |
| `CardForm` | 表面入力 | `input-front-text` |
| `CardForm` | 裏面入力 | `input-back-text` |
| `CardForm` | 保存ボタン | `save-card-button` |

## テスト実施の準備（インポート・環境）

### インストール（実装時に実行）

```bash
# E2E
npm install -D @playwright/test
npx playwright install

# ユニット
npm install -D vitest
```

`package.json` の scripts に追加例:

```json
"scripts": {
  "test": "vitest",
  "test:e2e": "playwright test"
}
```

### E2E（Playwright）でインポートするもの

```typescript
import { test, expect } from "@playwright/test";
// 必要に応じて
import { baseCard } from "@/testcase/fixtures/card";  // 期待値検証用
```

- **test:** テストケース定義（`test("説明", async ({ page }) => { ... })`）
- **expect:** アサーション（`expect(locator).toBeVisible()` 等）
- **page:** フィクスチャから注入（引数で受け取る）。`browser`, `context` も必要なら利用

### ユニット（Vitest）でインポートするもの

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  calculateNextReview,
  isDueToday,
  isMastered,
  getTodayString,
  SRS_DEFAULTS,
  MASTERED_THRESHOLD_DAYS,
} from "@/lib/srs";
import {
  baseCard,
  reviewedCard,
  lowEaseCard,
  createCard,
} from "@/testcase/fixtures/card";
```

- **describe / it / expect:** テスト構造とアサーション
- **vi:** タイマー・モック（`vi.useFakeTimers()` 等）
- **beforeEach / afterEach:** 日付固定のセットアップ・クリーンアップ
- 被テストモジュール: `@/lib/srs` から必要な関数・定数のみインポート
- フィクスチャ: `@/testcase/fixtures/card`（パスエイリアスが無い場合は `../../testcase/fixtures/card` 等の相対パス）

### パスエイリアス

`tsconfig.json` に `@/` が設定されていない場合、フィクスチャ・被テストモジュールは相対パスでインポートする。

```typescript
// 例: tests/unit/srs.test.ts から
import { calculateNextReview } from "../../lib/srs";
import { baseCard } from "../fixtures/card";
```

テスト用の `tsconfig.test.json` や `vitest.config.ts` で `paths` を設定する場合は、`@/` をそのまま利用できる。

### 実行コマンド（実装後）

```bash
npm run test          # ユニット（Vitest）
npm run test:e2e      # E2E（Playwright）
```

## 参照

- 要件: `requirements/15_test_requirement.md`
- 設計: `ARCHITECTURE.md`（特に SRS 早見表・データフロー）
- フィクスチャ例: `testcase/fixtures/` 配下
