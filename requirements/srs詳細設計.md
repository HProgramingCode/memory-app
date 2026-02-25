# SRS アルゴリズム詳細設計

**対象ファイル:** `lib/srs.ts`

## 1. 概要

SRS（Spaced Repetition System、間隔反復システム）は、記憶の定着を最大化するために、復習間隔を段階的に伸ばしていく学習手法である。本アプリでは SM-2 アルゴリズムをベースにした簡易実装を採用している。

### SM-2 アルゴリズムとは

1972年に Piotr Wozniak が提唱した間隔反復アルゴリズム。以下の原理に基づく：

- 記憶は復習により強化される
- 復習の間隔を徐々に伸ばすことで、長期記憶への定着が促進される
- ユーザーの自己評価（覚えていたか/忘れていたか）に基づいて間隔を調整する

---

## 2. データ構造

### Card 型（SRS 関連プロパティ）

```typescript
interface Card {
  // ... 他のプロパティ
  
  /** 次回復習日 (YYYY-MM-DD 形式) */
  nextReviewDate: string;
  
  /** 現在の復習間隔（日数） */
  intervalDays: number;
  
  /** 連続正解回数（again で 0 にリセット） */
  repetitionCount: number;
  
  /** 習熟度ファクター（間隔の伸び率を決定） */
  easeFactor: number;
}
```

### ReviewRating 型

```typescript
type ReviewRating = "again" | "hard" | "good";
```

| 評価 | 意味 | UI表示 |
|------|------|--------|
| `again` | 覚えていなかった（難しい） | 難しい |
| `hard` | やや覚えていた（普通） | 普通 |
| `good` | 完璧に覚えていた（簡単） | 簡単 |

---

## 3. 定数

```typescript
/** 新規カードのデフォルト値 */
export const SRS_DEFAULTS = {
  intervalDays: 0,      // 未学習
  repetitionCount: 0,   // 復習回数なし
  easeFactor: 2.5,      // 標準の習熟度
} as const;

/** 定着済みと判定する閾値（日数） */
export const MASTERED_THRESHOLD_DAYS = 21;
```

---

## 4. 関数仕様

### 4.1 `calculateNextReview(card, rating)`

次回の復習スケジュールを計算するメイン関数。

```typescript
function calculateNextReview(
  card: Card,
  rating: ReviewRating
): Pick<Card, "nextReviewDate" | "intervalDays" | "repetitionCount" | "easeFactor">
```

#### 評価別の動作

##### `again`（難しい）

カードを覚えていなかった場合。学習をリセットする。

| パラメータ | 計算式 | 説明 |
|------------|--------|------|
| `intervalDays` | `1` | 翌日に再復習 |
| `repetitionCount` | `0` | リセット |
| `easeFactor` | `max(1.3, 現在値 - 0.2)` | 下限 1.3 |
| `nextReviewDate` | `今日 + 1日` | 翌日 |

##### `hard`（普通）

カードを覚えていたが自信がない場合。間隔を少し伸ばす。

| パラメータ | 計算式 | 説明 |
|------------|--------|------|
| `intervalDays` | 初回: `1`<br>2回目以降: `ceil(現在値 × 1.5)` | 1.5倍 |
| `repetitionCount` | `現在値 + 1` | インクリメント |
| `easeFactor` | `max(1.3, 現在値 - 0.1)` | 下限 1.3 |
| `nextReviewDate` | `今日 + intervalDays` | 計算結果 |

##### `good`（簡単）

カードを完璧に覚えていた場合。間隔を大きく伸ばす。

| パラメータ | 計算式 | 説明 |
|------------|--------|------|
| `intervalDays` | 初回: `3`<br>2回目以降: `ceil(現在値 × easeFactor)` | easeFactor 倍 |
| `repetitionCount` | `現在値 + 1` | インクリメント |
| `easeFactor` | `現在値 + 0.1` | 上昇（上限なし） |
| `nextReviewDate` | `今日 + intervalDays` | 計算結果 |

#### 計算例

