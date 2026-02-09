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
    <Card
      sx={{
        height: "100%",
        borderRadius: 4,
        boxShadow: "0 4px 20px 0 rgba(0,0,0,0.05)",
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600, mb: 2 }}>
          学習サマリー
        </Typography>
        <Stack spacing={2.5}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box sx={{ p: 1, borderRadius: 2, bgcolor: "primary.lighter", display: "flex" }}>
              <StyleIcon color="primary" />
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary" display="block">
                総カード数
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>{totalCards} <Typography component="span" variant="body2" color="text.secondary">枚</Typography></Typography>
            </Box>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box sx={{ p: 1, borderRadius: 2, bgcolor: "secondary.lighter", display: "flex" }}>
              <MenuBookIcon color="secondary" />
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary" display="block">
                今日の学習
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>{todayStudyCount} <Typography component="span" variant="body2" color="text.secondary">枚</Typography></Typography>
            </Box>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Box sx={{ p: 1, borderRadius: 2, bgcolor: streak > 0 ? "warning.lighter" : "action.hover", display: "flex" }}>
              <LocalFireDepartmentIcon
                sx={{ color: streak > 0 ? "#FF6D00" : "text.disabled" }}
              />
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary" display="block">
                連続学習
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {streak} 日{streak >= 3 && " 🔥"}
              </Typography>
            </Box>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}
