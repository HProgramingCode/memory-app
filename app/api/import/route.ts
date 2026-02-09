import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { Deck, Card, StudyRecord } from "@/types";

/** POST /api/import - 全データをインポート（既存データは完全置換） */
export async function POST(request: Request) {
  const body = await request.json();
  const { decks, cards, studyRecords } = body as {
    decks: Deck[];
    cards: Card[];
    studyRecords: StudyRecord[];
  };

  // トランザクションで全データを置換
  await prisma.$transaction(async (tx) => {
    // 既存データ削除（Card は Deck の cascadeDelete で消えるが、明示的に削除）
    await tx.card.deleteMany();
    await tx.deck.deleteMany();
    await tx.studyRecord.deleteMany();

    // デッキをインサート
    for (const deck of decks) {
      await tx.deck.create({
        data: {
          id: deck.id,
          name: deck.name,
          createdAt: new Date(deck.createdAt),
          updatedAt: new Date(deck.updatedAt),
        },
      });
    }

    // カードをインサート
    for (const card of cards) {
      await tx.card.create({
        data: {
          id: card.id,
          deckId: card.deckId,
          frontText: card.frontText,
          backText: card.backText,
          frontImageId: card.frontImageId,
          backImageId: card.backImageId,
          nextReviewDate: card.nextReviewDate,
          intervalDays: card.intervalDays,
          repetitionCount: card.repetitionCount,
          easeFactor: card.easeFactor,
          createdAt: new Date(card.createdAt),
          updatedAt: new Date(card.updatedAt),
        },
      });
    }

    // 学習記録をインサート
    for (const record of studyRecords) {
      await tx.studyRecord.create({
        data: {
          date: record.date,
          reviewedCount: record.reviewedCount,
        },
      });
    }
  });

  return NextResponse.json({ success: true });
}
