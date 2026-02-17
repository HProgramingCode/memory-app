"use client";

import { useCardStore } from "@/stores/useCardStore";
import { useStudyStore } from "@/stores/useStudyStore";
import AppLayout from "@/components/common/AppLayout";
import DeckList from "@/components/dashboard/DeckList";
import DailyStudyChart from "@/components/dashboard/DailyStudyChart";
import TodayReviewCard from "@/components/dashboard/TodayReviewCard";
import StudySummaryCard from "@/components/dashboard/StudySummaryCard";
import MasteryChart from "@/components/dashboard/MasteryChart";
import { Divider, Box, Stack } from "@mui/material";
import { useEffect } from "react";
import { Card, Deck, StudyRecord } from "@/types";
import { useDeckStore } from "@/stores/useDeckStore";

/**
 * ダッシュボード
 *
 * レイアウト優先順位:
 * 1. Hero CTA — 今日の復習（最重要アクション）
 * 2. Stats Row — 3つの数値を横並びで俯瞰
 * 3. Charts — 定着度 + 学習推移をグリッドで
 * 4. Deck List — コンテンツ管理
 */
export default function DashboardPage({
  initialCards,
  initialDecks,
  initialStudyRecords,
}: {
  initialCards: Card[];
  initialDecks: Deck[];
  initialStudyRecords: StudyRecord[];
}) {
  const { cards, getDueCards, replaceAll } = useCardStore();
  const {
    getStreak,
    getTodayRecord,
    replaceAll: replaceStudyRecords,
  } = useStudyStore();
  const { replaceAll: replaceDecks } = useDeckStore();

  useEffect(() => {
    replaceAll(initialCards);
  }, [initialCards, replaceAll]);

  useEffect(() => {
    replaceDecks(initialDecks);
  }, [initialDecks, replaceDecks]);

  useEffect(() => {
    replaceStudyRecords(initialStudyRecords);
  }, [initialStudyRecords, replaceStudyRecords]);

  const dueCards = getDueCards();
  const streak = getStreak();
  const todayRecord = getTodayRecord();
  const todayStudyCount =
    (todayRecord?.reviewedCount || 0) + (todayRecord?.freeStudyCount || 0);

  return (
    <AppLayout>
      <Stack spacing={3}>
        {/* ① Hero CTA — 最初に「今日やること」 */}
        <Box sx={{ animation: "fadeInUp 0.3s ease-out" }}>
          <TodayReviewCard dueCount={dueCards.length} />
        </Box>

        {/* ② Stats Row — 俯瞰的サマリー */}
        <Box sx={{ animation: "fadeInUp 0.3s ease-out 0.1s both" }}>
          <StudySummaryCard
            totalCards={cards.length}
            streak={streak}
            todayStudyCount={todayStudyCount}
          />
        </Box>

        {/* ③ Charts — 定着度 + 学習推移 */}
        <Box
          sx={{
            display: "flex",
            gap: 3,
            flexDirection: { xs: "column", md: "row" },
            animation: "fadeInUp 0.3s ease-out 0.2s both",
          }}
        >
          <Box sx={{ flex: { xs: "1 1 auto", md: "0 0 calc(41.66% - 12px)" } }}>
            <MasteryChart cards={cards} />
          </Box>
          <Box sx={{ flex: { xs: "1 1 auto", md: "1 1 0" } }}>
            <DailyStudyChart />
          </Box>
        </Box>

        {/* ④ Deck List — コンテンツ管理 */}
        <Divider sx={{ my: 0.5 }} />
        <Box sx={{ animation: "fadeInUp 0.3s ease-out 0.3s both" }}>
          <DeckList />
        </Box>
      </Stack>
    </AppLayout>
  );
}
