// app/page.tsx
import Dashboard from "@/components/dashboard/Dashboard";
import { getCards } from "@/lib/cards";
import { auth } from "@/auth";

export default async function Page() {
  // サーバーでログインユーザー取得
  const session = await auth();
  if (!session?.user?.id) {
    // 未認証ならリダイレクトや空配列
    return <Dashboard initialCards={[]} />;
  }

  // Prisma でカード取得
  const cards = await getCards(session.user.id); // userId 必須
  const initialCards = cards.map((card) => ({
    ...card,
    createdAt: card.createdAt.toISOString(),
    updatedAt: card.updatedAt.toISOString(),
  }));
  return <Dashboard initialCards={initialCards} />;
}