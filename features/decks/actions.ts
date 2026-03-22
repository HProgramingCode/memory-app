import { prisma } from "@/lib/prisma";
import { getDeck } from "./repository";
import { getCardsByDeckId, createCardBatch } from "../cards/repository";
import type { Card } from "@/types";

export async function exportDeck(userId: string, deckId: string) {
  const deck = await getDeck(deckId);
  if (!deck || deck.userId !== userId) {
    return null;
  }

  const cards = await getCardsByDeckId(userId, deckId);

  const serializedDeck = {
    id: deck.id,
    name: deck.name,
    createdAt: deck.createdAt.toISOString(),
    updatedAt: deck.updatedAt.toISOString(),
  };

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

  return {
    deck: serializedDeck,
    cards: serializedCards,
  };
}

export async function importDeckCards(
  userId: string,
  deckId: string,
  cards: Card[]
) {
  const deck = await getDeck(deckId);
  if (!deck || deck.userId !== userId) {
    return { success: false, error: "DECK_NOT_FOUND" };
  }

  const existingCards = await getCardsByDeckId(userId, deckId);
  const existingIds = new Set(existingCards.map((card) => card.id));

  const newCards = cards.filter((card) => !existingIds.has(card.id));
  if (newCards.length === 0) {
    return { success: true };
  }

  await prisma.$transaction(async (tx) => {
    const cardData = newCards.map((card) => ({
      id: card.id,
      deckId,
      userId,
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
    }));

    await createCardBatch(cardData, tx);
  });

  return { success: true };
}