```
【初回カード】intervalDays=0, easeFactor=2.5

評価 "again" → intervalDays=1, easeFactor=2.3, 翌日復習
評価 "hard"  → intervalDays=1, easeFactor=2.4, 翌日復習
評価 "good"  → intervalDays=3, easeFactor=2.6, 3日後復習

【2回目以降】intervalDays=3, easeFactor=2.6

評価 "again" → intervalDays=1, easeFactor=2.4, リセット
評価 "hard"  → intervalDays=5 (ceil(3×1.5)), easeFactor=2.5
評価 "good"  → intervalDays=8 (ceil(3×2.6)), easeFactor=2.7
```

---

### 4.2 `isDueToday(card)`

カードが今日復習対象かどうかを判定する。

```typescript
function isDueToday(card: Card): boolean {
  return card.nextReviewDate <= getTodayString();
}
```

- `nextReviewDate` が今日以前なら `true`
- 未来の日付なら `false`

---

### 4.3 `isMastered(card)`

カードが「定着済み」かどうかを判定する。

```typescript
function isMastered(card: Card): boolean {
  return card.intervalDays >= MASTERED_THRESHOLD_DAYS; // 21日
}
```

- `intervalDays` が 21 日以上なら定着済みと判定
- ダッシュボードの定着カード数の計算に使用

---

### 4.4 `getTodayString()`

今日の日付を `YYYY-MM-DD` 形式で取得する。

```typescript
function getTodayString(): string {
  return format(new Date(), "yyyy-MM-dd");
}
```

---

## 5. easeFactor（習熟度ファクター）

easeFactor は間隔の伸び率を決定する重要なパラメータである。

| 値 | 意味 |
|----|------|
| 2.5 | 標準（デフォルト） |
| > 2.5 | 覚えやすいカード（間隔が大きく伸びる） |
| < 2.5 | 覚えにくいカード（間隔の伸びが抑制される） |
| 1.3 | 下限（これ以上下がらない） |

### 変動ルール

- `good` 評価: `+0.1`（上限なし）
- `hard` 評価: `-0.1`（下限 1.3）
- `again` 評価: `-0.2`（下限 1.3）

---

## 6. 学習フロー図

```
┌─────────────┐
│  新規カード  │  intervalDays=0, easeFactor=2.5
└──────┬──────┘
       │ 復習
       ▼
┌─────────────┐
│  自己評価    │
└──────┬──────┘
       │
   ┌───┼───┬───────────┐
   │   │   │           │
   ▼   ▼   ▼           │
 again hard good        │
   │   │   │           │
   │   │   │           │
   ▼   ▼   ▼           │
┌─────────────┐         │
│ 次回復習日  │         │
│ 間隔更新    │         │
└──────┬──────┘         │
       │                │
       │ intervalDays >= 21?
       │                │
   ┌───┴───┐            │
   │       │            │
   ▼       ▼            │
  No      Yes           │
   │       │            │
   │  ┌────┴─────┐      │
   │  │ 定着済み  │      │
   │  └──────────┘      │
   │                    │
   └────────────────────┘
         次回復習まで待機
```

---

## 7. 依存ライブラリ

```typescript
import { format, addDays, addMinutes } from "date-fns";
```

- `format`: 日付を文字列にフォーマット
- `addDays`: 日付に日数を加算

---

## 8. テストについて

ユニットテストの詳細は `testcase/unit/01_srs.md` を参照。

### テスト時の注意点

- `calculateNextReview` は内部で `new Date()` を使用するため、テスト時は日付の固定が必要
- Vitest/Jest の `useFakeTimers` を使用して実行日を固定する

```typescript
beforeEach(() => {
  vi.useFakeTimers({ now: new Date("2026-02-18T00:00:00.000Z") });
});

afterEach(() => {
  vi.useRealTimers();
});
```

---

## 9. 関連ファイル

| ファイル | 説明 |
|----------|------|
| `lib/srs.ts` | SRS アルゴリズム実装 |
| `types/index.ts` | Card, ReviewRating 型定義 |
| `testcase/unit/01_srs.md` | ユニットテストケース |
| `testcase/fixtures/card.ts` | テスト用フィクスチャ |
