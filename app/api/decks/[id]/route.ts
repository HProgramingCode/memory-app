import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

import { auth } from "@/auth";

/** GET /api/decks/:id - デッキ取得 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const deck = await prisma.deck.findUnique({
    where: { id },
  });

  if (!deck || deck.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(deck);
}

/** PUT /api/decks/:id - デッキ更新 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const { name } = await request.json();
  if (!name || typeof name !== "string") {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }

  // 存在確認と権限チェック
  const existing = await prisma.deck.findUnique({ where: { id } });
  if (!existing || existing.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const deck = await prisma.deck.update({
    where: { id },
    data: { name: name.trim() },
  });
  return NextResponse.json(deck);
}

/** DELETE /api/decks/:id - デッキ削除（カードも連鎖削除） */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;

  // 存在確認と権限チェック
  const existing = await prisma.deck.findUnique({ where: { id } });
  if (!existing || existing.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.deck.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
