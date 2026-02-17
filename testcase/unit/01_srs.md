# ユニット: SRS アルゴリズム (`lib/srs.ts`)

**目的:** 間隔反復の計算が仕様どおりであることを担保し、リファクタ時の回帰を防ぐ。純粋関数の境界値・代表パターンのみテストする。

## 対象

- `lib/srs.ts`
  - `calculateNextReview(card, rating)` — 次回復習日・intervalDays・repetitionCount・easeFactor を返す
  - `isDueToday(card)` — 今日復習対象か
  - `isMastered(card)` — 定着済み（intervalDays >= 21）か
  - `getTodayString()` — 今日の日付文字列（テストではモック or スナップショット可）
  - 定数: `SRS_DEFAULTS`, `MASTERED_THRESHOLD_DAYS` (21)

## 日付の扱い

`calculateNextReview` は内部で `new Date()` を使用する。テストでは次のいずれかで日付を固定することを推奨する。

- **Vitest:** `vi.useFakeTimers({ now: new Date('2026-02-18') })` 等で実行日を固定
- **Jest:** `jest.useFakeTimers({ now: new Date('2026-02-18') })`
- または「期待値の nextReviewDate」を `format(addDays(now, N), 'yyyy-MM-dd')` で実行時に計算して比較

---

## TC-UNIT-01-01: `calculateNextReview` — again（難しい）初回カード

| 項目 | 内容 |
|------|------|
| 入力 | `card`: intervalDays=0, repetitionCount=0, easeFactor=2.5, nextReviewDate は任意<br>`rating`: `"again"` |
| 期待 | `intervalDays === 1`<br>`repetitionCount === 0`<br>`easeFactor === 2.3`（2.5 - 0.2）<br>`nextReviewDate` は実行日の **翌日**（YYYY-MM-DD） |
| 検証 | 上記4項目を assert。日付は `addDays(now, 1)` と一致させる。 |

---

## TC-UNIT-01-02: `calculateNextReview` — again（難しい）easeFactor 下限

| 項目 | 内容 |
|------|------|
| 入力 | `card`: intervalDays=1, repetitionCount=1, easeFactor=1.4<br>`rating`: `"again"` |
| 期待 | `easeFactor === 1.3`（1.4 - 0.2 だが下限 1.3）<br>`intervalDays === 1`, `repetitionCount === 0`<br>`nextReviewDate` は翌日 |
| 検証 | easeFactor が 1.3 を下回らないこと。 |

---

## TC-UNIT-01-03: `calculateNextReview` — hard（普通）初回

| 項目 | 内容 |
|------|------|
| 入力 | `card`: intervalDays=0, repetitionCount=0, easeFactor=2.5<br>`rating`: `"hard"` |
| 期待 | `intervalDays === 1`（初回は翌日）<br>`repetitionCount === 1`<br>`easeFactor === 2.4`（2.5 - 0.1）<br>`nextReviewDate` は翌日 |
| 検証 | 上記を assert。 |

---

## TC-UNIT-01-04: `calculateNextReview` — hard（普通）2回目以降

| 項目 | 内容 |
|------|------|
| 入力 | `card`: intervalDays=4, repetitionCount=2, easeFactor=2.5<br>`rating`: `"hard"` |
| 期待 | `intervalDays === 6`（ceil(4 * 1.5)）<br>`repetitionCount === 3`<br>`easeFactor === 2.4`<br>`nextReviewDate` は実行日の **6日後** |
| 検証 | intervalDays と nextReviewDate（addDays(now, 6)）を比較。 |

---

## TC-UNIT-01-05: `calculateNextReview` — good（簡単）初回

| 項目 | 内容 |
|------|------|
| 入力 | `card`: intervalDays=0, repetitionCount=0, easeFactor=2.5<br>`rating`: `"good"` |
| 期待 | `intervalDays === 3`（初回は3日後）<br>`repetitionCount === 1`<br>`easeFactor === 2.6`（2.5 + 0.1）<br>`nextReviewDate` は実行日の **3日後** |
| 検証 | 上記を assert。 |

---

## TC-UNIT-01-06: `calculateNextReview` — good（簡単）2回目以降

| 項目 | 内容 |
|------|------|
| 入力 | `card`: intervalDays=3, repetitionCount=1, easeFactor=2.6<br>`rating`: `"good"` |
| 期待 | `intervalDays === 8`（ceil(3 * 2.6) = 8）<br>`repetitionCount === 2`<br>`easeFactor === 2.7`<br>`nextReviewDate` は実行日の **8日後** |
| 検証 | intervalDays と nextReviewDate を比較。 |

---

## TC-UNIT-01-07: `isDueToday` — 今日の日付なら true

| 項目 | 内容 |
|------|------|
| 入力 | `card.nextReviewDate` が `getTodayString()` と等しい、または過去の日付 |
| 期待 | `isDueToday(card) === true` |
| 検証 | 今日の日付文字列を nextReviewDate にしたカードで true。 |

**実装メモ:** 仕様は `card.nextReviewDate <= getTodayString()`。境界として `===` と `<` の両方で true になることを確認してもよい。

---

## TC-UNIT-01-08: `isDueToday` — 未来の日付なら false

| 項目 | 内容 |
|------|------|
| 入力 | `card.nextReviewDate` が今日より明日以降の日付（例: addDays(today, 1)） |
| 期待 | `isDueToday(card) === false` |
| 検証 | 明日の日付を nextReviewDate にしたカードで false。 |

---

## TC-UNIT-01-09: `isMastered` — intervalDays >= 21 なら true

| 項目 | 内容 |
|------|------|
| 入力 | `card.intervalDays === 21` |
| 期待 | `isMastered(card) === true` |
| 検証 | MASTERED_THRESHOLD_DAYS (21) の境界。20 なら false、21 なら true。 |

---

## TC-UNIT-01-10: `isMastered` — intervalDays < 21 なら false

| 項目 | 内容 |
|------|------|
| 入力 | `card.intervalDays === 20` |
| 期待 | `isMastered(card) === false` |
| 検証 | 上記。 |

---

## 実装時の Card 型

`types/index.ts` の `Card` に合わせる。テストで必要な最小プロパティは:

- `intervalDays`, `repetitionCount`, `easeFactor`, `nextReviewDate`
- `calculateNextReview` 用には上記のほか、`id`, `deckId`, `frontText`, `backText`, `frontImageId`, `backImageId`, `createdAt`, `updatedAt` をダミーでよい。

## フィクスチャの使用

`testcase/fixtures/card.ts` に定義済みのフィクスチャを使用する。

```typescript
import {
  baseCard,
  reviewedCard,
  masteredCard,
  lowEaseCard,
  tomorrowDueCard,
  createCard,
} from "@testcase/fixtures/card";

// 例: easeFactor 下限テスト
const card = lowEaseCard; // easeFactor: 1.4
const result = calculateNextReview(card, "again");
expect(result.easeFactor).toBe(1.3); // 下限
```

## 日付の固定

```typescript
import { vi, beforeEach, afterEach } from "vitest";

beforeEach(() => {
  vi.useFakeTimers({ now: new Date("2026-02-18T00:00:00.000Z") });
});

afterEach(() => {
  vi.useRealTimers();
});
```
