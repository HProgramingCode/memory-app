import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/** GET /api/decks/:id - デッキ取得 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const deck = await prisma.deck.findUnique({ where: { id } });
  if (!deck) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(deck);
}

/** PUT /api/decks/:id - デッキ更新 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { name } = await request.json();
  if (!name || typeof name !== "string") {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
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
  const { id } = await params;
  await prisma.deck.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
