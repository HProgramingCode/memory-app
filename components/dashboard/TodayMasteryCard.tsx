"use client";

import { Card, CardContent, Typography, Box, LinearProgress } from "@mui/material";
import type { StudyRecord } from "@/types";

interface TodayMasteryCardProps {
  record: StudyRecord | undefined;
}

/**
 * 今日の復習セッション定着率
 * 「普通」「簡単」の割合を定着率として表示
 */
export default function TodayMasteryCard({ record }: TodayMasteryCardProps) {
  const total = record
    ? record.againCount + record.hardCount + record.goodCount
    : 0;
  const masteryRate =
    total > 0
      ? Math.round(((record!.hardCount + record!.goodCount) / total) * 100)
      : null;

  return (
    <Card>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          今日の復習 — 定着率
        </Typography>

        {masteryRate === null ? (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ textAlign: "center", py: 3 }}
          >
            今日の復習を開始すると定着率が表示されます
          </Typography>
        ) : (
          <Box sx={{ mt: 1 }}>
            {/* 定着率の数値 */}
            <Box
              sx={{
                display: "flex",
                alignItems: "baseline",
                justifyContent: "center",
                mb: 2,
              }}
            >
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 700,
                  color:
                    masteryRate >= 80
                      ? "success.main"
                      : masteryRate >= 50
                      ? "warning.main"
                      : "error.main",
                }}
              >
                {masteryRate}
              </Typography>
              <Typography
                variant="h6"
                color="text.secondary"
                sx={{ ml: 0.5 }}
              >
                %
              </Typography>
            </Box>

            {/* プログレスバー */}
            <LinearProgress
              variant="determinate"
              value={masteryRate}
              sx={{
                height: 8,
                borderRadius: 4,
                mb: 2,
                backgroundColor: "grey.200",
                "& .MuiLinearProgress-bar": {
                  borderRadius: 4,
                  backgroundColor:
                    masteryRate >= 80
                      ? "success.main"
                      : masteryRate >= 50
                      ? "warning.main"
                      : "error.main",
                },
              }}
            />

            {/* 内訳 */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-around",
                gap: 1,
              }}
            >
              <Box sx={{ textAlign: "center" }}>
                <Typography variant="body2" color="error.main" fontWeight={600}>
                  {record!.againCount}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  難しい
                </Typography>
              </Box>
              <Box sx={{ textAlign: "center" }}>
                <Typography
                  variant="body2"
                  color="warning.main"
                  fontWeight={600}
                >
                  {record!.hardCount}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  普通
                </Typography>
              </Box>
              <Box sx={{ textAlign: "center" }}>
                <Typography
                  variant="body2"
                  color="success.main"
                  fontWeight={600}
                >
                  {record!.goodCount}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  簡単
                </Typography>
              </Box>
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
