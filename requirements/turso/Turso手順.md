# Turso セットアップ・運用ガイド

このドキュメントでは、Turso（クラウド SQLite）のセットアップから動作確認までを解説します。

---

## 目次

1. [Turso とは](#1-turso-とは)
2. [セットアップ手順](#2-セットアップ手順)
3. [スキーマの適用](#3-スキーマの適用)
4. [動作確認の方法](#4-動作確認の方法)
5. [よくある質問](#5-よくある質問)

---

## 1. Turso とは

Turso は **クラウドでホストされる SQLite** です。

| 項目 | ローカル SQLite | Turso |
|------|----------------|-------|
| 場所 | 自分の PC 内（`prisma/dev.db`） | クラウド上 |
| 用途 | 開発時 | 本番環境（Vercel 等） |
| 接続方式 | ファイルパス | URL + トークン |

**なぜ Turso を使うのか？**

- Vercel などのサーバーレス環境では、ローカルファイル（`dev.db`）にアクセスできない
- Turso を使えば、SQLite の手軽さを保ちつつクラウドで動かせる

---

## 2. セットアップ手順

### 2-1. Turso CLI のインストール

```bash
# macOS
brew install tursodatabase/tap/turso

# その他の OS は公式ドキュメント参照
# https://docs.turso.tech/cli/installation
```

### 2-2. ログイン

```bash
turso auth login
```

ブラウザが開くので、GitHub アカウントでログインします。

### 2-3. データベースの作成

```bash
turso db create memory-app-db
```

### 2-4. 接続情報の取得

```bash
# データベース URL を確認
turso db show memory-app-db --url

# 認証トークンを発行
turso db tokens create memory-app-db
```

### 2-5. 環境変数の設定

`.env` ファイルに以下を追加します：

```env
TURSO_DATABASE_URL="libsql://your-db-name.turso.io"
TURSO_AUTH_TOKEN="your-token-here"
```

> **注意**: トークンは秘密情報です。Git にコミットしないでください。

---

## 3. スキーマの適用

Turso には Prisma の `migrate dev` が使えないため、手動で SQL を流し込みます。

### 3-1. SQL ファイルの生成

```bash
npx prisma migrate diff --from-empty --to-schema prisma/schema.prisma --script > prisma/turso_init.sql
```

これで現在のスキーマから SQL が生成されます。

### 3-2. Turso に適用

```bash
turso db shell memory-app-db < prisma/turso_init.sql
```

### 3-3. 適用結果の確認

```bash
turso db shell memory-app-db "SELECT name FROM sqlite_master WHERE type='table';"
```

以下のテーブルが表示されれば成功です：

```
Account
Card
Deck
Session
StudyRecord
User
VerificationToken
```

---

## 3.5. シードデータの投入

テスト用のサンプルデータを Turso に入れる場合：

```bash
npx tsx prisma/seed-turso.ts
```

**注意**: このスクリプトは `.env` の `TURSO_DATABASE_URL` と `TURSO_AUTH_TOKEN` を使って Turso に接続します。

> ローカル SQLite 用のシードは `npx prisma db seed`（`prisma/seed.ts` を使用）

## 3.6. データの削除（リセット）

Turso の全データを削除する場合：

```bash
npx tsx prisma/reset-turso.ts
```

- 3秒の確認待ちがあります（Ctrl+C で中断可能）
- テーブル構造は残り、データのみ削除されます
- 確認をスキップする場合: `FORCE=1 npx tsx prisma/reset-turso.ts`

| コマンド | 用途 |
|----------|------|
| `npx tsx prisma/seed-turso.ts` | シードデータ投入 |
| `npx tsx prisma/reset-turso.ts` | 全データ削除 |

---

## 4. 動作確認の方法

### 4-1. Turso Dashboard（公式 Web UI）

Prisma Studio のように **視覚的に** データを確認できます。

1. https://app.turso.tech にアクセス
2. GitHub でログイン
3. データベース `memory-app-db` を選択
4. 「Data Browser」タブでテーブルとデータを確認

> **おすすめ**: Prisma Studio の代わりに使えます。

### 4-2. DB Pro（デスクトップアプリ）

より Prisma Studio に近い操作感を求める場合：

- https://www.dbpro.app/turso-desktop-client
- インライン編集、フィルタリング、SQL エディタが使える

### 4-3. Turso CLI でデータを確認

コマンドラインで確認する場合は **Turso CLI** を使います。

```bash
# 対話モードで接続
turso db shell memory-app-db

# テーブル一覧
.tables

# ユーザー一覧を確認
SELECT * FROM User;

# デッキ一覧を確認
SELECT * FROM Deck;

# カード一覧を確認
SELECT * FROM Card;

# 終了
.quit
```

### 4-4. ワンライナーでの確認

```bash
# ユーザー数を確認
turso db shell memory-app-db "SELECT COUNT(*) FROM User;"

# 最新のユーザーを確認
turso db shell memory-app-db "SELECT id, name, email FROM User ORDER BY createdAt DESC LIMIT 5;"

# デッキとカード数を確認
turso db shell memory-app-db "SELECT d.name, COUNT(c.id) as card_count FROM Deck d LEFT JOIN Card c ON d.id = c.deckId GROUP BY d.id;"
```

### 4-5. アプリからの動作確認

1. **開発サーバーを起動**
   ```bash
   npm run dev
   ```

2. **http://localhost:3000 にアクセス**

3. **Google 認証でログイン**
   - 成功すれば User テーブルにレコードが作成される

4. **デッキを作成**
   - Deck テーブルにレコードが作成される

5. **カードを追加**
   - Card テーブルにレコードが作成される

6. **Turso CLI で確認**
   ```bash
   turso db shell memory-app-db "SELECT * FROM User;"
   turso db shell memory-app-db "SELECT * FROM Deck;"
   ```

---

## 5. よくある質問

### Q: Prisma Studio で Turso のデータを見れる？

**A: 見れません。**

Prisma Studio は `DATABASE_URL`（ローカル SQLite）に接続するため、Turso のデータは表示されません。Turso のデータを確認するには `turso db shell` を使ってください。

### Q: ローカル開発は SQLite、本番は Turso にしたい

**A: 環境変数で自動切り替えされます。**

`lib/prisma.ts` で以下のように分岐しています：

- `TURSO_DATABASE_URL` と `TURSO_AUTH_TOKEN` が **両方ある** → Turso に接続
- それ以外 → ローカル SQLite（`DATABASE_URL`）に接続

ローカルで SQLite を使いたい場合は、`.env` から `TURSO_*` の行をコメントアウトしてください。

### Q: スキーマを変更したらどうする？

**A: 以下の手順を実行してください。**

1. ローカルでマイグレーション（SQLite 用）
   ```bash
   npx prisma migrate dev --name your_change_name
   ```

2. Turso 用の差分 SQL を生成
   ```bash
   npx prisma migrate diff \
     --from-config-datasource \
     --to-schema prisma/schema.prisma \
     --script > prisma/turso_diff.sql
   ```

3. Turso に適用
   ```bash
   turso db shell memory-app-db < prisma/turso_diff.sql
   ```

### Q: 本番（Vercel）で Turso を使うには？

**A: Vercel の環境変数に設定してください。**

1. Vercel ダッシュボード → Settings → Environment Variables
2. 以下を追加：
   - `TURSO_DATABASE_URL`: `libsql://your-db.turso.io`
   - `TURSO_AUTH_TOKEN`: トークン値

---

## 参考リンク

- [Turso 公式ドキュメント](https://docs.turso.tech/)
- [Prisma + Turso ガイド](https://www.prisma.io/docs/orm/overview/databases/turso)
