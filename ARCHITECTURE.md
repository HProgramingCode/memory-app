# Memory App - 保守・引き継ぎドキュメント

> **最終更新:** 2026-02-10
>
> このドキュメントは、Memory App のソースコードを保守・改修する人間が「コードを読む前に全体を理解する」ためのものです。
> コードの逐語的な説明ではなく、**設計意図・判断の理由・注意すべき箇所**に焦点を当てています。

---

## 1. このコードが解決している問題と目的

### 解決している問題

人間は学習した知識を時間とともに忘れる（忘却曲線）。一度にまとめて復習するよりも、**忘れかけたタイミングで繰り返す**方が記憶の定着率が高い。しかし「いつ・何を復習すべきか」を人間が自力で管理するのは現実的でない。

### アプリの目的

- フラッシュカードを登録し、**間隔反復学習（SRS: Spaced Repetition System）** のアルゴリズムで「次にいつ復習すべきか」を自動計算する
- ユーザーは毎日アプリを開いて「今日復習すべきカード」を確認し、自己評価（難しい/普通/簡単）に応じて復習間隔が調整される
- 学習の継続状況（ストリーク）や定着度を可視化し、モチベーションを維持する

### 現在のフェーズ

Phase 1.5「認証機能追加」。NextAuth.js と Google OAuth による認証が実装済み。データはユーザーごとに管理される。クラウド同期（Turso）は未実装。

---

## 2. アプリ全体の処理の流れ

### 起動時（データ初期化）

1. ユーザーがブラウザで `/` にアクセスする
2. `app/layout.tsx` が読み込まれ、`ThemeRegistry`（MUI テーマ適用）と `DataInitializer` がマウントされる
3. **`DataInitializer` が3つの API を並行して呼び出す**:
   - `GET /api/decks` → 全デッキ取得
   - `GET /api/cards` → 全カード取得
   - `GET /api/study-records` → 全学習記録取得
4. 取得したデータは **Zustand ストア**（`useDeckStore`, `useCardStore`, `useStudyStore`）に格納される
5. 以降、フロントエンドの各コンポーネントはストアからデータを読み取る

### ダッシュボード表示

1. `app/page.tsx` が描画される
2. ストアから「今日期限のカード数」「全カード数」「連続学習日数」「定着度」「今日の学習枚数」「復習セッション定着率」を計算してダッシュボードに表示
3. デッキ一覧を表示。各デッキには「カード枚数」「要復習数」「定着率」「自由学習ボタン」が付く

### カードの登録・編集

1. ユーザーがデッキ詳細画面 (`/decks/[id]`) からカード追加ボタンを押す
2. `/cards/new?deckId=xxx` に遷移し、`CardForm` コンポーネントが表示される
3. 表面・裏面のテキスト（Markdown 対応）と画像を入力
4. 保存時:
   - 画像は **IndexedDB** に保存される（`lib/imageDb.ts`）
   - テキストデータは **API → SQLite DB** に保存される（`POST /api/cards`）
   - Zustand ストアにも即座に反映される

### 復習セッション（今日の復習）

1. ダッシュボードの「学習を開始する」ボタンから `/review` に遷移
2. `nextReviewDate <= 今日の日付` のカードが復習対象として抽出される
3. カードは Fisher-Yates アルゴリズムでシャッフルされる
4. ユーザーは表面を見て「答えを見る」→ 裏面を確認 → 理解度を3段階で自己評価
5. 評価に応じて SRS アルゴリズム (`lib/srs.ts`) が次回復習日を計算:
   - **難しい (again):** 間隔リセット、翌日に再復習
   - **普通 (hard):** 間隔 × 1.5倍
   - **簡単 (good):** 間隔 × easeFactor倍
6. 計算結果は `POST /api/cards/:id/review` でDB更新、ストアにも反映
7. 同時に `POST /api/study-records` で「今日復習した枚数」を+1カウント、**評価別カウント**（againCount / hardCount / goodCount）も記録
8. 全カード完了後、完了画面が表示される

### 自由学習セッション

1. デッキ一覧の「自由学習」ボタン、またはデッキ詳細の「自由学習」ボタンから `/review?deckId=xxx&mode=free` に遷移
2. 指定デッキの**全カード**が対象として抽出される（SRS スケジュールに関係なく）
3. カードは Fisher-Yates アルゴリズムでシャッフルされる
4. ユーザーは通常の復習と同様に表面→裏面→評価を行う
5. **SRS パラメータは更新されない**（nextReviewDate, intervalDays 等は変わらない）
6. `POST /api/study-records` で `freeStudyCount` を+1カウント（評価別カウントは記録しない）
7. 全カード完了後、完了画面が表示される

