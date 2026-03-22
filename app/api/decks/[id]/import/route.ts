import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { importDeckCards } from "@/features/decks/actions";
import type { Card } from "@/types";

type ImportBody = {
  cards: Card[];
};

/** POST /api/decks/:id/import - デッキ単位インポート（既存カードを残したまま新規カードを追加） */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;

  const body = (await request.json()) as ImportBody;
  const cards = body.cards ?? [];

  const result = await importDeckCards(session.user.id, id, cards);
  if (!result.success) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}

