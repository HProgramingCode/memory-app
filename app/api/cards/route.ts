import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { SRS_DEFAULTS, getTodayString } from "@/lib/srs";

/** GET /api/cards - 全カード取得（deckId でフィルタ可能） */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const deckId = searchParams.get("deckId");

  const cards = await prisma.card.findMany({
    where: deckId ? { deckId } : undefined,
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(cards);
}

/** POST /api/cards - カード作成 */
export async function POST(request: Request) {
  const body = await request.json();
  const { deckId, frontText, backText, frontImageId, backImageId } = body;

  if (!deckId) {
    return NextResponse.json({ error: "deckId is required" }, { status: 400 });
  }

  const card = await prisma.card.create({
    data: {
      deckId,
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
