import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/** GET /api/export - 全データをJSON形式でエクスポート */
export async function GET() {
  const [decks, cards, studyRecords] = await Promise.all([
    prisma.deck.findMany({ orderBy: { createdAt: "asc" } }),
    prisma.card.findMany({ orderBy: { createdAt: "asc" } }),
    prisma.studyRecord.findMany({ orderBy: { date: "asc" } }),
  ]);

  // クライアント側の型に合わせてシリアライズ
  const serializedDecks = decks.map((d) => ({
    id: d.id,
    name: d.name,
    createdAt: d.createdAt.toISOString(),
    updatedAt: d.updatedAt.toISOString(),
  }));

  const serializedCards = cards.map((c) => ({
    id: c.id,
    deckId: c.deckId,
    frontText: c.frontText,
    backText: c.backText,
    frontImageId: c.frontImageId,
    backImageId: c.backImageId,
    nextReviewDate: c.nextReviewDate,
    intervalDays: c.intervalDays,
    repetitionCount: c.repetitionCount,
    easeFactor: c.easeFactor,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
  }));

  const serializedRecords = studyRecords.map((r) => ({
    date: r.date,
    reviewedCount: r.reviewedCount,
    freeStudyCount: r.freeStudyCount,
    againCount: r.againCount,
    hardCount: r.hardCount,
    goodCount: r.goodCount,
  }));

  return NextResponse.json({
    decks: serializedDecks,
    cards: serializedCards,
    studyRecords: serializedRecords,
  });
}
