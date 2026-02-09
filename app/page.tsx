"use client";

import { useCardStore } from "@/stores/useCardStore";
import { useStudyStore } from "@/stores/useStudyStore";
import AppLayout from "@/components/common/AppLayout";
import DeckList from "@/components/dashboard/DeckList";
import DailyStudyChart from "@/components/dashboard/DailyStudyChart";
import TodayReviewCard from "@/components/dashboard/TodayReviewCard";
import StudySummaryCard from "@/components/dashboard/StudySummaryCard";
import MasteryChart from "@/components/dashboard/MasteryChart";
import { Grid, Divider, Typography, Box, Stack } from "@mui/material";

export default function DashboardPage() {
  const { cards, getDueCards } = useCardStore();
  const { getStreak, getTodayRecord } = useStudyStore();

  const dueCards = getDueCards();
  const streak = getStreak();
  const todayRecord = getTodayRecord();
  const todayStudyCount = (todayRecord?.reviewedCount || 0) + (todayRecord?.freeStudyCount || 0);

  return (
    <AppLayout>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700, color: "text.primary" }}>
          ダッシュボード
        </Typography>
        <Typography variant="body2" color="text.secondary">
          今日の学習状況を確認しましょう
        </Typography>
      </Box>

      {/* メイングリッドエリア */}
      <Grid container spacing={3}>
        {/* 左カラム: アクション & サマリー */}
        <Grid item xs={12} lg={4}>
          <Stack spacing={3}>
            <TodayReviewCard dueCount={dueCards.length} />
            <StudySummaryCard
              totalCards={cards.length}
              streak={streak}
              todayStudyCount={todayStudyCount}
            />
          </Stack>
        </Grid>

        {/* 右カラム: 統計・グラフエリア */}
        <Grid item xs={12} lg={8}>
          <Grid container spacing={3}>
            {/* 定着度（ドーナツグラフ） */}
            <Grid item xs={12} md={5}>
              <MasteryChart cards={cards} />
            </Grid>
            {/* 学習履歴（棒グラフ） */}
            <Grid item xs={12} md={7}>
              <DailyStudyChart />
            </Grid>
            {/* デッキ一覧をグラフの下に配置 */}
            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <Box sx={{ mt: 2 }}>
                <DeckList />
              </Box>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </AppLayout>
  );
}
