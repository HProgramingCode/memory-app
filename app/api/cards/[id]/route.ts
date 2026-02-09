import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/** GET /api/cards/:id - カード取得 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const card = await prisma.card.findUnique({ where: { id } });
  if (!card) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(card);
}

/** PUT /api/cards/:id - カード更新 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const { frontText, backText, frontImageId, backImageId, deckId } = body;

  const data: Record<string, unknown> = {};
  if (frontText !== undefined) data.frontText = frontText;
  if (backText !== undefined) data.backText = backText;
  if (frontImageId !== undefined) data.frontImageId = frontImageId;
  if (backImageId !== undefined) data.backImageId = backImageId;
  if (deckId !== undefined) data.deckId = deckId;

  const card = await prisma.card.update({
    where: { id },
    data,
  });
  return NextResponse.json(card);
}

/** DELETE /api/cards/:id - カード削除 */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await prisma.card.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
