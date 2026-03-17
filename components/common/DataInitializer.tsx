"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useCardStore } from "@/stores/useCardStore";
import { useDeckStore } from "@/stores/useDeckStore";
import { useStudyStore } from "@/stores/useStudyStore";
import type { Card, Deck, StudyRecord } from "@/types";

/**
 * 認証済みユーザーがアクセスしたときに API からカード・デッキ・学習記録を取得し、
 * ストアに反映する。直接 /review 等にアクセスした場合でもデータが揃う。
 */
export default function DataInitializer() {
  const { status } = useSession();
  const didFetch = useRef(false);

  const replaceCards = useCardStore((s) => s.replaceAll);
  const replaceDecks = useDeckStore((s) => s.replaceAll);
  const replaceStudyRecords = useStudyStore((s) => s.replaceAll);

  useEffect(() => {
    if (status !== "authenticated" || didFetch.current) return;

    let cancelled = false;
    didFetch.current = true;

    (async () => {
      try {
        const [cardsRes, decksRes, recordsRes] = await Promise.all([
          fetch("/api/cards"),
          fetch("/api/decks"),
          fetch("/api/study-records"),
        ]);

        if (cancelled) return;
        if (!cardsRes.ok || !decksRes.ok || !recordsRes.ok) return;

        const cards: Card[] = await cardsRes.json();
        const decks: Deck[] = await decksRes.json();
        const records: StudyRecord[] = await recordsRes.json();

        if (cancelled) return;
        replaceCards(cards);
        replaceDecks(decks);
        replaceStudyRecords(records);
      } catch {
        didFetch.current = false;
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [status, replaceCards, replaceDecks, replaceStudyRecords]);

  return null;
}
