import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTodayString } from "@/lib/srs";

/** GET /api/study-records - 全学習記録取得 */
export async function GET() {
  const records = await prisma.studyRecord.findMany({
    orderBy: { date: "asc" },
  });
  return NextResponse.json(records);
}

/** POST /api/study-records/review - 今日の復習を1枚記録 */
export async function POST() {
  const today = getTodayString();

  const record = await prisma.studyRecord.upsert({
    where: { date: today },
    update: { reviewedCount: { increment: 1 } },
    create: { date: today, reviewedCount: 1 },
  });

  return NextResponse.json(record);
}
