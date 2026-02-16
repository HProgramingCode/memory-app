import { NextResponse } from "next/server";
import { calculateNextReview } from "@/lib/srs";
import type { Card, ReviewRating } from "@/types";
import { auth } from "@/auth";
import { getCardById } from "@/features/cards/repository";
import { updateCard } from "@/features/cards/repository";

/** POST /api/cards/:id/review - 復習結果を反映 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { rating } = await request.json();

  if (!["again", "hard", "good"].includes(rating)) {
    return NextResponse.json({ error: "Invalid rating" }, { status: 400 });
  }

  // 存在確認と権限チェック
  const existing = await getCardById(id);
  if (!existing || existing.userId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // SRS計算（既存の型に合わせてマッピング）
  const cardForSrs: Card = {
    ...existing,
    frontImageId: existing.frontImageId ?? null,
    backImageId: existing.backImageId ?? null,
    createdAt: existing.createdAt.toISOString(),
    updatedAt: existing.updatedAt.toISOString(),
  };

  const srsUpdate = calculateNextReview(cardForSrs, rating as ReviewRating);

  const card = await updateCard(id, {
    nextReviewDate: srsUpdate.nextReviewDate,
    intervalDays: srsUpdate.intervalDays,
    repetitionCount: srsUpdate.repetitionCount,
    easeFactor: srsUpdate.easeFactor,
  });
  return NextResponse.json(card);
}
