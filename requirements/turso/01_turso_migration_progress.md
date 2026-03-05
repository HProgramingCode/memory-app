# Turso 移行 — 進捗と着手すべきこと

> **参照:** `.cursor/plans/turso_vs_レビュー実装優先度_*.plan.md` の「3. 案1: SQLite → Turso 移行」
> **最終更新:** 2026-02-26

---

## 1. 前提の整理

- **認証（NextAuth）と userId によるデータ分離は済んでいる。** 本ドキュメントは **Turso 接続の導入** にのみ焦点を当てる。
- ローカル開発は従来どおり SQLite（`DATABASE_URL="file:./dev.db"`）。本番（Vercel 等）では Turso を使う想定。

---

## 2. 自分で着手すべきもの（手動作業）

以下はコードでは完結せず、**自分で実施する**必要がある作業です。

### 2-1. Turso のセットアップ（未実施なら）


| #   | 作業                                                | 状態  | 参照                                                                   |
| --- | ------------------------------------------------- | --- | -------------------------------------------------------------------- |
| A1  | Turso アカウント作成・CLI ログイン                            | ⬜   | [SETUP_GUIDE_auth_and_turso.md](../SETUP_GUIDE_auth_and_turso.md) §1 |
| A2  | `turso db create <DB名>` で DB 作成                   | ⬜   | 同上                                                                   |
| A3  | `turso db tokens create <DB名>` でトークン取得            | ⬜   | 同上                                                                   |
| A4  | **TURSO_DATABASE_URL** と **TURSO_AUTH_TOKEN** をメモ | ⬜   | `.env` 用                                                             |


### 2-2. 環境変数の設定


| #   | 作業                                                              | 状態  | 備考                         |
| --- | --------------------------------------------------------------- | --- | -------------------------- |
| B1  | `.env` に `TURSO_DATABASE_URL` を追加（本番用・ローカルで Turso 検証する場合もここに記載） | ⬜   | 例: `libsql://xxx.turso.io` |
| B2  | `.env` に `TURSO_AUTH_TOKEN` を追加                                 | ⬜   | トークンは Git にコミットしない         |


ローカルで **Turso を使わず SQLite のまま** 開発する場合は、上記は未設定のままでよい。その場合、実装側は「`TURSO_DATABASE_URL` が無いときは SQLite」と分岐する。

### 2-3. 本番デプロイ時（Vercel）


| #   | 作業                                         | 状態  |
| --- | ------------------------------------------ | --- |
| C1  | Vercel のプロジェクト設定で `TURSO_DATABASE_URL` を設定 | ⬜   |
| C2  | Vercel のプロジェクト設定で `TURSO_AUTH_TOKEN` を設定   | ⬜   |


その他 NextAuth 用の環境変数（`NEXTAUTH_URL`, `NEXTAUTH_SECRET`, OAuth の Client ID/Secret）も本番用に設定すること。詳細は [SETUP_GUIDE_auth_and_turso.md](../SETUP_GUIDE_auth_and_turso.md) の「補足: Vercel デプロイ時の環境変数」。

---

## 3. 実装タスク（進捗チェックリスト）

計画書の「3-4. タスク分解（Turso 移行）」に沿った一覧。実装はエージェントまたは自分で実施。

### 調査


| #   | タスク                                                                   | 状態  | 備考                                                                     |
| --- | --------------------------------------------------------------------- | --- | ---------------------------------------------------------------------- |
| 1   | Prisma 7 + `@prisma/adapter-libsql` の公式ドキュメントで URL・auth token の渡し方を確認 | ✅   | PrismaLibSql({ url, authToken }) で接続。Migrate は Turso 非対応のため §4 で手動手順を記載 |
| 2   | 既存マイグレーションの有無を確認                                                      | ✅   | `prisma/migrations/` に 1 本あり（`20260209081124_add_study_record_fields`） |


### 設計


| #   | タスク                                                              | 状態  | 備考                             |
| --- | ---------------------------------------------------------------- | --- | ------------------------------ |
| 3   | 環境変数ルールの確定（`TURSO_DATABASE_URL` あり ⇒ libSQL、なし ⇒ better-sqlite3） | ✅   | 両方あるときのみ libSQL、それ以外は better-sqlite3 |
| 4   | Vercel では `TURSO_*` を設定する運用でよいか決定                                | ✅   | 現状 SETUP_GUIDE は `TURSO_*` を想定。本番では Vercel に同じ変数を設定 |


