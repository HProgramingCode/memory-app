import { NextResponse } from "next/server";
import { getTodayString } from "@/lib/srs";
import type { ReviewRating } from "@/types";
import { auth } from "@/auth";
import { getStudyRecords } from "@/features/studyRate/repository";
import { recordFreeStudy, recordReview } from "@/features/studyRate/action";

/** GET /api/study-records - 全学習記録取得 */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const records = await getStudyRecords(session.user.id);
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
    const record = await recordFreeStudy(session.user.id, today);
    return NextResponse.json(record);
  }

  // 今日の復習: reviewedCount + 評価別カウントを増加
  if (!rating) {
    return NextResponse.json({ error: "rating is required" }, { status: 400 });
  }

  const record = await recordReview(session.user.id, today, rating);

  return NextResponse.json(record);
}
