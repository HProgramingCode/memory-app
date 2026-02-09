"use client";

import { Card, CardContent, Typography, Button, Box } from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useRouter } from "next/navigation";

interface TodayReviewCardProps {
  dueCount: number;
}

/**
 * 今日の復習セクション
 */
export default function TodayReviewCard({ dueCount }: TodayReviewCardProps) {
  const router = useRouter();

  return (
    <Card
      sx={{
        height: "100%",
        borderRadius: 4,
        boxShadow: "0 4px 20px 0 rgba(0,0,0,0.05)",
        background: dueCount > 0
          ? "linear-gradient(135deg, #ffffff 0%, #f5f7ff 100%)"
          : "#ffffff",
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600, mb: 2 }}>
          今日の復習
        </Typography>
        {dueCount > 0 ? (
          <Box>
            <Box sx={{ display: "flex", alignItems: "baseline", gap: 1, mb: 3 }}>
              <Typography variant="h3" sx={{ fontWeight: 800, color: "primary.main" }}>
                {dueCount}
              </Typography>
              <Typography variant="h6" color="text.secondary">
                枚
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<PlayArrowIcon />}
              onClick={() => router.push("/review")}
              fullWidth
              size="large"
              sx={{
                py: 1.5,
                borderRadius: 3,
                textTransform: "none",
                fontSize: "1rem",
                fontWeight: 700,
                boxShadow: "0 8px 16px 0 rgba(var(--mui-palette-primary-mainChannel), 0.3)",
              }}
            >
              学習を開始する
            </Button>
          </Box>
        ) : (
          <Box sx={{ textAlign: "center", py: 2 }}>
            <CheckCircleIcon
              sx={{ fontSize: 48, color: "success.main", mb: 1, opacity: 0.8 }}
            />
            <Typography variant="body1" sx={{ fontWeight: 500, color: "text.primary" }}>
              ALL CLEAR!
            </Typography>
            <Typography variant="body2" color="text.secondary">
              今日の復習はすべて完了しました
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