### エクスポート/インポート

1. 設定画面 (`/settings`) からデータの書き出し・読み込みが可能
2. エクスポート: サーバーDBのデータ + IndexedDB の画像を JSON ファイルとしてダウンロード
3. インポート: JSON ファイルを読み込み、**全データを完全に上書き置換**する（トランザクション処理）

---

## 3. ディレクトリ・主要ファイルの役割と責務

```
memory-app/
├── app/                    # Next.js App Router のページ・APIルート
│   ├── layout.tsx          # 全ページ共通レイアウト（テーマ・データ初期化）
│   ├── page.tsx            # ダッシュボード（トップページ）
│   ├── globals.css         # 最小限のグローバルCSS
│   ├── error.tsx           # エラーバウンダリ（クライアント側エラー）
│   ├── global-error.tsx    # グローバルエラーハンドリング
│   ├── login/page.tsx      # ログイン画面
│   ├── review/page.tsx     # 復習セッション画面
│   ├── settings/page.tsx   # 設定画面（エクスポート/インポート）
│   ├── decks/[id]/page.tsx # デッキ詳細（カード一覧）
│   ├── cards/new/page.tsx  # カード新規登録
│   ├── cards/[id]/edit/    # カード編集
│   └── api/                # REST API エンドポイント（後述）
│       └── auth/[...nextauth]/ # NextAuth.js 認証エンドポイント
│
├── components/             # UIコンポーネント
│   ├── auth/               # 認証関連（LoginButton）
│   ├── common/             # 共通部品（レイアウト、ダイアログ、ToastProvider等）
│   ├── dashboard/          # ダッシュボード専用コンポーネント
│   ├── card/               # カード登録/編集フォーム
│   └── review/             # 復習画面用（画像表示）
│
├── lib/                    # ビジネスロジック・ユーティリティ
│   ├── srs.ts              # ★ SRSアルゴリズム（最重要ロジック）
│   ├── prisma.ts           # Prismaクライアント初期化
│   ├── imageDb.ts          # IndexedDB 画像ストレージ
│   ├── exportImport.ts     # エクスポート/インポート処理
│   └── theme.ts            # MUI テーマ定義
│
├── stores/                 # Zustand 状態管理
│   ├── useCardStore.ts     # カードのCRUD・復習適用
│   ├── useDeckStore.ts     # デッキのCRUD
│   └── useStudyStore.ts    # 学習記録・ストリーク計算
│
├── auth.ts                 # NextAuth.js 設定（PrismaAdapter + JWT）
├── auth.config.ts          # NextAuth.js プロバイダー設定（Google OAuth）
├── middleware.ts           # 認証ミドルウェア（未ログイン時リダイレクト）
├── types/index.ts          # 型定義（Deck, Card, StudyRecord 等）
├── prisma/schema.prisma    # DBスキーマ定義（User, Account, Session モデル含む）
├── prisma/seed.ts          # ダミーデータ生成スクリプト
└── prisma.config.ts        # Prisma設定（seedコマンド含む）
```

### API エンドポイント一覧

| パス | メソッド | 役割 |
|------|----------|------|
| `/api/auth/[...nextauth]` | GET / POST | NextAuth.js 認証（Google OAuth） |
| `/api/decks` | GET / POST | デッキ一覧取得・作成 |
| `/api/decks/[id]` | GET / PUT / DELETE | デッキ個別操作 |
| `/api/cards` | GET / POST | カード一覧取得・作成 |
| `/api/cards/[id]` | GET / PUT / DELETE | カード個別操作 |
| `/api/cards/[id]/review` | POST | 復習結果の反映（SRS計算） |
| `/api/study-records` | GET / POST | 学習記録の取得・復習/自由学習1件記録（rating + mode 対応） |
| `/api/export` | GET | 全データJSON取得 |
| `/api/import` | POST | 全データJSON置換（認証必須） |

### 主要コンポーネントの責務

