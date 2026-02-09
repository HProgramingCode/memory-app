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
    <Card sx={{ height: "100%" }}>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          今日の復習
        </Typography>
        {dueCount > 0 ? (
          <>
            <Typography variant="h4" sx={{ mb: 1 }}>
              {dueCount}
              <Typography
                component="span"
                variant="body1"
                color="text.secondary"
              >
                {" "}
                枚
              </Typography>
            </Typography>
            <Button
              variant="contained"
              startIcon={<PlayArrowIcon />}
              onClick={() => router.push("/review")}
              fullWidth
              size="large"
              sx={{ mt: 1 }}
            >
              学習を開始する
            </Button>
          </>
        ) : (
          <Box sx={{ textAlign: "center", py: 2 }}>
            <CheckCircleIcon
              sx={{ fontSize: 48, color: "success.main", mb: 1 }}
            />
            <Typography color="text.secondary">
              今日の復習は完了しました
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
