import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  const env = process.env.ADMIN_EMAILS;
  if (!env) return false;
  const list = env
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
  return list.includes(email);
}

/** GET /api/admin/reviews - 管理者のみレビュー一覧取得 */
export async function GET() {
  const session = await auth();
  const email = session?.user?.email ?? null;
  if (!session?.user?.id || !isAdminEmail(email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const reviews = await prisma.review.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  const serialized = reviews.map((r) => ({
    id: r.id,
    message: r.message,
    createdAt: r.createdAt.toISOString(),
    user: {
      id: r.user.id,
      name: r.user.name,
      email: r.user.email,
    },
  }));

  return NextResponse.json(serialized);
}

