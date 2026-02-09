"use client";

import { useEffect } from "react";
import { useDeckStore } from "@/stores/useDeckStore";
import { useCardStore } from "@/stores/useCardStore";
import { useStudyStore } from "@/stores/useStudyStore";

/**
 * アプリ起動時にAPIからデータを取得するコンポーネント
 * layout.tsx に配置して全ページでデータを利用可能にする
 */
export default function DataInitializer() {
  const fetchDecks = useDeckStore((s) => s.fetchDecks);
  const deckInitialized = useDeckStore((s) => s.initialized);
  const fetchCards = useCardStore((s) => s.fetchCards);
  const cardInitialized = useCardStore((s) => s.initialized);
  const fetchRecords = useStudyStore((s) => s.fetchRecords);
  const studyInitialized = useStudyStore((s) => s.initialized);

  useEffect(() => {
    if (!deckInitialized) fetchDecks();
    if (!cardInitialized) fetchCards();
    if (!studyInitialized) fetchRecords();
  }, [
    fetchDecks,
    deckInitialized,
    fetchCards,
    cardInitialized,
    fetchRecords,
    studyInitialized,
  ]);

  return null;
}
