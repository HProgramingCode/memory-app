"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Typography } from "@mui/material";
import AppLayout from "@/components/common/AppLayout";
import CardForm from "@/components/card/CardForm";

function NewCardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const deckId = searchParams.get("deckId") ?? undefined;

  return (
    <AppLayout>
      <Typography variant="h5" sx={{ mb: 3 }}>
        カードの登録
      </Typography>
      <CardForm
        defaultDeckId={deckId}
        onSaved={() => {
          if (deckId) {
            router.push(`/decks/${deckId}`);
          } else {
            router.push("/");
          }
        }}
        onCancel={() => router.back()}
      />
    </AppLayout>
  );
}

/**
 * カード新規登録ページ
 */
export default function NewCardPage() {
  return (
    <Suspense>
      <NewCardContent />
    </Suspense>
  );
}
