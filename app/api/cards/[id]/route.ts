import { NextResponse } from "next/server";
import { getDeck } from "@/features/decks/repository";
import { auth } from "@/auth";
import { getCardById, deleteCard, updateCard } from "@/features/cards/repository";
import type { Prisma } from "@/lib/generated/prisma/client";


/** GET /api/cards/:id - カード取得 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const card = await getCardById(id);

  if (!card || card.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(card);
}

/** PUT /api/cards/:id - カード更新 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const body = await request.json();
  const { frontText, backText, frontImageId, backImageId, deckId } = body;

  // 存在確認と権限チェック
  const existing = await getCardById(id);
  if (!existing || existing.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const data: Prisma.CardUncheckedUpdateInput = {};
  if (frontText !== undefined) data.frontText = frontText;
  if (backText !== undefined) data.backText = backText;
  if (frontImageId !== undefined) data.frontImageId = frontImageId;
  if (backImageId !== undefined) data.backImageId = backImageId;
  if (deckId !== undefined) {
    // デッキ移動の場合は移動先デッキの権限も確認
    const newDeck = await getDeck(deckId);
    if (!newDeck || newDeck.userId !== session.user.id) {
      return NextResponse.json({ error: "Target deck not found" }, { status: 404 });
    }
    data.deckId = deckId;
  }

  const card = await updateCard(id, data);
  return NextResponse.json(card);
}

/** DELETE /api/cards/:id - カード削除 */
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
  const existing = await getCardById(id);
  if (!existing || existing.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await deleteCard(id);
  return NextResponse.json({ success: true });
}
