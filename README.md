# Memory App
## 開発中のため、ソースコードは、devブランチを参照してください。

Memory App は、**間隔反復学習（SRS: Spaced Repetition System）** を用いた
フラッシュカード型の学習アプリです。

忘却曲線に基づき「いつ復習すべきか」を自動計算し、
ユーザーは毎日アプリを開くだけで効率的な復習を行えます。

---

## 概要

- フラッシュカードをデッキ単位で管理
- SRS アルゴリズムにより復習タイミングを自動調整
- Google OAuth（NextAuth.js）による認証
- 学習状況・定着度・ストリークを可視化
- 自由学習モードによるスケジュール非依存の復習

---

## 主な機能

### 復習（SRS）

- 「難しい / 普通 / 簡単」の3段階評価
- 評価に応じて次回復習日を自動計算
- 今日が期限のカードのみを復習対象として提示

### 自由学習

- デッキ内の全カードを対象に復習可能
- SRS パラメータは更新せず、練習用途に特化
- 学習回数のみ記録

### 学習状況の可視化

- 今日期限のカード数
- 全体の定着度（intervalDays ベース）
- 直近7日間の学習枚数
- 連続学習日数（ストリーク）

### データ管理

- デッキ・カードの作成 / 編集 / 削除
- データのエクスポート / インポート（完全置換）
- 画像付きカード対応

---

## 技術スタック

- **Frontend / Backend**
  - Next.js (App Router)
  - React
  - TypeScript
- **UI**
  - MUI (v5)
- **State Management**
  - Zustand
- **Auth**
  - NextAuth.js + Google OAuth
- **Database**
  - Prisma + SQLite (better-sqlite3)
- **Client Storage**
  - IndexedDB（画像保存）

---

## アーキテクチャ概要

- サーバー側:  
  - Next.js API Routes + Prisma により SQLite を操作
- クライアント側:  
  - API で取得したデータを Zustand にキャッシュ
  - コンポーネントは Zustand ストアのみを参照
- 画像データ:  
  - IndexedDB に Blob として保存（DB には ID のみ保持）
