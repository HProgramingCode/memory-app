"use client";

import { Card, CardContent, Typography, Button, Box } from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useRouter } from "next/navigation";

interface TodayReviewCardProps {
  dueCount: number;
}

/**
 * 今日の復習 — Hero CTA Card
 * ダッシュボードの最重要アクション
 */
export default function TodayReviewCard({ dueCount }: TodayReviewCardProps) {
  const router = useRouter();

  if (dueCount === 0) {
    return (
      <Card
        sx={{
          background: "linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 100%)",
          border: "1px solid rgba(16, 185, 129, 0.15)",
        }}
      >
        <CardContent
          sx={{
            p: 3,
            display: "flex",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Box
            sx={{
              p: 1,
              borderRadius: 2.5,
              bgcolor: "rgba(16, 185, 129, 0.1)",
              display: "flex",
              animation: "float 3s ease-in-out infinite",
            }}
          >
            <CheckCircleIcon sx={{ fontSize: 28, color: "success.main" }} />
          </Box>
          <Box>
            <Typography variant="body1" sx={{ fontWeight: 700, color: "#065f46" }}>
              ALL CLEAR!
            </Typography>
            <Typography variant="body2" sx={{ color: "#047857" }}>
              今日の復習はすべて完了しました 🎉
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      sx={{
        background: "linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%)",
        border: "1px solid rgba(99, 102, 241, 0.15)",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <CardContent
        sx={{
          p: { xs: 3, sm: 4 },
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 3,
          flexWrap: "wrap",
        }}
      >
        <Box>
          <Typography
            variant="subtitle2"
            sx={{ color: "#6366f1", mb: 0.5, fontWeight: 700 }}
          >
            今日の復習
          </Typography>
          <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.75 }}>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 900,
                color: "#4338ca",
                lineHeight: 1,
                animation: "countUp 0.4s ease-out",
              }}
            >
              {dueCount}
            </Typography>
            <Typography variant="body1" sx={{ color: "#6366f1", fontWeight: 600 }}>
              枚が待っています
            </Typography>
          </Box>
        </Box>
        <Button
          variant="contained"
          startIcon={<PlayArrowIcon />}
          onClick={() => router.push("/review")}
          size="large"
          sx={{
            px: 4,
            py: 1.5,
            borderRadius: 3,
            fontSize: "0.95rem",
            fontWeight: 700,
            flexShrink: 0,
            background: "linear-gradient(135deg, #6366f1, #4f46e5)",
            boxShadow: "0 4px 14px rgba(99, 102, 241, 0.3)",
            "&:hover": {
              background: "linear-gradient(135deg, #818cf8, #6366f1)",
              boxShadow: "0 6px 20px rgba(99, 102, 241, 0.4)",
              transform: "translateY(-1px)",
            },
          }}
        >
          学習を開始する
        </Button>
      </CardContent>
    </Card>
  );
}
