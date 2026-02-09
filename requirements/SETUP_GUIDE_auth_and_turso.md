# セットアップ手順書 — 認証 + Turso

> **対象:** ステップ 11 Phase A（外部サービスのセットアップ）
> **所要時間:** 約 30〜60 分
> **前提:** ブラウザと GitHub アカウントがあること

---

## 目次

1. [Turso のセットアップ](#1-turso-のセットアップ)
2. [Google OAuth のセットアップ](#2-google-oauth-のセットアップ)
3. [GitHub OAuth のセットアップ](#3-github-oauth-のセットアップ)
4. [NextAuth Secret の生成](#4-nextauth-secret-の生成)
5. [.env ファイルの設定](#5-env-ファイルの設定)
6. [確認チェックリスト](#6-確認チェックリスト)

---

## 1. Turso のセットアップ

Turso は SQLite 互換のクラウドデータベースサービス。無料枠で十分に開発・小規模運用が可能。

### 1-1. アカウント作成

1. https://turso.tech にアクセス
2. 「Get Started」をクリック
3. **GitHub アカウントでサインアップ**（推奨）

### 1-2. Turso CLI のインストール

```bash
# macOS (Homebrew)
brew install tursodatabase/tap/turso

# インストール確認
turso --version
```

> Homebrew がない場合: `curl -sSfL https://get.tur.so/install.sh | bash`

### 1-3. CLI でログイン

```bash
turso auth login
```

ブラウザが開くので、GitHub アカウントで認証する。

### 1-4. データベースの作成

```bash
# データベースを作成（名前は任意。例: memory-app-db）
turso db create memory-app-db

# 作成されたDBの情報を確認
turso db show memory-app-db
```

出力例:
```
Name:           memory-app-db
URL:            libsql://memory-app-db-your-org.turso.io
ID:             xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
Group:          default
...
```

**→ `URL` の値をメモする（後で `.env` に設定）**

### 1-5. 認証トークンの取得

```bash
turso db tokens create memory-app-db
```

長いトークン文字列が表示される。

**→ トークンの値をメモする（後で `.env` に設定）**

### 1-6. 取得した値の確認

| 項目 | 例 | 環境変数名 |
|------|-----|-----------|
| Database URL | `libsql://memory-app-db-your-org.turso.io` | `TURSO_DATABASE_URL` |
| Auth Token | `eyJhbGciOiJ...（長い文字列）` | `TURSO_AUTH_TOKEN` |

---

## 2. Google OAuth のセットアップ

Google アカウントでのログインを実現するため、Google Cloud Console で OAuth クライアントを作成する。

### 2-1. Google Cloud Console にアクセス

1. https://console.cloud.google.com にアクセス
2. Google アカウントでログイン

### 2-2. プロジェクトの作成

1. 画面上部のプロジェクト選択ドロップダウンをクリック
2. 「新しいプロジェクト」をクリック
3. **プロジェクト名:** `Memory App`（任意）
4. 「作成」をクリック
5. 作成されたプロジェクトが選択されていることを確認

### 2-3. OAuth 同意画面の設定

1. 左メニュー → 「APIとサービス」→「OAuth 同意画面」
2. 「開始」または「同意画面を構成」をクリック
3. 以下を入力:

| 項目 | 入力値 |
|------|--------|
| アプリ名 | `Memory App` |
| ユーザーサポートメール | 自分のメールアドレス |
| デベロッパーの連絡先情報 | 自分のメールアドレス |

4. 「保存して次へ」をクリック
5. **スコープ:** デフォルトのまま「保存して次へ」
6. **テストユーザー:** 自分のメールアドレスを追加（開発中はテストモード）
7. 「保存して次へ」→「ダッシュボードに戻る」

### 2-4. OAuth クライアント ID の作成

1. 左メニュー → 「APIとサービス」→「認証情報」
2. 「+ 認証情報を作成」→「OAuth クライアント ID」をクリック
3. 以下を入力:

| 項目 | 入力値 |
|------|--------|
| アプリケーションの種類 | **ウェブ アプリケーション** |
| 名前 | `Memory App Web Client`（任意） |
| 承認済みの JavaScript 生成元 | `http://localhost:3000` |
| 承認済みのリダイレクト URI | `http://localhost:3000/api/auth/callback/google` |

> **本番環境の追加（デプロイ後）:**
> - 生成元: `https://your-app.vercel.app`
> - リダイレクト URI: `https://your-app.vercel.app/api/auth/callback/google`

4. 「作成」をクリック
5. **クライアント ID** と **クライアント シークレット** が表示される

**→ 両方の値をメモする（後で `.env` に設定）**

### 2-5. 取得した値の確認

| 項目 | 例 | 環境変数名 |
|------|-----|-----------|
| クライアント ID | `123456789-xxxxx.apps.googleusercontent.com` | `GOOGLE_CLIENT_ID` |
| クライアント シークレット | `GOCSPX-xxxxx` | `GOOGLE_CLIENT_SECRET` |

---

## 3. GitHub OAuth のセットアップ

GitHub アカウントでのログインを実現するため、GitHub Developer Settings で OAuth App を作成する。

### 3-1. GitHub Developer Settings にアクセス

1. https://github.com/settings/developers にアクセス
2. GitHub にログイン済みであること

### 3-2. OAuth App の作成

1. 「OAuth Apps」タブをクリック
2. 「New OAuth App」をクリック
3. 以下を入力:

| 項目 | 入力値 |
|------|--------|
| Application name | `Memory App`（任意） |
| Homepage URL | `http://localhost:3000` |
| Authorization callback URL | `http://localhost:3000/api/auth/callback/github` |

> **本番環境用には別の OAuth App を作成するか、デプロイ後に URL を更新する**
> - Homepage URL: `https://your-app.vercel.app`
> - Callback URL: `https://your-app.vercel.app/api/auth/callback/github`

4. 「Register application」をクリック

### 3-3. Client Secret の生成

1. 作成された OAuth App の設定ページが開く
2. **Client ID** が表示されている → メモする
3. 「Generate a new client secret」をクリック
4. **Client Secret** が表示される → **この時だけ表示されるので必ずメモする**

### 3-4. 取得した値の確認

| 項目 | 例 | 環境変数名 |
|------|-----|-----------|
| Client ID | `Iv1.xxxxxxxxxx` | `GITHUB_CLIENT_ID` |
| Client Secret | `xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx` | `GITHUB_CLIENT_SECRET` |

---

## 4. NextAuth Secret の生成

セッション暗号化に使用するランダム文字列を生成する。

### ターミナルで実行

```bash
openssl rand -base64 32
```

出力例:
```
xY3kZ9mN2pQ7wR4tU6vJ8hL1dF5gA0cE=
```

**→ この値をメモする（後で `.env` に設定）**

| 項目 | 環境変数名 |
|------|-----------|
| 生成した文字列 | `NEXTAUTH_SECRET` |

---

## 5. .env ファイルの設定

プロジェクトルートの `.env` ファイルを以下の内容に更新する。

```env
# ============================================================
# Database
# ============================================================
# ローカル開発用（SQLite）
DATABASE_URL="file:./dev.db"

# 本番用（Turso） - ローカル開発時はコメントアウトのまま
# TURSO_DATABASE_URL="libsql://memory-app-db-your-org.turso.io"
# TURSO_AUTH_TOKEN="eyJhbGciOiJ..."

# ============================================================
# NextAuth.js
# ============================================================
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="ここに openssl rand -base64 32 の出力を貼る"

# ============================================================
# Google OAuth
# ============================================================
GOOGLE_CLIENT_ID="ここに Google Client ID を貼る"
GOOGLE_CLIENT_SECRET="ここに Google Client Secret を貼る"

# ============================================================
# GitHub OAuth
# ============================================================
GITHUB_CLIENT_ID="ここに GitHub Client ID を貼る"
GITHUB_CLIENT_SECRET="ここに GitHub Client Secret を貼る"
```

> **重要:** `.env` ファイルは `.gitignore` に含まれていることを確認してください。  
> シークレット情報が Git にコミットされないようにしてください。

---

## 6. 確認チェックリスト

すべてのセットアップが完了したら、以下をチェックしてください。

- [ ] **Turso**
  - [ ] Turso アカウントを作成した
  - [ ] `turso auth login` でログインできた
  - [ ] `turso db create memory-app-db` でDBを作成した
  - [ ] `TURSO_DATABASE_URL` をメモした
  - [ ] `TURSO_AUTH_TOKEN` をメモした

- [ ] **Google OAuth**
  - [ ] Google Cloud Console でプロジェクトを作成した
  - [ ] OAuth 同意画面を設定した
  - [ ] OAuth クライアント ID を作成した
  - [ ] リダイレクト URI に `http://localhost:3000/api/auth/callback/google` を設定した
  - [ ] `GOOGLE_CLIENT_ID` をメモした
  - [ ] `GOOGLE_CLIENT_SECRET` をメモした

- [ ] **GitHub OAuth**
  - [ ] GitHub Developer Settings で OAuth App を作成した
  - [ ] Callback URL に `http://localhost:3000/api/auth/callback/github` を設定した
  - [ ] `GITHUB_CLIENT_ID` をメモした
  - [ ] `GITHUB_CLIENT_SECRET` をメモした

- [ ] **NextAuth Secret**
  - [ ] `openssl rand -base64 32` で秘密鍵を生成した
  - [ ] `NEXTAUTH_SECRET` をメモした

- [ ] **.env**
  - [ ] `.env` ファイルに全ての値を設定した
  - [ ] `.env` が `.gitignore` に含まれている

---

## 補足: Vercel デプロイ時の環境変数

Vercel にデプロイする際は、Vercel のプロジェクト設定で以下の環境変数を設定する:

| 環境変数 | 値 |
|----------|-----|
| `TURSO_DATABASE_URL` | Turso の Database URL |
| `TURSO_AUTH_TOKEN` | Turso の Auth Token |
| `NEXTAUTH_URL` | `https://your-app.vercel.app` |
| `NEXTAUTH_SECRET` | 生成した秘密鍵 |
| `GOOGLE_CLIENT_ID` | Google Client ID |
| `GOOGLE_CLIENT_SECRET` | Google Client Secret |
| `GITHUB_CLIENT_ID` | GitHub Client ID |
| `GITHUB_CLIENT_SECRET` | GitHub Client Secret |

> Google / GitHub の OAuth 設定で、本番 URL のリダイレクト URI も追加する必要がある。
