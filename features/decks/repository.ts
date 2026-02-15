import { prisma } from "@/lib/prisma";

export async function getDecks(userId: string) {
  return await prisma.deck.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
  });
}


export async function createDeck(name: string, userId: string) {
  return await prisma.deck.create({
    data: {
      name,
      userId,
    },
  });
}

export async function getDeck(id: string) {
  return await prisma.deck.findUnique({ where: { id } });
}

export async function updateDeck(id: string, name: string) {
  return await prisma.deck.update({
    where: { id },
    data: { name },
  });
}

export async function deleteDeck(id: string) {
  return await prisma.deck.delete({ where: { id } });
}