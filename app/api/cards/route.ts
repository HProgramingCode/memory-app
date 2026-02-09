import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { SRS_DEFAULTS, getTodayString } from "@/lib/srs";
import { auth } from "@/auth";

/** GET /api/cards - 全カード取得（deckId でフィルタ可能） */
export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const deckId = searchParams.get("deckId");

  const cards = await prisma.card.findMany({
    where: {
      userId: session.user.id,
      ...(deckId ? { deckId } : {}),
    },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(cards);
}

/** POST /api/cards - カード作成 */
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { deckId, frontText, backText, frontImageId, backImageId } = body;

  if (!deckId) {
    return NextResponse.json({ error: "deckId is required" }, { status: 400 });
  }

  // デッキの所有権確認
  const deck = await prisma.deck.findUnique({ where: { id: deckId } });
  if (!deck || deck.userId !== session.user.id) {
    return NextResponse.json({ error: "Deck not found" }, { status: 404 });
  }

  const card = await prisma.card.create({
    data: {
      deckId,
      userId: session.user.id,
      frontText: frontText ?? "",
      backText: backText ?? "",
      frontImageId: frontImageId ?? null,
      backImageId: backImageId ?? null,
      nextReviewDate: getTodayString(),
      intervalDays: SRS_DEFAULTS.intervalDays,
      repetitionCount: SRS_DEFAULTS.repetitionCount,
      easeFactor: SRS_DEFAULTS.easeFactor,
    },
  });
  return NextResponse.json(card, { status: 201 });
}
