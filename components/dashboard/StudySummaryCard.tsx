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
 * 学習サマリー — 横並びスタッツ
 * 3つの数値を同じ行に等幅で配置
 */
export default function StudySummaryCard({
  totalCards,
  streak,
  todayStudyCount,
}: StudySummaryCardProps) {
  const stats = [
    {
      label: "総カード数",
      value: totalCards,
      unit: "枚",
      icon: <StyleIcon sx={{ fontSize: 20, color: "#6366f1" }} />,
      bgColor: "rgba(99, 102, 241, 0.08)",
    },
    {
      label: "今日の学習",
      value: todayStudyCount,
      unit: "枚",
      icon: <MenuBookIcon sx={{ fontSize: 20, color: "#8b5cf6" }} />,
      bgColor: "rgba(139, 92, 246, 0.08)",
    },
    {
      label: "連続学習",
      value: streak,
      unit: `日${streak >= 3 ? " 🔥" : ""}`,
      icon: (
        <LocalFireDepartmentIcon
          sx={{
            fontSize: 20,
            color: streak > 0 ? "#f59e0b" : "#d1d5db",
            ...(streak >= 3 ? { animation: "pulseGlow 2s ease-in-out infinite" } : {}),
          }}
        />
      ),
      bgColor: streak > 0 ? "rgba(245, 158, 11, 0.08)" : "rgba(0,0,0,0.02)",
    },
  ];

  return (
    <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
      {stats.map((stat, i) => (
        <Card
          key={stat.label}
          sx={{
            flex: 1,
            animation: `fadeInUp 0.4s ease-out ${0.1 + i * 0.08}s both`,
          }}
        >
          <CardContent sx={{ p: 2.5, "&:last-child": { pb: 2.5 } }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 1 }}>
              <Box
                sx={{
                  p: 0.75,
                  borderRadius: 2,
                  bgcolor: stat.bgColor,
                  display: "flex",
                }}
              >
                {stat.icon}
              </Box>
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontWeight: 600, fontSize: "0.68rem", letterSpacing: "0.03em" }}
              >
                {stat.label}
              </Typography>
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 800, color: "text.primary", lineHeight: 1 }}>
              {stat.value}
              <Typography
                component="span"
                variant="body2"
                color="text.secondary"
                sx={{ fontWeight: 500, ml: 0.5 }}
              >
                {stat.unit}
              </Typography>
            </Typography>
          </CardContent>
        </Card>
      ))}
    </Stack>
  );
}
