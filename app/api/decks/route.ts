import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/** GET /api/decks - 全デッキ取得 */
export async function GET() {
  const decks = await prisma.deck.findMany({
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(decks);
}

/** POST /api/decks - デッキ作成 */
export async function POST(request: Request) {
  const { name } = await request.json();
  if (!name || typeof name !== "string") {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }
  const deck = await prisma.deck.create({
    data: { name: name.trim() },
  });
  return NextResponse.json(deck, { status: 201 });
}
