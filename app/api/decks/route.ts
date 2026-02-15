import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getDecks, createDeck } from "@/features/decks/repository";

/** GET /api/decks - 全デッキ取得 */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const decks = await getDecks(session.user.id);
  return NextResponse.json(decks);
}

/** POST /api/decks - デッキ作成 */
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name } = await request.json();
  if (!name || typeof name !== "string") {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }
  const trimmedName = name.trim();
  const deck = await createDeck(trimmedName, session.user.id);
  return NextResponse.json(deck, { status: 201 });
}
