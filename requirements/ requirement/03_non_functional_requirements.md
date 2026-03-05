# 非機能要件 (NON_FUNCTIONAL_REQUIREMENTS)

## 1. 概要
本ドキュメントは、アプリケーションの品質、パフォーマンス、および開発・運用上の技術的制約や選択肢を定義する。

## 2. プラットフォーム
- **Target Platform:** モダンなPCおよびスマートフォンのWebブラウザ。
- **Requirement:** アプリケーションは、単一のコードベースでPCとスマートフォンの両方の画面サイズに対応するレスポンシブデザインを採用すること。

## 3. データ保存 (Data Persistence)
- **Phase 1 (MVP):**
  - **Requirement:** 全てのユーザーデータ（知識カードのテキスト、画像、学習スケジュール等）は、サーバーを介さず、ユーザーのブラウザ内に永続化されること。
  - **Rationale:** サーバー開発・維持コストをゼロにし、迅速なMVPリリースを可能にするため。また、ユーザーのプライバシーを最大限に保護するため。
  - **Implementation Detail:**
    - テキストデータ: ブラウザの `Local Storage` を利用する。
    - 画像データ: 容量の大きい画像ファイルを扱うため、`Local Storage` よりも大容量を扱える `IndexedDB` を利用する。画像はBlob形式で保存する。
- **Phase 2 以降 (Server-side):**
  - **Requirement:** ユーザーアカウントの作成に伴い、全てのデータはクラウド上のデータベースに保存され、複数デバイス間でのデータ同期が可能になること。

## 4. インフラ (Infrastructure)
- **Deployment / Hosting: Vercel**
  - **Rationale:**
    - **DX (Developer Experience):** GitHubリポジトリと連携し、`git push` をトリガーとした自動ビルド・デプロイ（CI/CD）が容易に構築できるため。
    - **Next.js Compatibility:** Next.jsの開発元であり、フレームワークの全機能（API Routes, SSR, etc.）を最適にホスティングできるため。
    - **Cost:** 個人・非商用プロジェクト向けの寛大な無料枠が存在し、低コストでの運用が可能であるため。
    - **Serverless:** API Routesは自動的にサーバーレス関数（AWS Lambda）としてデプロイされるため、インフラ管理の手間なくスケーラビリティの恩恵を受けられる。

## 5. 技術スタック (Technology Stack)

### 5.1. フレームワーク: Next.js
- **Rationale:** Reactベースのフルスタックフレームワークであり、UIコンポーネントとAPIエンドポイントを一つのプロジェクトで管理できる。Phase 1（静的サイト）からPhase 2（動的サイト）へのシームレスな移行に最適であるため。

### 5.2. 言語: TypeScript
- **Rationale:** 静的型付けにより、コードの品質と保守性を向上させる。フロントエンドとバックエンドで言語を統一することで、開発効率を高めるため。

### 5.3. UIライブラリ: MUI (Material-UI)
- **Rationale:** GoogleのMaterial Designに準拠した、高品質でアクセシビリティの高いUIコンポーネント群が提供されている。これにより、デザインの一貫性を保ちながら、迅速にUIを構築できるため。

### 5.4. [Phase 2] バックエンド・プラットフォーム: Supabase
- **Rationale:**
  - **All-in-One:** データベース（PostgreSQL）、ユーザー認証、ファイルストレージといった、Phase 2で必要となるバックエンド機能がワンストップで提供されるため。
  - **Cost-Effective:** 開発や小規模運用には十分な無料枠が提供されており、低コストで始められるため。
  - **Compatibility:** 標準的なPostgreSQLをベースとしているため、特定のベンダーにロックインされにくく、Prismaとの相性も良いため。

### 5.5. [Phase 2] データベースORM: Prisma
- **Rationale:** TypeScriptとの親和性が非常に高く、スキーマ定義から型安全なデータベースクライアントを自動生成できる。これにより、データベース関連のコードの品質と開発効率が大幅に向上するため。