| コンポーネント | 責務 |
|--------------|------|
| `DataInitializer` | アプリ起動時にAPIからデータを取得してZustandストアに格納。レンダリングは何もしない（`return null`） |
| `ThemeRegistry` | MUI テーマとCSSベースラインを全ページに適用 |
| `AppLayout` | ヘッダー（アプリ名+設定ボタン）+ メインコンテンツ領域の共通レイアウト |
| `CardForm` | カードの登録・編集フォーム。Markdown エディタ + プレビュー + 画像アップロード |
| `DeckList` | デッキ一覧の表示・作成・名前変更・削除（コンテキストメニュー付き）+ 自由学習ボタン + デッキ別定着率 |
| `MasteryChart` | 全体定着度のドーナツチャート（SVG描画。intervalDays ベース。外部チャートライブラリ不使用） |
| `DailyStudyChart` | 直近7日間の学習枚数を棒グラフで表示（recharts 使用） |
| `LoginButton` | Google OAuth ログインボタン |
| `ToastProvider` | react-hot-toast によるトースト通知プロバイダー |
| `MarkdownPreview` | Markdown テキストを HTML にレンダリング。コードブロックのシンタックスハイライト付き |
| `CardImage` | IndexedDB から画像 Blob を取得して Blob URL で表示 |

---

## 4. 設計上の重要な判断点と、その理由

### 4-1. データストレージの二重構造（SQLite + IndexedDB）

**判断:** テキストデータは SQLite（サーバー側）、画像は IndexedDB（ブラウザ側）に分離

**理由:**
- Prisma + SQLite は構造化データの管理に適しているが、バイナリ（画像）の格納には不向き
- IndexedDB は Blob を効率よく保存でき、サーバーにファイルアップロード機構を作る複雑さを回避できる
- Phase 1 はシングルユーザー前提のため、ブラウザローカルに画像を持つデメリットが小さい

**将来のリスク:** マルチデバイス対応や認証導入時に、画像データの同期が課題になる。IndexedDB はブラウザ/端末に紐づくため、デバイス間で画像が共有されない。

### 4-2. Zustand による状態管理（サーバーデータのクライアントキャッシュ）

**判断:** API からのレスポンスを Zustand ストアにキャッシュし、コンポーネントはストアを参照する

**理由:**
- React Server Components ではなく Client Components 主体の設計。全ページが `"use client"` で動作する
- ストアをキャッシュとして使うことで、ページ遷移時にデータ再取得が不要
- 操作（作成・更新・削除）はAPI呼び出し後にストアも同期更新する（楽観的更新ではない）

**注意点:** ストアとDBの不整合は起きにくい設計だが、**APIエラー時にストアだけ更新されるケースはない**（エラー時は throw される）。ただしネットワーク障害時のリトライ機構はない。

### 4-3. SRS アルゴリズム（SM-2 簡易版）

**判断:** SM-2 をベースに、評価を3段階（again / hard / good）に簡略化

**理由:**
- オリジナル SM-2 は5段階評価だが、ユーザー体験の観点から3段階に絞った
- 評価の選択肢が多すぎると、復習中のテンポが悪くなる

**パラメータ:**
- `easeFactor`: 初期値 2.5、again で -0.2、hard で -0.1、good で +0.1。下限 1.3
- `intervalDays`: 初回 good で 3日、hard で 1日、again で常に 1日
- 定着済み判定: `intervalDays >= 21`

### 4-4. 日付の管理方式

**判断:** `nextReviewDate` と `StudyRecord.date` は `YYYY-MM-DD` の文字列で管理

**理由:**
- タイムゾーン問題を回避するため、日時ではなく「日付」単位で扱う
- 文字列比較（`<=`）で「今日以前 = 復習対象」の判定が可能

**注意点:** ブラウザの `new Date()` はローカルタイムゾーンを使用する。サーバー側とクライアント側で日付の境界がずれる可能性がある（後述「バグが起きやすいポイント」参照）。

### 4-5. Prisma + better-sqlite3 アダプタ

**判断:** Prisma 7 の Driver Adapter 機能を使い、better-sqlite3 経由で SQLite に接続

**理由:**
- ローカル完結型 MVP のため、外部DBサーバーが不要な SQLite を採用
- Prisma のマイグレーション機能と型安全なクエリの恩恵を受けつつ、セットアップの手軽さを両立

### 4-6. 自由学習モードと SRS の分離

**判断:** 自由学習の評価結果は SRS パラメータに反映しない

