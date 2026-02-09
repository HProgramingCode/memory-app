# 自由学習モード・定着率改善 (FREE_STUDY_AND_MASTERY)

> **最終更新:** 2026-02-09
> **ステータス:** ✅ 実装完了

## 1. 背景・課題

従来の仕様では、学習のトリガーが「今日の復習」（SRS スケジュールに基づく `nextReviewDate <= 今日` のカード）に限定されており、ユーザーが任意のタイミングでデッキやカードを学習する手段がなかった。

また、ダッシュボードの定着率は `intervalDays >= 21` の静的判定のみで、日々の復習セッションのパフォーマンスが可視化されていなかった。

## 2. 追加要件の一覧

| # | 要件 | 概要 |
|---|------|------|
| A | 自由学習モード | SRS スケジュールに関係なく、デッキ内の全カードをいつでも学習可能にする |
| B | 学習カード数カウント | 自由学習で学習した分もカウントに含める（内部的には区別し、表示は合算） |
| C | 今日の復習（維持） | SRS ベースの復習機能は現状通り維持。忘却曲線の効果を保つ |
| D | 復習セッション定着率 | 「今日の復習」での評価結果（難しい/普通/簡単）に基づく定着率を表示 |
| E | デッキ別定着率 | 各デッキごとの定着率（intervalDays ベース）を表示 |

## 3. 要件詳細

### 3-A. 自由学習モード

**導線:**
- ダッシュボードのデッキ一覧: 各デッキに常時表示の「自由学習」ボタン（SchoolIcon）
- デッキ詳細ページ: 「自由学習」ボタン

**対象カード:**
- デッキ内の全カード（SRS スケジュールに関係なく）
- Fisher-Yates シャッフルで順序はランダム

**SRS への影響:**
- **反映しない**。自由学習での評価は SRS パラメータ（nextReviewDate, intervalDays, easeFactor 等）を更新しない
- これにより、「今日の復習」の忘却曲線ベースの効果が維持される

**URL パラメータ:**
- `/review?deckId=xxx&mode=free` で自由学習モードに遷移
- 復習画面（`app/review/page.tsx`）が `mode` パラメータを検出して動作を切り替える

### 3-B. 学習カード数カウント

**内部管理:**
- `StudyRecord` に `freeStudyCount` フィールドを追加
- 「今日の復習」は `reviewedCount`、「自由学習」は `freeStudyCount` にそれぞれ記録

**表示（ダッシュボード 学習サマリー）:**
- 「今日の学習枚数」として `reviewedCount + freeStudyCount` の合算値を表示

**ストリーク:**
- 復習 or 自由学習のどちらかを実施した日をストリーク対象とする

### 3-C. 今日の復習（維持）

- 従来通り、`nextReviewDate <= 今日` のカードが対象
- ダッシュボードの「今日の復習」セクション、デッキ一覧の PlayArrowIcon ボタンから開始
- 自由学習とは独立して動作する

### 3-D. 復習セッション定着率

**データ収集:**
- `StudyRecord` に `againCount`, `hardCount`, `goodCount` フィールドを追加
- 「今日の復習」での評価時に、rating に応じてカウントを増加

**定着率の計算:**
```
定着率 = (hardCount + goodCount) / (againCount + hardCount + goodCount) × 100%
```
- 「普通」「簡単」を定着とみなす

**表示:**
- ダッシュボードに新コンポーネント `TodayMasteryCard` として表示
- 定着率の数値 + プログレスバー + 評価別内訳（難しい / 普通 / 簡単 の件数）
- 色分け: 80%以上 = 緑、50%以上 = 黄、50%未満 = 赤

**既存の定着度チャートとの関係:**
- 既存の `MasteryChart`（intervalDays >= 21 ベースのドーナツチャート）はそのまま維持
- `TodayMasteryCard` は並列表示（Grid の左右配置）

### 3-E. デッキ別定着率

**計算方法:**
- intervalDays >= 21 のカード数 / デッキ内の全カード数 × 100%
- 既存の `isMastered()` 関数を使用

**表示場所:**
- **ダッシュボード デッキ一覧:** 各デッキに `定着率: XX%` の Chip を表示
- **デッキ詳細ページ:** ヘッダーに `定着率: XX%` の Chip を表示

**色分け:**
- 80%以上 = success（緑）
- 50%以上 = warning（黄）
- 50%未満 = default（グレー）

## 4. データモデルの変更

### StudyRecord（変更）

```
model StudyRecord {
  id             String @id @default(uuid())
  date           String @unique        // YYYY-MM-DD
  reviewedCount  Int    @default(0)    // 今日の復習カウント
  freeStudyCount Int    @default(0)    // 自由学習カウント      ← 追加
  againCount     Int    @default(0)    // 「難しい」評価数      ← 追加
  hardCount      Int    @default(0)    // 「普通」評価数        ← 追加
  goodCount      Int    @default(0)    // 「簡単」評価数        ← 追加
}
```

## 5. API の変更

### POST /api/study-records（変更）

**リクエストボディ:**
```json
// 今日の復習（rating 付き）
{ "rating": "again" | "hard" | "good" }

// 自由学習
{ "mode": "free" }
```

**動作:**
- `mode="free"`: `freeStudyCount` を +1
- `mode` 未指定: `reviewedCount` を +1 + `rating` に応じた評価カウントを +1

### GET /api/export, POST /api/import（変更）
- エクスポート/インポートに新フィールドを含める
- インポート時は後方互換性を確保（旧フォーマットでも `?? 0` でデフォルト値を適用）

## 6. 変更ファイル一覧

| ファイル | 変更種別 | 内容 |
|----------|----------|------|
| `prisma/schema.prisma` | 変更 | StudyRecord に 4フィールド追加 |
| `types/index.ts` | 変更 | StudyRecord 型に 4フィールド追加 |
| `app/api/study-records/route.ts` | 変更 | rating + mode=free 対応 |
| `app/api/export/route.ts` | 変更 | 新フィールドのエクスポート |
| `app/api/import/route.ts` | 変更 | 新フィールドのインポート（後方互換） |
| `stores/useStudyStore.ts` | 変更 | recordReview(rating), recordFreeStudy, 各種 getter 追加 |
| `app/review/page.tsx` | 変更 | mode=free 対応、SRS スキップ |
| `app/page.tsx` | 変更 | TodayMasteryCard 追加、レイアウト調整 |
| `components/dashboard/TodayMasteryCard.tsx` | **新規** | 復習セッション定着率コンポーネント |
| `components/dashboard/StudySummaryCard.tsx` | 変更 | 今日の学習枚数（合算）追加 |
| `components/dashboard/DeckList.tsx` | 変更 | 自由学習ボタン + デッキ別定着率 |
| `app/decks/[id]/page.tsx` | 変更 | 定着率 Chip + 復習/自由学習ボタン |
