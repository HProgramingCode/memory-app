import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { createReview } from "@/features/reviews/repository";

/** POST /api/reviews - ログインユーザーによるレビュー投稿 */
export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  const { message } = (await request.json()) as { message?: string };
  if (!message || typeof message !== "string" || message.trim().length === 0) {
    return NextResponse.json(
      { error: "message is required" },
      { status: 400 }
    );
  }

  const review = await createReview(userId, message.trim());

  return NextResponse.json({ id: review.id }, { status: 201 });
}

