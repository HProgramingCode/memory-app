# ユーザー認証 + Turso 導入 (AUTH_AND_TURSO)

> **最終更新:** 2026-02-09
> **ステータス:** ⬜ 未着手

## 1. 背景

Phase 1 は認証なし・単一ユーザーの前提で開発された。  
コミュニティ機能（Phase 2）の前提として、ユーザー認証とマルチユーザーのデータ分離を導入する。  
同時に、本番環境の DB を SQLite → Turso（libSQL）に移行する。

## 2. 方針決定事項

| 項目 | 決定内容 |
|------|----------|
| 認証ライブラリ | NextAuth.js v5 (Auth.js) |
| 認証プロバイダ | Google + GitHub |
| ローカル DB | SQLite（従来通り） |
| 本番 DB | Turso（libSQL / SQLite 互換クラウド DB） |
| ユーザーメトリクス | デプロイ前に再検討 |
| コミュニティ機能 | 認証 + データ分離が完了してから着手 |

## 3. 現在の全残タスク一覧

### ステップ 8: 仕上げ — 🔄 進行中（既存）

| # | タスク | 状態 | 備考 |
|---|--------|------|------|
| 8-1 | レスポンシブデザインの調整 | ⚠️ 要確認 | 実機での表示確認が必要 |
| 8-3 | エラーハンドリング | ⚠️ 要確認 | 網羅性の確認 |
| 8-4 | Vercel デプロイ確認 | ⬜ 未着手 | 認証 + Turso 導入後に実施 |

### ステップ 11: ユーザー認証 + Turso 導入 — ⬜ 未着手（新規）

#### Phase A: 外部サービスのセットアップ（手動作業）

| # | タスク | 状態 | 手動/実装 | 備考 |
|---|--------|------|-----------|------|
| 11-1 | Turso アカウント作成 + DB 作成 + トークン取得 | ⬜ | 手動 | → セットアップ手順書参照 |
| 11-2 | Google OAuth クライアント作成 | ⬜ | 手動 | → セットアップ手順書参照 |
| 11-3 | GitHub OAuth App 作成 | ⬜ | 手動 | → セットアップ手順書参照 |
| 11-4 | `.env` に環境変数を設定 | ⬜ | 手動 | 各サービスの認証情報 |

#### Phase B: Turso + Prisma アダプタ移行

| # | タスク | 状態 | 手動/実装 | 備考 |
|---|--------|------|-----------|------|
| 11-5 | `@prisma/adapter-libsql` インストール | ⬜ | 実装 | Turso 用 Prisma アダプタ |
| 11-6 | `lib/prisma.ts` を環境別に切り替え | ⬜ | 実装 | ローカル: better-sqlite3 / 本番: libSQL |
| 11-7 | `prisma.config.ts` を Turso 対応に更新 | ⬜ | 実装 | |
| 11-8 | Turso へのマイグレーション適用確認 | ⬜ | 実装 | `prisma migrate` or `prisma db push` |

#### Phase C: NextAuth.js 導入

| # | タスク | 状態 | 手動/実装 | 備考 |
|---|--------|------|-----------|------|
| 11-9 | `next-auth` + `@auth/prisma-adapter` インストール | ⬜ | 実装 | |
| 11-10 | Prisma スキーマに認証テーブル追加 | ⬜ | 実装 | User, Account, Session, VerificationToken |
| 11-11 | NextAuth 設定ファイル作成 | ⬜ | 実装 | `app/api/auth/[...nextauth]/route.ts` + `auth.ts` |
| 11-12 | Google / GitHub プロバイダ設定 | ⬜ | 実装 | |
| 11-13 | ログイン / ログアウト UI | ⬜ | 実装 | ヘッダーにユーザーアバター + ドロップダウン |
| 11-14 | 認証ミドルウェア（保護ルート） | ⬜ | 実装 | `middleware.ts` で未認証ユーザーをリダイレクト |

#### Phase D: マルチユーザー データ分離

| # | タスク | 状態 | 手動/実装 | 備考 |
|---|--------|------|-----------|------|
| 11-15 | Prisma スキーマに `userId` 追加 | ⬜ | 実装 | Deck, Card, StudyRecord に追加 |
| 11-16 | マイグレーション実行 | ⬜ | 実装 | |
| 11-17 | TypeScript 型定義の更新 | ⬜ | 実装 | types/index.ts |
| 11-18 | 全 API Routes にセッション認証追加 | ⬜ | 実装 | 未認証は 401 返却 |
| 11-19 | 全 API Routes に userId フィルタリング追加 | ⬜ | 実装 | decks, cards, study-records, export, import |
| 11-20 | DataInitializer の認証対応 | ⬜ | 実装 | ログイン済みの場合のみデータ取得 |
| 11-21 | Zustand ストアのリセット処理 | ⬜ | 実装 | ログアウト時にストアをクリア |

#### Phase E: 統合テスト・仕上げ

| # | タスク | 状態 | 手動/実装 | 備考 |
|---|--------|------|-----------|------|
| 11-22 | ローカル環境での動作確認 | ⬜ | 確認 | Google/GitHub ログイン → CRUD → 復習 |
| 11-23 | エクスポート/インポートの userId 対応 | ⬜ | 実装 | 自分のデータのみ操作 |
| 11-24 | ビルド確認 | ⬜ | 実装 | `npm run build` 成功 |
| 11-25 | Vercel 環境変数設定 + デプロイ | ⬜ | 手動+確認 | Turso + NextAuth の環境変数 |

### 今後の予定

| ステップ | 内容 | 前提条件 |
|----------|------|----------|
| ステップ 12 | ユーザーメトリクス（任意） | デプロイ前に要否を再検討 |
| Phase 2 | コミュニティ機能（デッキ共有等） | ステップ 11 完了後 |

## 4. 実装順序

```
Phase A（手動セットアップ）
  ↓
Phase B（Turso アダプタ移行）
  ↓
Phase C（NextAuth.js 導入）
  ↓
Phase D（マルチユーザー データ分離）
  ↓
Phase E（統合テスト・デプロイ）
```

各 Phase は前の Phase が完了してから着手する。

## 5. 必要な環境変数（最終形）

```env
# --- 既存 ---
DATABASE_URL="file:./dev.db"

# --- Turso（本番用） ---
TURSO_DATABASE_URL="libsql://your-db-name-your-org.turso.io"
TURSO_AUTH_TOKEN="your-turso-auth-token"

# --- NextAuth.js ---
NEXTAUTH_URL="http://localhost:3000"          # ローカル
NEXTAUTH_SECRET="your-random-secret-string"   # openssl rand -base64 32 で生成

# --- Google OAuth ---
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# --- GitHub OAuth ---
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"
```
