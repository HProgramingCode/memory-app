# SRS ユニットテスト 実装ガイド

ジュニアエンジニア向けに、SRS ユニットテスト（`tests/unit/srs.test.ts`）の実装内容と背景知識を解説する。

---

## 目次

1. [ユニットテストとは](#1-ユニットテストとは)
2. [なぜ SRS をユニットテストするのか](#2-なぜ-srs-をユニットテストするのか)
3. [使用ツール: Vitest](#3-使用ツール-vitest)
4. [ファイル構成](#4-ファイル構成)
5. [コード解説](#5-コード解説)
6. [実装手順（ゼロから書く場合）](#6-実装手順ゼロから書く場合)
7. [よくある疑問](#7-よくある疑問)
8. [テストを書く際のベストプラクティス](#8-テストを書く際のベストプラクティス)

---

## 1. ユニットテストとは

**ユニットテスト**は、プログラムの最小単位（関数やクラス）を個別にテストする手法。

### E2E テストとの違い

| 観点 | ユニットテスト | E2E テスト |
|------|---------------|-----------|
| テスト対象 | 1つの関数・クラス | アプリ全体の動作 |
| 実行速度 | 非常に速い（ms単位） | 遅い（秒単位） |
| 外部依存 | なし（モック化） | あり（ブラウザ、DB） |
| 目的 | ロジックの正しさを検証 | ユーザー操作の再現 |

### ユニットテストのメリット

- **高速**: 数百のテストが数秒で完了
- **安定**: 外部要因に左右されない
- **デバッグが容易**: 失敗箇所が特定しやすい
- **リファクタリングの安心材料**: 既存機能を壊していないことを即座に確認

---

## 2. なぜ SRS をユニットテストするのか

SRS（間隔反復システム）は**純粋関数**で構成されている。

```typescript
// 純粋関数の特徴
// 1. 同じ入力 → 常に同じ出力
// 2. 副作用がない（外部状態を変更しない）
function calculateNextReview(card, rating) {
  // card と rating だけで結果が決まる
  return { nextReviewDate, intervalDays, ... };
}
```

純粋関数は最もテストしやすい。入力と出力を確認するだけでよい。

### テストすべき理由

1. **複雑な計算式**: easeFactor、interval の計算にバグが入りやすい
2. **境界値が多い**: 下限 1.3、閾値 21 などの境界条件
3. **リグレッション防止**: 将来の修正で計算が壊れたら即座に検知

---

## 3. 使用ツール: Vitest

[Vitest](https://vitest.dev/) は Vite ベースの高速テストフレームワーク。Jest と API 互換。

### 主要な関数

```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
```

| 関数 | 役割 | 使用例 |
|------|------|--------|
| `describe` | テストをグループ化 | `describe("calculateNextReview", () => {...})` |
| `it` | 個別のテストケース | `it("初回カードは翌日復習", () => {...})` |
| `expect` | アサーション（検証） | `expect(result).toBe(1)` |
| `vi` | モック・スパイ・タイマー | `vi.useFakeTimers()` |
| `beforeEach` | 各テスト前に実行 | 日付の固定など |
| `afterEach` | 各テスト後に実行 | クリーンアップ |

### よく使うアサーション

```typescript
expect(value).toBe(expected);           // 厳密等価（===）
expect(value).toEqual(expected);        // 深い等価（オブジェクト比較）
expect(value).toBeTruthy();             // truthy な値か
expect(value).toBeFalsy();              // falsy な値か
expect(value).toBeGreaterThan(n);       // value > n
expect(value).toBeGreaterThanOrEqual(n); // value >= n
```

---

## 4. ファイル構成

```
memory-app/
├── lib/
│   └── srs.ts                    # 被テストモジュール
├── tests/
│   └── unit/
│       └── srs.test.ts           # ★ テストコード
├── testcase/
│   ├── unit/
│   │   ├── 01_srs.md             # テストケース仕様
│   │   └── IMPLEMENTATION_GUIDE.md # 本ドキュメント
│   └── fixtures/
│       └── card.ts               # テスト用ダミーデータ
├── vitest.config.ts              # Vitest 設定
└── package.json
```

---

## 5. コード解説

### 5.1 インポート部分

```typescript
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { format, addDays } from "date-fns";
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
  masteredCard,
  lowEaseCard,
  tomorrowDueCard,
  createCard,
} from "@testcase/fixtures/card";
```

**ポイント:**
- `vitest` から必要な関数をインポート
- `date-fns` は期待値の日付計算に使用
- `@/lib/srs` は被テストモジュール（テスト対象）
- `@testcase/fixtures/card` は事前定義されたダミーデータ

### 5.2 日付の固定

```typescript
const fixedDate = new Date("2026-02-18T00:00:00.000Z");

beforeEach(() => {
  vi.useFakeTimers({ now: fixedDate });
});

afterEach(() => {
  vi.useRealTimers();
});
```

**なぜ日付を固定するのか？**

`calculateNextReview` は内部で `new Date()` を呼ぶ。テスト実行日によって結果が変わると困る。

```typescript
// lib/srs.ts 内
export function calculateNextReview(card, rating) {
  const now = new Date();  // ← ここが実行日時に依存
  // ...
  return {
    nextReviewDate: format(addDays(now, newInterval), "yyyy-MM-dd"),
    // ...
  };
}
```

`vi.useFakeTimers()` で仮想時計を設定すると、`new Date()` が常に `fixedDate` を返すようになる。

### 5.3 describe によるグループ化

```typescript
describe("SRS アルゴリズム (lib/srs.ts)", () => {
  describe("calculateNextReview", () => {
    describe("again（難しい）", () => {
      it("TC-UNIT-01-01: 初回カード - 間隔リセット、翌日復習", () => {
        // ...
      });
    });
  });
});
```

**構造:**
```
SRS アルゴリズム
├── calculateNextReview
│   ├── again（難しい）
│   │   ├── TC-UNIT-01-01
│   │   └── TC-UNIT-01-02
│   ├── hard（普通）
│   │   ├── TC-UNIT-01-03
│   │   └── TC-UNIT-01-04
│   └── good（簡単）
│       ├── TC-UNIT-01-05
│       └── TC-UNIT-01-06
├── isDueToday
│   ├── TC-UNIT-01-07
│   └── TC-UNIT-01-08
└── isMastered
    ├── TC-UNIT-01-09
    └── TC-UNIT-01-10
```

### 5.4 個別テストの解説

#### 例1: 基本的なテスト

```typescript
it("TC-UNIT-01-01: 初回カード - 間隔リセット、翌日復習", () => {
  // 1. 準備 (Arrange)
  const card = baseCard;  // intervalDays=0, easeFactor=2.5 の初期カード

  // 2. 実行 (Act)
  const result = calculateNextReview(card, "again");

  // 3. 検証 (Assert)
  expect(result.intervalDays).toBe(1);
  expect(result.repetitionCount).toBe(0);
  expect(result.easeFactor).toBe(2.3);  // 2.5 - 0.2
  expect(result.nextReviewDate).toBe(
    format(addDays(fixedDate, 1), "yyyy-MM-dd")  // "2026-02-19"
  );
});
```

**AAA パターン:**
- **Arrange**: テストデータを準備
- **Act**: テスト対象の関数を実行
- **Assert**: 結果を検証

#### 例2: 境界値テスト

```typescript
it("TC-UNIT-01-02: easeFactor 下限 - 1.3 を下回らない", () => {
  const card = lowEaseCard;  // easeFactor: 1.4
  const result = calculateNextReview(card, "again");

  // 1.4 - 0.2 = 1.2 だが、下限 1.3 が適用される
  expect(result.easeFactor).toBe(1.3);
});
```

**境界値テストとは:**
- 仕様上の「下限」「上限」「閾値」をテスト
- バグが最も発生しやすい箇所

#### 例3: createCard でカスタムデータ作成

```typescript
it("TC-UNIT-01-06: 2回目以降 - 間隔 easeFactor 倍", () => {
  const card = createCard({
    intervalDays: 3,
    repetitionCount: 1,
    easeFactor: 2.6,
  });
  const result = calculateNextReview(card, "good");

  expect(result.intervalDays).toBe(8);  // ceil(3 * 2.6) = 8
});
```

`createCard` は `baseCard` をベースに、指定したプロパティだけ上書きできる便利関数。

---

## 6. 実装手順（ゼロから書く場合）

### Step 1: テストケース仕様を読む

`testcase/unit/01_srs.md` を開き、テストすべき項目を確認。

### Step 2: テストファイルを作成

```bash
mkdir -p tests/unit
touch tests/unit/srs.test.ts
```

### Step 3: 最小限のテストを書く

```typescript
import { describe, it, expect } from "vitest";
import { SRS_DEFAULTS } from "@/lib/srs";

describe("SRS アルゴリズム", () => {
  it("SRS_DEFAULTS が定義されている", () => {
    expect(SRS_DEFAULTS).toBeDefined();
  });
});
```

### Step 4: テストを実行して動作確認

```bash
npm test
```

成功すれば環境構築は OK。

### Step 5: テストケースを追加

仕様書（`01_srs.md`）に沿って、1つずつテストを追加。

```typescript
// TC-UNIT-01-01 を追加
it("TC-UNIT-01-01: again 初回カード", () => {
  // ...
});
```

### Step 6: 日付固定が必要なテストを実装

`calculateNextReview` をテストする前に、`beforeEach` で日付を固定。

### Step 7: 全テストケースを実装

仕様書の TC-UNIT-01-01 〜 TC-UNIT-01-10 を実装。

### Step 8: 全テスト Pass を確認

```bash
npm test

# 期待する出力:
# ✓ tests/unit/srs.test.ts (15 tests) 14ms
# Test Files  1 passed (1)
# Tests  15 passed (15)
```

---

## 7. よくある疑問

### Q1: テストが失敗したらどうする？

```bash
npm test

# 失敗例:
# FAIL  tests/unit/srs.test.ts > calculateNextReview > again > TC-UNIT-01-01
# AssertionError: expected 2 to be 1
```

1. **期待値を確認**: 仕様書（`01_srs.md`）と照らし合わせる
2. **実装を確認**: `lib/srs.ts` のロジックにバグがないか確認
3. **テストデータを確認**: 入力カードの値が正しいか確認

### Q2: `vi.useFakeTimers()` を忘れるとどうなる？

`nextReviewDate` の検証が失敗する。テスト実行日が「今日」になるため。

```typescript
// 2026-03-01 に実行した場合
expect(result.nextReviewDate).toBe("2026-02-19");  // ❌ 失敗
// actual: "2026-03-02"
```

### Q3: フィクスチャを使わず直接書いてもいい？

書けるが、推奨しない。

```typescript
// 非推奨: 冗長で読みにくい
const card = {
  id: "test-1",
  deckId: "deck-1",
  frontText: "...",
  backText: "...",
  frontImageId: null,
  backImageId: null,
  nextReviewDate: "2026-02-18",
  intervalDays: 0,
  repetitionCount: 0,
  easeFactor: 2.5,
  createdAt: "...",
  updatedAt: "...",
};

// 推奨: フィクスチャを使う
const card = baseCard;
// または
const card = createCard({ easeFactor: 1.4 });
```

### Q4: テストを追加したい場合は？

1. `testcase/unit/01_srs.md` にテストケースを追記
2. `tests/unit/srs.test.ts` に実装を追加
3. `npm test` で Pass を確認

---

## 8. テストを書く際のベストプラクティス

### 1つのテストで 1 つのことを検証

```typescript
// ❌ 悪い例: 複数の関数を 1 テストで検証
it("SRS 関数が動く", () => {
  expect(calculateNextReview(card, "again").intervalDays).toBe(1);
  expect(isDueToday(card)).toBe(true);
  expect(isMastered(card)).toBe(false);
});

// ✅ 良い例: 関数ごとにテストを分ける
it("again で intervalDays が 1 になる", () => {
  expect(calculateNextReview(card, "again").intervalDays).toBe(1);
});
```

### テスト名は「何をテストしているか」を明確に

```typescript
// ❌ 曖昧
it("動く", () => {...});

// ✅ 明確
it("TC-UNIT-01-02: easeFactor 下限 - 1.3 を下回らない", () => {...});
```

### 境界値を重点的にテスト

- 下限: `easeFactor === 1.3`
- 閾値: `intervalDays === 21`
- 初回: `intervalDays === 0`

### テストは独立させる

各テストが他のテストに依存しないこと。順番を変えても Pass すること。

---

## 参照

| ドキュメント | 内容 |
|--------------|------|
| `requirements/srs詳細設計.md` | SRS アルゴリズムの詳細仕様 |
| `testcase/unit/01_srs.md` | テストケース一覧（仕様書） |
| `testcase/fixtures/card.ts` | テスト用カードデータ |
| `lib/srs.ts` | 被テストモジュール（実装） |
| [Vitest 公式ドキュメント](https://vitest.dev/) | テストフレームワークの詳細 |
