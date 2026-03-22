## インポート / エクスポート機能メモ

### 対象読者
- データのバックアップ機能（全体 / デッキ単位）を理解・改修したいエンジニア

### 前提
- Next.js / Prisma / IndexedDB の基本は分かっている前提です。
- 仕様の詳細は `ARCHITECTURE.md` と `requirements/` を参照してください。

### ゴール
- 「どのAPIが何をしているか」「どの画面からどう呼ばれているか」を把握し、変更時の影響範囲をつかむ。

---

### 全体エクスポート / インポート（設定画面）

- 画面: `app/settings/page.tsx`
- ライブラリ: `lib/exportImport.ts`
- API:
  - `GET /api/export` … サーバー上の Deck / Card / StudyRecord を JSON で返す
  - `POST /api/import` … JSON を受け取り、対象ユーザーのデータを**全置換**する

処理の流れ（エクスポート）:
1. 設定画面の「エクスポート」ボタン → `exportAllData()` を呼ぶ
2. `exportAllData()` が `/api/export` からテキストデータ（Deck / Card / StudyRecord）を取得
3. クライアント側で IndexedDB の画像（`lib/imageDb.ts`）を Base64 に変換して同梱
4. すべてを `ExportData` 型（`types/index.ts`）として JSON にしてダウンロード

処理の流れ（インポート）:
1. 設定画面で JSON ファイルを選択 → `importAllData()` を呼ぶ
2. `importAllData()` が `/api/import` に Deck / Card / StudyRecord を送り、サーバー側で既存データを削除してから挿入
3. クライアント側で IndexedDB の画像を一度全削除し、JSON に含まれる画像を復元
4. Zustand ストアの `replaceAll` でメモリ上のデータを差し替える

---

### デッキ単位エクスポート / インポート（デッキ詳細）

- 画面: `app/decks/[id]/page.tsx`
  - 「デッキをエクスポート」「デッキをインポート」ボタンを追加
- ライブラリ: `lib/exportImport.ts`
  - `exportDeckData(deckId: string)`
  - `importDeckData(deckId: string, json: string)`
- API:
  - `GET /api/decks/:id/export` … 対象デッキと、そのデッキに属するカードのみを返す
  - `POST /api/decks/:id/import` … 対象デッキのカードを受け取り、既存カードを削除してから挿入

エクスポートの流れ:
1. デッキ詳細画面で「デッキをエクスポート」ボタン押下
2. `exportDeckData(deckId)` が `/api/decks/:id/export` から Deck / Card を取得
3. カードが参照する画像 ID に対応する IndexedDB 上の画像だけを Base64 で同梱
4. `DeckExportData` 型として JSON をダウンロード

インポートの流れ:
1. デッキ詳細画面で JSON を選択 → `importDeckData(deckId, json)` を呼ぶ
2. `/api/decks/:id/import` が対象デッキのカードを一度削除し、JSON 内のカードを挿入
3. クライアント側で JSON 内の画像を IndexedDB に保存し直す（既存の同一 ID は上書き）

注意点:
- デッキ単位インポートは「そのデッキのカードのみ置き換える」。他のデッキや学習記録には影響しない。
- 画像は IndexedDB に残るため、「どの画像がどのデッキに紐づいているか」はカードの `frontImageId` / `backImageId` を通じて管理する。

