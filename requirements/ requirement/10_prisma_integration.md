# Prisma ORM 統合 (PRISMA_INTEGRATION)

> **実施日:** 2026-02-09

## 1. 概要

データ永続化を LocalStorage から **Prisma ORM + SQLite** に移行した。
これにより、データの信頼性・拡張性が向上し、将来的な DB 切り替え（PostgreSQL 等）にも対応可能になった。

---

## 2. 変更の背景と目的

| 項目 | Before | After |
|---|---|---|
| データ永続化 | Zustand `persist` → LocalStorage | Prisma ORM → SQLite |
| データアクセス | クライアント直接参照 | API Routes 経由 |
| 画像ストレージ | IndexedDB（変更なし） | IndexedDB（変更なし） |

### 移行の目的

- サーバーサイドでのデータ管理によるデータ信頼性の向上
- 型安全な DB アクセス（Prisma の自動生成型）
- 将来的な DB 変更（SQLite → PostgreSQL 等）への対応力確保
- API レイヤーの導入によるフロント・バックの関心分離

---

## 3. 追加パッケージ

| パッケージ | 種別 | 用途 |
|---|---|---|
| `@prisma/client` | dependencies | Prisma クライアント本体 |
| `@prisma/adapter-better-sqlite3` | dependencies | SQLite 用ドライバーアダプター |
| `dotenv` | dependencies | 環境変数読み込み（prisma.config.ts 用） |
| `prisma` | devDependencies | Prisma CLI（スキーマ管理・マイグレーション） |
| `@types/better-sqlite3` | devDependencies | better-sqlite3 の型定義 |

---

## 4. Prisma スキーマ定義

**ファイル:** `prisma/schema.prisma`

### モデル一覧

| モデル | 概要 | 主要フィールド |
|---|---|---|
| `Deck` | デッキ（カードのグループ） | id, name, createdAt, updatedAt |
| `Card` | フラッシュカード | id, deckId, frontText, backText, frontImageId, backImageId, SRS パラメータ |
| `StudyRecord` | 学習記録（1 日の学習実績） | id, date (unique), reviewedCount |

### リレーション

- `Deck` → `Card`: 1対多（`onDelete: Cascade`）
  - デッキ削除時にカードも自動削除

---

## 5. 新規作成ファイル

### インフラ・設定

| ファイル | 概要 |
|---|---|
| `prisma/schema.prisma` | Prisma スキーマ定義（Deck, Card, StudyRecord） |
| `prisma.config.ts` | Prisma 設定（datasource URL） |
| `.env` | `DATABASE_URL="file:./dev.db"` |
| `lib/prisma.ts` | PrismaClient シングルトン（better-sqlite3 アダプター使用） |
| `lib/generated/prisma/` | Prisma 自動生成コード（.gitignore 対象） |

### API Routes

| ファイル | メソッド | 概要 |
|---|---|---|
| `app/api/decks/route.ts` | GET / POST | デッキ一覧取得・作成 |
| `app/api/decks/[id]/route.ts` | GET / PUT / DELETE | デッキ取得・更新・削除 |
| `app/api/cards/route.ts` | GET / POST | カード一覧取得・作成 |
| `app/api/cards/[id]/route.ts` | GET / PUT / DELETE | カード取得・更新・削除 |
| `app/api/cards/[id]/review/route.ts` | POST | 復習結果の反映（SRS 計算） |
| `app/api/study-records/route.ts` | GET / POST | 学習記録取得・復習記録 |
| `app/api/export/route.ts` | GET | 全データの JSON エクスポート |
| `app/api/import/route.ts` | POST | JSON からの全データインポート |

### コンポーネント

| ファイル | 概要 |
|---|---|
| `components/common/DataInitializer.tsx` | アプリ起動時に API からデータをフェッチする初期化コンポーネント |

---

## 6. 修正ファイル

### Zustand ストア

| ファイル | 変更内容 |
|---|---|
| `stores/useDeckStore.ts` | `persist` ミドルウェア削除、API 連携（async 化）、`fetchDecks()` 追加 |
| `stores/useCardStore.ts` | `persist` ミドルウェア削除、API 連携（async 化）、`fetchCards()` 追加 |
| `stores/useStudyStore.ts` | `persist` ミドルウェア削除、API 連携（async 化）、`fetchRecords()` 追加 |

### ストアの設計変更

- **データフロー:** ストアはクライアント側キャッシュとして機能
- **初期化:** `DataInitializer` コンポーネントが layout.tsx でマウントされ、全ストアを API から初期化
- **ミューテーション:** API を呼び出し → 成功後にローカルストアを更新
- **読み取り専用メソッド:** 同期のまま（`getCard()`, `getDueCards()` 等）

### ページ・コンポーネント

| ファイル | 変更内容 |
|---|---|
| `app/layout.tsx` | `DataInitializer` コンポーネント追加 |
| `app/cards/new/page.tsx` | `Suspense` バウンダリ追加（`useSearchParams` 対応） |
| `app/review/page.tsx` | `Suspense` バウンダリ追加、`handleRate` の async 対応 |
| `app/decks/[id]/page.tsx` | カード削除の async 対応 |
| `app/settings/page.tsx` | エクスポート関数のシグネチャ変更対応、説明文更新 |
| `components/dashboard/DeckList.tsx` | デッキ操作の async 対応 |
| `components/card/CardForm.tsx` | カード保存・更新の async 対応 |

### その他

| ファイル | 変更内容 |
|---|---|
| `lib/exportImport.ts` | エクスポート/インポートを API 経由に変更 |
| `.gitignore` | `prisma/dev.db`, `prisma/dev.db-journal`, `lib/generated/` を除外に追加 |

---

## 7. アーキテクチャ図

```
[Client]                    [Server]
┌──────────────────┐       ┌──────────────────────┐
│ Zustand Store    │◄─────►│ API Routes           │
│ (キャッシュ)      │ fetch │ (app/api/...)         │
│                  │       │                      │
│ DataInitializer  │       │ Prisma Client        │
│ (初期フェッチ)    │       │ (lib/prisma.ts)       │
└──────────────────┘       │                      │
                           │ SQLite (dev.db)      │
┌──────────────────┐       └──────────────────────┘
│ IndexedDB        │
│ (画像ストレージ)  │
└──────────────────┘
```

---

## 8. 開発時コマンド

| コマンド | 用途 |
|---|---|
| `npx prisma generate` | Prisma Client の生成 |
| `npx prisma db push` | スキーマを DB に反映（開発用） |
| `npx prisma migrate dev --name <name>` | マイグレーション作成・適用 |
| `npx prisma studio` | DB の GUI ブラウザ起動 |

---

## 9. 注意事項

- `lib/generated/` は `.gitignore` 対象のため、`npm install` 後に `npx prisma generate` の実行が必要
- `prisma/dev.db` はローカル開発用 SQLite ファイル（`.gitignore` 対象）
- 画像データは引き続き IndexedDB に保存（Prisma / SQLite には保存しない）
- 本番環境では `.env` の `DATABASE_URL` を適切に設定すること
