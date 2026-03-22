import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { exportDeck } from "@/features/decks/actions";

/** GET /api/decks/:id/export - デッキ単位エクスポート用データ取得（テキストデータのみ） */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;

  const result = await exportDeck(session.user.id, id);
  if (!result) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(result);
}