**理由:**
- SRS（忘却曲線ベース）の効果は「適切なタイミングでの復習」に依存する
- 自由学習で「簡単」を連打すると `intervalDays` が急上昇し、本来の復習スケジュールが崩れる
- 自由学習はあくまで「いつでも練習できる」機能であり、SRS とは独立した学習体験として設計

**実装:** 復習画面（`app/review/page.tsx`）が `mode=free` クエリパラメータで動作を切り替える。自由学習時は `applyReview`（SRS 更新）を呼ばず、`recordFreeStudy`（カウントのみ）を呼ぶ。

### 4-7. 定着率の二重表示（全体定着度 + セッション定着率）

**判断:** 既存の intervalDays ベースの定着度チャートと、復習セッションの評価結果ベースの定着率を並列表示

**理由:**
- intervalDays ベース（`MasteryChart`）は長期的な学習進捗を示す指標
- セッション定着率（`TodayMasteryCard`）は今日の復習パフォーマンスを示す即時フィードバック
- 両方あることで「長期の成長」と「今日の調子」の両面でモチベーションを維持できる

### 4-8. 復習画面は AppLayout を使わない

**判断:** 復習画面（`/review`）は `AppLayout`（ヘッダー+コンテナ）を使わず、全画面レイアウト

**理由:**
- 復習中はフルフォーカスでカードに集中してほしいという UX 判断
- ヘッダーの代わりに、プログレスバーと閉じるボタンだけを配置

---

## 5. 前提条件・制約・暗黙のルール

### 技術的な前提

- **Node.js** がインストールされていること（Next.js 16.1.6 の要件に準拠）
- **SQLite** の実行環境が必要（`better-sqlite3` がネイティブモジュールのためビルド環境が必要）
- 環境変数 `DATABASE_URL` が `.env` に設定されていること（例: `file:./dev.db`）
- Prisma のクライアントコードは `lib/generated/prisma/` に生成される（`npx prisma generate` が必要）

### 暗黙のルール

1. **全ページが Client Component:** `"use client"` ディレクティブを使用。Server Component は `layout.tsx` のみ
2. **データの流れは一方向:** API → Zustand ストア → コンポーネント。コンポーネントが直接 API を呼ぶことはない（ストア経由）
3. **画像の参照は ID ベース:** カードの `frontImageId` / `backImageId` は IndexedDB 内のキー。DB には画像の実体は保存されない
4. **削除は物理削除:** デッキ削除時はカードも連鎖削除（Prisma の `onDelete: Cascade`）。ゴミ箱機能はない
5. **インポートは完全置換:** 増分マージではなく、既存データを全削除して新規挿入する
6. **認証必須:** NextAuth.js + Google OAuth で認証。未ログイン時は `/login` にリダイレクトされる

### 依存関係のバージョン制約

- `next: 16.1.6` / `react: 19.2.3` — App Router の `params` が `Promise<{}>` 型（Next.js 15+ の仕様）
- `prisma: ^7.3.0` — Driver Adapter は Prisma 5.x 以降で追加、7.x で安定
- `@mui/material: ^5.18.0` — v5系。v6 への移行時は Breaking Changes に注意

---

## 6. バグや仕様変更が起きやすいポイント

### 6-1. タイムゾーンによる日付ずれ（重要度: 高）

**箇所:** `lib/srs.ts` の `getTodayString()` と `calculateNextReview()`

`new Date()` はブラウザのローカルタイムゾーンを使う。サーバー側（API Route）で `getTodayString()` を呼んだ場合、サーバーのタイムゾーン設定に依存する。日本時間 (UTC+9) で使っていれば通常問題にならないが、デプロイ先のサーバーが UTC の場合、深夜0時〜9時の間で「今日」の認識がずれる。

**影響:** 復習対象カードの抽出漏れ、学習記録の日付ずれ

### 6-2. IndexedDB と SQLite の整合性（重要度: 高）

**箇所:** `lib/imageDb.ts` と `stores/useCardStore.ts`

カード削除時に IndexedDB の画像も削除する処理がある（`useCardStore.deleteCard`）が、以下のケースで不整合が起きうる:

- ブラウザのデータを消去した場合、IndexedDB の画像は失われるがDB上のカードの `imageId` は残る → 画像なしで表示される（エラーにはならない）
- インポート時、IndexedDB はクリア＆再作成されるが、**別ブラウザでエクスポートした画像は元のブラウザの IndexedDB にしかない**

### 6-3. ストリーク計算のロジック（重要度: 中）

