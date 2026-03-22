import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/lib/generated/prisma/client";

export function getCards(userId: string, deckId?: string | null) {
  return prisma.card.findMany({
    where: {
      userId,
      ...(deckId ? { deckId } : {}),
    },
    orderBy: { createdAt: "asc" },
  });
}

export function getCardById(id: string) {
  return prisma.card.findUnique({
    where: { id },
  });
}

export function createCardRaw(data: Prisma.CardUncheckedCreateInput) {
  return prisma.card.create({
    data,
  });
}

export function updateCard(id: string, data: Prisma.CardUncheckedUpdateInput) {
  return prisma.card.update({
    where: { id },
    data,
  });
}

export function deleteCard(id: string) {
  return prisma.card.delete({
    where: { id },
  });
}

export function getCardsByDeckId(userId: string, deckId: string) {
  return prisma.card.findMany({
    where: { userId, deckId },
    orderBy: { createdAt: "asc" },
  });
}

export function deleteCardsByDeckId(
  userId: string,
  deckId: string,
  tx?: Parameters<Parameters<typeof prisma.$transaction>[0]>[0],
) {
  const client = tx ?? prisma;
  return client.card.deleteMany({
    where: { userId, deckId },
  });
}

export function createCardBatch(
  cards: Prisma.CardUncheckedCreateInput[],
  tx?: Parameters<Parameters<typeof prisma.$transaction>[0]>[0],
) {
  const client = tx ?? prisma;
  return Promise.all(cards.map((data) => client.card.create({ data })));
}
