import { prisma } from "@/lib/prisma";
import { createCardRaw } from "./repository";
import { SRS_DEFAULTS, getTodayString } from "@/lib/srs";

export async function createCard({
  userId,
  deckId,
  frontText = "",
  backText = "",
  frontImageId = null,
  backImageId = null,
}: {
  userId: string;
  deckId: string;
  frontText?: string;
  backText?: string;
  frontImageId?: string | null;
  backImageId?: string | null;
}) {
  const deck = await prisma.deck.findUnique({
    where: { id: deckId },
  });
  if (!deck || deck.userId !== userId) {
    throw new Error("DECK_NOT_FOUND");
  }

  return createCardRaw({
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
  });
}