**箇所:** `stores/useStudyStore.ts` の `getStreak()`

ストリーク計算は「今日」または「昨日」から過去に向かって連続日を数える。ロジックがやや複雑で、以下のエッジケースに注意:

- 今日まだ学習していない場合、昨日を起点にストリークを計算する
- 日付を跨いだ瞬間（0時）にストリークがリセットされる可能性がある

### 6-4. SRS パラメータの蓄積的な偏り（重要度: 中）

**箇所:** `lib/srs.ts` の `calculateNextReview()`

`easeFactor` は "again" 評価で -0.2 ずつ下がり、下限 1.3 で止まる。一度 1.3 まで下がったカードは、"good" 評価（+0.1）を繰り返しても回復が遅い。長期運用で「いつまでも短い間隔でしか出ないカード」が増える可能性がある。

### 6-5. 復習カードの初回シャッフル固定（重要度: 低）

**箇所:** `app/review/page.tsx` の `useEffect([], ...)`

復習カードは画面マウント時に1回だけシャッフルされ、以後は固定順。ブラウザバックで戻って再度 `/review` に入ると、新しいシャッフルでリスタートになる（途中経過は失われる）。

### 6-6. API エラーハンドリングの不統一（重要度: 低）

**箇所:** 各 Zustand ストアの fetch 系メソッド

API 呼び出しが失敗した場合、`throw new Error(...)` するだけで、ユーザーへのフィードバック（エラーメッセージ表示）がない。設定画面のエクスポート/インポートだけは Snackbar でエラー通知しているが、他の画面には同等の仕組みがない。

### 6-7. `DataInitializer` の初期化タイミング

**箇所:** `components/common/DataInitializer.tsx`

`initialized` フラグで二重取得を防いでいるが、**データ取得完了を待たずにページが描画される**。つまり、初期表示時にストアが空の状態でレンダリングされ、データ到着後に再レンダリングされる。ローディングインジケーターがないため、一瞬「データがない」状態が見える。

---

## 7. 人が必ず理解しておくべき箇所と、流し読みでよい箇所

### 必ず理解すべき（改修前に必読）

| ファイル | 理由 |
|---------|------|
| `lib/srs.ts` | アプリの核心ロジック。SRS の計算式を変えると全ユーザーの復習スケジュールに影響する |
| `types/index.ts` | 全データ型の定義。型を変えるとフロント・バック両方に影響が波及する |
| `prisma/schema.prisma` | DBスキーマ。フィールド追加・変更にはマイグレーションが必要 |
| `stores/useCardStore.ts` | カードの全操作を担うストア。API呼び出し＋ストア同期＋画像削除が絡む |
| `lib/exportImport.ts` | エクスポート/インポートのデータ構造。フォーマット変更は後方互換性に影響 |
| `lib/imageDb.ts` | 画像の保存・取得・削除。IndexedDB の構造を理解しないと画像関連のバグを追えない |
| `components/common/DataInitializer.tsx` | データ初期化の起点。初期化順序やタイミングの問題はここが関係する |

### 重点的に理解すべき（機能追加時に参照）

| ファイル | 理由 |
|---------|------|
| `app/api/cards/[id]/review/route.ts` | 復習APIのエンドポイント。SRS計算の呼び出し元 |
| `app/api/import/route.ts` | トランザクション処理。データ置換の順序が重要 |
| `stores/useStudyStore.ts` | ストリーク計算のロジック。日付周りのバグは大体ここ |
| `components/card/CardForm.tsx` | 最も複雑なUIコンポーネント。画像+Markdown+デッキ選択が1つのフォームに集約 |

### 流し読みでよい（構造がシンプル）

