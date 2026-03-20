"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useCardStore } from "@/stores/useCardStore";
import { useDeckStore } from "@/stores/useDeckStore";
import { useStudyStore } from "@/stores/useStudyStore";
import type { Card, Deck, StudyRecord } from "@/types";

const MAX_ATTEMPTS = 3;
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * 認証済みユーザーがアクセスしたときに API からカード・デッキ・学習記録を取得し、
 * ストアに反映する。直接 /review 等にアクセスした場合でもデータが揃う。
 *
 * `useRef` で「一度だけ取得」を止めると、React 18 Strict Mode の再マウント後に
 * フェッチがスキップされる。また API が一瞬失敗したときに再試行できないため、
 * 短いリトライのみ行う。
 */
export default function DataInitializer() {
  const { status } = useSession();

  const replaceCards = useCardStore((s) => s.replaceAll);
  const replaceDecks = useDeckStore((s) => s.replaceAll);
  const replaceStudyRecords = useStudyStore((s) => s.replaceAll);

  useEffect(() => {
    if (status !== "authenticated") return;

    let cancelled = false;

    (async () => {
      for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
        if (cancelled) return;
        try {
          const [cardsRes, decksRes, recordsRes] = await Promise.all([
            fetch("/api/cards"),
            fetch("/api/decks"),
            fetch("/api/study-records"),
          ]);

          if (cancelled) return;

          if (cardsRes.ok && decksRes.ok && recordsRes.ok) {
            const cards: Card[] = await cardsRes.json();
            const decks: Deck[] = await decksRes.json();
            const records: StudyRecord[] = await recordsRes.json();

            if (cancelled) return;
            replaceCards(cards);
            replaceDecks(decks);
            replaceStudyRecords(records);
            return;
          }
        } catch {
          /* 次の試行へ */
        }

        if (cancelled) return;
        await delay(200 * (attempt + 1));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [status, replaceCards, replaceDecks, replaceStudyRecords]);

  return null;
}
