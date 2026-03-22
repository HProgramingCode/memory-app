## デプロイ手順（概要）

### 対象読者
- Vercel + Turso 構成で Memory App を本番環境にデプロイしたい人

### 前提
- ローカルでアプリが起動し、基本的な動作確認が済んでいること。
- 詳細な手順は `requirements/deploy/デプロイ手順.md` を参照してください。

### ゴール
- Vercel 上にアプリがデプロイされ、ログイン〜学習〜インポート/エクスポートまで一通り動く状態にする。

### 手順の流れ
1. Turso のセットアップ（未実施の場合）
2. Vercel プロジェクト作成
3. 環境変数の設定
4. デプロイ実行
5. 動作確認

### 1. Turso のセットアップ
- `requirements/turso/` 配下のドキュメントを参照して、DB の作成・トークン発行・スキーマ適用を行います。
- 最低限、以下が確認できていれば OK です。
  - `TURSO_DATABASE_URL` が取得できる
  - `TURSO_AUTH_TOKEN` が発行できる

### 2. Vercel プロジェクト作成
- Vercel CLI または Web コンソールからプロジェクトを作成します。
- ルートディレクトリはリポジトリ直下（`./`）を指定します。

### 3. 環境変数の設定
Vercel の「Environment Variables」に以下を登録します。

- `TURSO_DATABASE_URL`
- `TURSO_AUTH_TOKEN`
- `AUTH_SECRET`
- `AUTH_GOOGLE_ID`
- `AUTH_GOOGLE_SECRET`

値の入手方法は `requirements/deploy/デプロイ手順.md` の「1-2. 環境変数の準備」を参照してください。

### 4. デプロイ実行
- `vercel` または Vercel の UI からデプロイを実行します。
- 初回デプロイ後に自動でビルドとデプロイが行われます。

### 5. 動作確認のポイント
- Google ログインが成功すること
- デッキ作成・カード作成・復習が正常に行えること
- 設定画面からの全体エクスポート/インポートが動作すること

詳細なチェックリストは `requirements/deploy/デプロイ手順.md` の最後のセクションを参照してください。

