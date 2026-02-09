"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { Typography } from "@mui/material";
import AppLayout from "@/components/common/AppLayout";
import CardForm from "@/components/card/CardForm";
import EmptyState from "@/components/common/EmptyState";
import { useCardStore } from "@/stores/useCardStore";

/**
 * カード編集ページ
 */
export default function EditCardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const getCard = useCardStore((s) => s.getCard);
  const card = getCard(id);

  if (!card) {
    return (
      <AppLayout>
        <EmptyState title="カードが見つかりません" />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Typography variant="h5" sx={{ mb: 3 }}>
        カードの編集
      </Typography>
      <CardForm
        existingCard={card}
        onSaved={() => router.push(`/decks/${card.deckId}`)}
        onCancel={() => router.back()}
      />
    </AppLayout>
  );
}
