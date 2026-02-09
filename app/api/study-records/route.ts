import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTodayString } from "@/lib/srs";
import type { ReviewRating } from "@/types";
import { auth } from "@/auth";

/** GET /api/study-records - 全学習記録取得 */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const records = await prisma.studyRecord.findMany({
    where: { userId: session.user.id },
    orderBy: { date: "asc" },
  });
  return NextResponse.json(records);
}

/**
 * POST /api/study-records - 学習を1枚記録
 * body: { mode?: "free", rating?: ReviewRating }
 *   - mode="free": 自由学習カウントを増加
 *   - mode 未指定: 今日の復習カウント + rating に応じた評価カウントを増加
 */
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const today = getTodayString();
  const body = await request.json().catch(() => ({}));
  const mode: string | undefined = body.mode;
  const rating: ReviewRating | undefined = body.rating;

  if (mode === "free") {
    // 自由学習: freeStudyCount のみ増加
    const record = await prisma.studyRecord.upsert({
      where: {
        userId_date: {
          userId: session.user.id,
          date: today,
        },
      },
      update: { freeStudyCount: { increment: 1 } },
      create: {
        userId: session.user.id,
        date: today,
        freeStudyCount: 1,
      },
    });
    return NextResponse.json(record);
  }

  // 今日の復習: reviewedCount + 評価別カウントを増加
  const ratingUpdate: Record<string, { increment: number }> = {};
  if (rating === "again") ratingUpdate.againCount = { increment: 1 };
  else if (rating === "hard") ratingUpdate.hardCount = { increment: 1 };
  else if (rating === "good") ratingUpdate.goodCount = { increment: 1 };

  const record = await prisma.studyRecord.upsert({
    where: {
      userId_date: {
        userId: session.user.id,
        date: today,
      },
    },
    update: {
      reviewedCount: { increment: 1 },
      ...ratingUpdate,
    },
    create: {
      userId: session.user.id,
      date: today,
      reviewedCount: 1,
      ...(rating === "again" ? { againCount: 1 } : {}),
      ...(rating === "hard" ? { hardCount: 1 } : {}),
      ...(rating === "good" ? { goodCount: 1 } : {}),
    },
  });

  return NextResponse.json(record);
}
