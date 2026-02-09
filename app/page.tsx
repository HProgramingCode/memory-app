"use client";

import { Box, Grid, Divider } from "@mui/material";
import AppLayout from "@/components/common/AppLayout";
import TodayReviewCard from "@/components/dashboard/TodayReviewCard";
import StudySummaryCard from "@/components/dashboard/StudySummaryCard";
import MasteryChart from "@/components/dashboard/MasteryChart";
import TodayMasteryCard from "@/components/dashboard/TodayMasteryCard";
import DeckList from "@/components/dashboard/DeckList";
import { useCardStore } from "@/stores/useCardStore";
import { useStudyStore } from "@/stores/useStudyStore";

/**
 * トップページ / ダッシュボード
 */
export default function DashboardPage() {
  const cards = useCardStore((s) => s.cards);
  const getDueCards = useCardStore((s) => s.getDueCards);
  const getStreak = useStudyStore((s) => s.getStreak);
  const getTodayTotalStudyCount = useStudyStore((s) => s.getTodayTotalStudyCount);
  const getTodayRecord = useStudyStore((s) => s.getTodayRecord);

  const dueCards = getDueCards();
  const streak = getStreak();
  const todayTotal = getTodayTotalStudyCount();
  const todayRecord = getTodayRecord();

  return (
    <AppLayout>
      {/* サマリーエリア */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <TodayReviewCard dueCount={dueCards.length} />
        </Grid>
        <Grid item xs={12} md={6}>
          <StudySummaryCard
            totalCards={cards.length}
            streak={streak}
            todayStudyCount={todayTotal}
          />
        </Grid>
      </Grid>

      {/* 定着度 */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <MasteryChart cards={cards} />
        </Grid>
        <Grid item xs={12} md={6}>
          <TodayMasteryCard record={todayRecord} />
        </Grid>
      </Grid>

      <Divider sx={{ mb: 3 }} />

      {/* デッキ一覧 */}
      <DeckList />
    </AppLayout>
  );
}
