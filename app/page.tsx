// app/page.tsx
import Dashboard from "@/components/dashboard/Dashboard";
import { getCards } from "@/features/cards/repository";
import { getDecks } from "@/features/decks/repository";
import { auth } from "@/auth";

export default async function Page() {
  // サーバーでログインユーザー取得
  const session = await auth();
  if (!session?.user?.id) {
    // 未認証ならリダイレクトや空配列
    return <Dashboard initialCards={[]} initialDecks={[]} />;
  }

  // Prisma でカード取得
  const cards = await getCards(session.user.id); // userId 必須
  const initialCards = cards.map((card) => ({
    ...card,
    createdAt: card.createdAt.toISOString(),
    updatedAt: card.updatedAt.toISOString(),
  }));
  const decks = await getDecks(session.user.id);
  const initialDecks = decks.map((deck) => ({
    ...deck,
    createdAt: deck.createdAt.toISOString(),
    updatedAt: deck.updatedAt.toISOString(),
  }));
  return (
    <Dashboard
      initialCards={initialCards}
      initialDecks={initialDecks}
    />
  );
}