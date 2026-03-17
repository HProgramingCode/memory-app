import { prisma } from "@/lib/prisma";

export function createReview(userId: string, message: string) {
  return prisma.review.create({
    data: {
      userId,
      message,
    },
  });
}

