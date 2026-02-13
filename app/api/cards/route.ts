import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getCards, createCard } from "@/lib/cards";

/** GET /api/cards - 全カード取得（deckId でフィルタ可能） */
export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const deckId = searchParams.get("deckId");

  const cards = await getCards(session.user.id, deckId);
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

  try {
    const card = await createCard({
      userId: session.user.id,
      deckId,
      frontText,
      backText,
      frontImageId,
      backImageId,
    });

    return NextResponse.json(card, { status: 201 });
  } catch (e) {
    if (e instanceof Error && e.message === "DECK_NOT_FOUND") {
      return NextResponse.json({ error: "Deck not found" }, { status: 404 });
    }
    throw e;
  }
}