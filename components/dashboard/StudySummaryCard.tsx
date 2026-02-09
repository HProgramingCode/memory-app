"use client";

import { Card, CardContent, Typography, Box, Stack } from "@mui/material";
import StyleIcon from "@mui/icons-material/Style";
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import MenuBookIcon from "@mui/icons-material/MenuBook";

interface StudySummaryCardProps {
  totalCards: number;
  streak: number;
  todayStudyCount: number;
}

/**
 * 学習サマリーセクション
 */
export default function StudySummaryCard({
  totalCards,
  streak,
  todayStudyCount,
}: StudySummaryCardProps) {
  return (
    <Card sx={{ height: "100%" }}>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          学習サマリー
        </Typography>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <StyleIcon color="primary" />
            <Box>
              <Typography variant="body2" color="text.secondary">
                総カード数
              </Typography>
              <Typography variant="h6">{totalCards} 枚</Typography>
            </Box>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <MenuBookIcon color="secondary" />
            <Box>
              <Typography variant="body2" color="text.secondary">
                今日の学習枚数
              </Typography>
              <Typography variant="h6">{todayStudyCount} 枚</Typography>
            </Box>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <LocalFireDepartmentIcon
              sx={{ color: streak > 0 ? "#FF6D00" : "text.disabled" }}
            />
            <Box>
              <Typography variant="body2" color="text.secondary">
                連続学習日数
              </Typography>
              <Typography variant="h6">
                {streak} 日{streak >= 3 && " 🔥"}
              </Typography>
            </Box>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}