| ファイル | 理由 |
|---------|------|
| `app/layout.tsx` | 定型的なレイアウト定義 |
| `app/globals.css` | 最小限のリセットCSS（13行） |
| `lib/theme.ts` | MUI テーマの色・角丸・フォント定義。デザイン変更時のみ参照 |
| `lib/prisma.ts` | Prismaクライアント初期化のボイラープレート |
| `components/common/ThemeRegistry.tsx` | テーマプロバイダのラッパー（定型） |
| `components/common/ConfirmDialog.tsx` | 汎用確認ダイアログ（プロップスを渡すだけ） |
| `components/common/EmptyState.tsx` | 空状態表示の汎用コンポーネント |
| `components/common/MarkdownPreview.tsx` | Markdown レンダリング（react-markdown のラッパー） |
| `components/review/CardImage.tsx` | IndexedDB から画像を取得して表示するだけ |
| `components/dashboard/StudySummaryCard.tsx` | 表示のみのカードコンポーネント |
| `components/dashboard/TodayReviewCard.tsx` | 表示のみのカードコンポーネント |
| `components/dashboard/DailyStudyChart.tsx` | 表示のみのチャートコンポーネント（recharts 使用） |
| `app/api/decks/route.ts` | 単純な CRUD |
| `app/api/decks/[id]/route.ts` | 単純な CRUD |
| `app/api/cards/route.ts` | 単純な CRUD |
| `app/api/cards/[id]/route.ts` | 単純な CRUD |
| `app/api/study-records/route.ts` | upsert を使った簡潔な記録処理 |
| `next.config.ts` | 空の設定ファイル |
| `prisma.config.ts` | Prisma の設定ファイル（自動生成ベース） |
| `eslint.config.mjs` | ESLint 設定（Next.js 標準） |

---

## 補足: 開発環境のセットアップ手順

```bash
# 1. 依存関係のインストール
npm install

# 2. 環境変数の設定（.env ファイルを確認・作成）
# DATABASE_URL="file:./dev.db" が最低限必要

# 3. Prisma クライアントの生成
npx prisma generate

# 4. データベースのマイグレーション（初回のみ）
npx prisma db push

# 5. 開発サーバーの起動
npm run dev
```

---

## 補足: データフロー図

```
┌─────────────────────────────────────────────────┐
│                   ブラウザ                        │
│                                                   │
│  ┌───────────────┐    ┌──────────────────────┐   │
│  │  Zustand Store │◄───│   DataInitializer     │   │
│  │  (メモリ内)     │    │   (初回データ取得)     │   │
│  └───────┬───────┘    └──────────────────────┘   │
│          │ 読み取り                                │
│          ▼                                        │
│  ┌───────────────┐    ┌──────────────────────┐   │
│  │  React         │    │   IndexedDB           │   │
│  │  Components    │───▶│   (画像Blob保存)       │   │
│  └───────┬───────┘    └──────────────────────┘   │
│          │ API呼び出し(fetch)                      │
└──────────┼────────────────────────────────────────┘
           │
           ▼
┌──────────────────────────────────────────────────┐
│               Next.js API Routes                  │
│                                                    │
│  ┌──────────────┐    ┌─────────────────────────┐ │
│  │  route.ts     │───▶│  Prisma Client           │ │
│  │  (各API)      │    │  → SQLite (dev.db)       │ │
│  └──────────────┘    └─────────────────────────┘ │
└──────────────────────────────────────────────────┘
```

---

## 補足: SRS アルゴリズム早見表

| 評価 | intervalDays (初回) | intervalDays (2回目以降) | easeFactor 変化 | repetitionCount |
|------|---------------------|------------------------|-----------------|-----------------|
| again (難しい) | 1日 | 1日（リセット） | -0.2（下限 1.3） | 0にリセット |
| hard (普通) | 1日 | 前回 × 1.5（切り上げ） | -0.1（下限 1.3） | +1 |
| good (簡単) | 3日 | 前回 × easeFactor（切り上げ） | +0.1 | +1 |

**定着済み判定:** `intervalDays >= 21` のカードは「定着済み」として扱われる

---

## 変更履歴

| 日付 | 変更内容 |
|------|---------|
| 2026-02-09 | 初版作成 |
| 2026-02-09 | 自由学習モード・定着率改善の設計判断・フロー・コンポーネント情報を追加 |
| 2026-02-10 | 認証機能（NextAuth.js + Google OAuth）追加。ダッシュボードUI刷新（DailyStudyChart追加、TodayMasteryCard削除）。エラーハンドリングページ、ログインページ、シードスクリプト追加 |
| 2026-02-13 | 責務分離 一覧取得をSSRに修正進捗30% 対応具体内容:CSRからFetchしていた一覧取得をServer Componentで取得するように変更。Cards取得のみ修正　残: useDeckの取得、useStudyRecordsの取得 |
| 2026-02-16 | 責務分離 一覧取得をSSRに修正進捗60% 対応具体内容:useDeckの一覧取得をServer Componentで取得するように変更、責務分離をより明確化 残:useStudyRecordsの取得、 「UIの途中状態をユーザーに見せずに、最終形で初回レンダリングしたい」 が現状の課題|