### 実装


| #   | タスク                                                                                            | 状態  | 備考        |
| --- | ---------------------------------------------------------------------------------------------- | --- | --------- |
| 5   | `@prisma/adapter-libsql` と `@libsql/client` をインストール                                            | ✅   |           |
| 6   | `lib/prisma.ts` で `TURSO_DATABASE_URL` 存在時は libSQL アダプタで PrismaClient を生成、それ以外は better-sqlite3 | ✅   |           |
| 7   | `prisma.config.ts` の Turso 対応（必要なら。実行時 URL は lib/prisma で分岐するため、migrate 時に Turso を使う場合の扱いを整理）  | ✅   | 変更なし。Turso へのスキーマ適用は §4 の手動手順で実施 |
| 8   | Turso に対してスキーマ適用手順を文書化                                                             | ✅   | §4 に手順を記載（migrate diff + turso db shell） |


### 動作確認・移行


| #   | タスク                                                              | 状態  | 備考                                 |
| --- | ---------------------------------------------------------------- | --- | ---------------------------------- |
| 9   | ローカルで `TURSO_*` を設定し、Turso に対して CRUD と認証フローが動作することを確認            | ⬜   |                                    |
| 10  | 既存 SQLite のデータを Turso に移行する必要がある場合、手順を文書化（エクスポート/インポート or スクリプト） | ⬜   | 新規本番なら空の Turso に migrate のみでよい場合あり |
| 11  | Vercel デプロイ後、本番で Turso 経由の動作確認                                   | ⬜   |                                    |


---

## 4. Turso へのスキーマ適用（手順）

Prisma Migrate は Turso の HTTP 接続に対応していないため、**マイグレーション SQL を Turso CLI で流し込む**。

### 4-1. 新規 Turso DB に初回スキーマを入れる場合

1. ローカルでスキーマからフル SQL を生成する:
   ```bash
   npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script > prisma/turso_init.sql
   ```
2. Turso に適用（`<DB名>` は `turso db list` で確認）:
   ```bash
   turso db shell <DB名> < prisma/turso_init.sql
   ```

### 4-2. 既存マイグレーションを順に適用する場合

既存のマイグレーションが `prisma/migrations/` にある場合、各 SQL を順に実行する:

```bash
# 例: 1本だけの場合
turso db shell <DB名> < prisma/migrations/20260209081124_add_study_record_fields/migration.sql
```

**注意:** 初回はテーブルが無いため、`migrate diff --from-empty --to-schema-datamodel` でフル SQL を出してから 4-1 のように流すか、または「ベーススキーマ用の init マイグレーション」を別途用意してから上記の差分だけ流す必要がある。通常は 4-1 の「空→現行スキーマ」で十分。

### 4-3. 運用メモ

- ローカル開発は `TURSO_*` を設定しなければ従来どおり SQLite（`DATABASE_URL`）。マイグレーションは `npx prisma migrate dev` でローカルのみ。
- `prisma.config.ts` は変更していない。CLI の migrate はローカル SQLite 用のまま。Turso への反映は上記手動手順で行う。

---

## 5. 進捗の更新のしかた

- **手動作業（§2）:** 実施したら状態を ⬜ → ✅ に変更する。
- **実装タスク（§3）:** 実装または確認が終わったら ✅ に変更する。
- ブロッカーやメモがある場合は、該当行の「備考」に追記する。

---

## 6. 関連ファイル


| ファイル                   | 役割                                                                                                            |
| ---------------------- | ------------------------------------------------------------------------------------------------------------- |
| `lib/prisma.ts`        | Prisma クライアント生成。ここで SQLite / Turso を分岐する。                                                                     |
| `prisma.config.ts`     | Prisma CLI 用。`datasource.url` は `DATABASE_URL` を参照。Turso で migrate する場合は一時的に `TURSO_DATABASE_URL` を渡す方法などを検討。 |
| `prisma/schema.prisma` | スキーマ変更不要（SQLite 互換のため）。                                                                                       |


