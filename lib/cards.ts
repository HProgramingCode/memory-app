import { prisma } from "@/lib/prisma";
import { SRS_DEFAULTS, getTodayString } from "@/lib/srs";

export async function getCards(
  userId: string,
  deckId?: string | null,
) {
  return prisma.card.findMany({
    where: {
      userId,
      ...(deckId ? { deckId } : {}),
    },
    orderBy: { createdAt: "asc" },
  });
}

export async function createCard(params: {
  userId: string;
  deckId: string;
  frontText?: string;
  backText?: string;
  frontImageId?: string | null;
  backImageId?: string | null;
}) {
  const {
    userId,
    deckId,
    frontText = "",
    backText = "",
    frontImageId = null,
    backImageId = null,
  } = params;

  // デッキ所有権チェック（重要）
  const deck = await prisma.deck.findUnique({ where: { id: deckId } });
  if (!deck || deck.userId !== userId) {
    throw new Error("DECK_NOT_FOUND");
  }

  return prisma.card.create({
    data: {
      deckId,
      userId,
      frontText,
      backText,
      frontImageId,
      backImageId,
      nextReviewDate: getTodayString(),
      intervalDays: SRS_DEFAULTS.intervalDays,
      repetitionCount: SRS_DEFAULTS.repetitionCount,
      easeFactor: SRS_DEFAULTS.easeFactor,
    },
  });
}
