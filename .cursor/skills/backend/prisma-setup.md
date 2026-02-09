---
name: prisma-setup
description: |
  Next.js プロジェクトで Prisma ORM (v7) + SQLite をセットアップし、
  API Routes と Zustand ストアを連携させる。
  Prisma の導入、スキーマ定義、マイグレーション、API Routes 作成時に使用する。
---

## Purpose

Next.js (App Router) プロジェクトに Prisma ORM を導入し、
型安全な DB アクセスと API Routes による CRUD エンドポイントを構築する。

---

## 前提条件

- Next.js (App Router) プロジェクトが作成済み
- TypeScript が設定済み

---

## セットアップ手順

### 1. パッケージインストール

```bash
npm install @prisma/client @prisma/adapter-better-sqlite3 dotenv
npm install -D prisma @types/better-sqlite3
```

### 2. Prisma 初期化

```bash
npx prisma init --datasource-provider sqlite
```

生成されるファイル:

- `prisma/schema.prisma` — スキーマ定義
- `prisma.config.ts` — Prisma 設定
- `.env` — `DATABASE_URL="file:./dev.db"`

### 3. スキーマ定義

`prisma/schema.prisma` にモデルを定義:

```prisma
generator client {
  provider = "prisma-client"
  output   = "../lib/generated/prisma"
}

datasource db {
  provider = "sqlite"
}

model Example {
  id        String   @id @default(uuid())
  name      String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

**注意事項:**

- `output` は `../lib/generated/prisma` に設定（プロジェクト内に生成）
- SQLite では `@default(uuid())` で UUID を使用可能
- リレーションの cascade 削除: `@relation(... onDelete: Cascade)`

### 4. DB 反映 & クライアント生成

```bash
npx prisma generate
npx prisma db push
```

### 5. PrismaClient シングルトン作成

`lib/prisma.ts`:

```typescript
import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@/lib/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL ?? "file:./prisma/dev.db";
  const adapter = new PrismaBetterSqlite3({ url: connectionString });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
```

**重要ポイント:**

- Prisma 7.x では `PrismaClient` にドライバーアダプターの指定が**必須**
- SQLite: `@prisma/adapter-better-sqlite3` を使用
- `globalThis` にキャッシュして開発時のホットリロードでの再接続を防止
- インポートパスは `@/lib/generated/prisma/client`（`/client` まで必要）

### 6. .gitignore 追加

```gitignore
prisma/dev.db
prisma/dev.db-journal
lib/generated/
```

---

## API Routes のパターン

### 一覧取得 + 作成（`app/api/<resource>/route.ts`）

```typescript
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const items = await prisma.example.findMany({
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(items);
}

export async function POST(request: Request) {
  const body = await request.json();
  const item = await prisma.example.create({ data: body });
  return NextResponse.json(item, { status: 201 });
}
```

### 個別取得 + 更新 + 削除（`app/api/<resource>/[id]/route.ts`）

```typescript
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const item = await prisma.example.findUnique({ where: { id } });
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(item);
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const item = await prisma.example.update({ where: { id }, data: body });
  return NextResponse.json(item);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.example.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
```

**Next.js 16+ の注意:**

- `params` は `Promise` 型のため `await params` が必要

---

## Zustand ストアとの連携パターン

API 連携する Zustand ストアの基本構造:

```typescript
import { create } from "zustand";

interface ItemState {
  items: Item[];
  initialized: boolean;
  fetchItems: () => Promise<void>;
  addItem: (data: CreateInput) => Promise<Item>;
  updateItem: (id: string, data: UpdateInput) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
}

export const useItemStore = create<ItemState>()((set, get) => ({
  items: [],
  initialized: false,

  fetchItems: async () => {
    const res = await fetch("/api/items");
    const items = await res.json();
    set({ items, initialized: true });
  },

  addItem: async (data) => {
    const res = await fetch("/api/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const newItem = await res.json();
    set((s) => ({ items: [...s.items, newItem] }));
    return newItem;
  },

  // updateItem, deleteItem も同様のパターン
}));
```

**ポイント:**

- `persist` ミドルウェアは使用しない（DB が永続化を担当）
- `fetchItems()` で初期データをロード（`initialized` フラグで二重ロード防止）
- ミューテーション: API 呼び出し → 成功後にローカルストア更新

---

## DataInitializer パターン

`components/common/DataInitializer.tsx`:

```typescript
"use client";

import { useEffect } from "react";

export default function DataInitializer() {
  const fetchItems = useItemStore((s) => s.fetchItems);
  const initialized = useItemStore((s) => s.initialized);

  useEffect(() => {
    if (!initialized) fetchItems();
  }, [fetchItems, initialized]);

  return null;
}
```

`app/layout.tsx` の `<body>` 内に配置して全ページで利用可能にする。

---

## よく使うコマンド

| コマンド                               | 用途                               |
| -------------------------------------- | ---------------------------------- |
| `npx prisma generate`                  | クライアントコードの再生成         |
| `npx prisma db push`                   | スキーマを DB に即時反映（開発用） |
| `npx prisma migrate dev --name <name>` | マイグレーション作成・適用         |
| `npx prisma studio`                    | DB の GUI ブラウザ                 |
| `npx prisma format`                    | スキーマファイルのフォーマット     |

---

## 注意事項

- `lib/generated/` は `.gitignore` 対象 → clone 後に `npx prisma generate` が必要
- Prisma 7.x では `PrismaClient()` の引数なしコンストラクタは使えない（adapter 必須）
- `prisma/dev.db` はローカル開発用。本番では `.env` の `DATABASE_URL` を変更する
- DB 変更時（PostgreSQL 等へ移行）はアダプターとスキーマの `provider` を変更する
