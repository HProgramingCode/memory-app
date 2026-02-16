import { prisma } from "@/lib/prisma";

export async function getStudyRecords(userId: string) {
  return await prisma.studyRecord.findMany({
    where: { userId },
    orderBy: { date: "asc" },
  });
}

export function upsertStudyRecordRepo(userId: string, date: string) {
  return prisma.studyRecord.upsert({
    where: {
      userId_date: { userId, date },
    },
    update: {
      freeStudyCount: { increment: 1 },
    },
    create: {
      userId,
      date,
      freeStudyCount: 1,
    },
  });
}

type ReviewIncrement = {
  reviewedCount: number;
  againCount?: number;
  hardCount?: number;
  goodCount?: number;
};

export function upsertStudyRecordReviewRepo(
  userId: string,
  date: string,
  inc: ReviewIncrement
) {
  return prisma.studyRecord.upsert({
    where: {
      userId_date: {
        userId,
        date,
      },
    },
    update: {
      reviewedCount: { increment: inc.reviewedCount },
      ...(inc.againCount && { againCount: { increment: inc.againCount } }),
      ...(inc.hardCount && { hardCount: { increment: inc.hardCount } }),
      ...(inc.goodCount && { goodCount: { increment: inc.goodCount } }),
    },
    create: {
      userId,
      date,
      reviewedCount: inc.reviewedCount,
      againCount: inc.againCount ?? 0,
      hardCount: inc.hardCount ?? 0,
      goodCount: inc.goodCount ?? 0,
    },
  });
}
