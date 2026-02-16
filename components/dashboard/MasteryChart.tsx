"use client";

import { Card, CardContent, Typography, Box, Stack, Divider } from "@mui/material";
import { isMastered } from "@/lib/srs";
import type { Card as CardType } from "@/types";

interface MasteryChartProps {
  cards: CardType[];
}

/**
 * 定着度グラフ — ドーナツチャート（ライトモード対応）
 */
export default function MasteryChart({ cards }: MasteryChartProps) {
  const total = cards.length;
  const mastered = cards.filter(isMastered).length;
  const learning = total - mastered;
  const masteredPct = total > 0 ? (mastered / total) * 100 : 0;

  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  const masteredArc = (masteredPct / 100) * circumference;

  return (
    <Card sx={{ height: "100%" }}>
      <CardContent sx={{ p: 3, display: "flex", flexDirection: "column", height: "100%" }}>
        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
          カードの定着度
        </Typography>

        {total === 0 ? (
          <Box sx={{ flexGrow: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Typography variant="body2" color="text.secondary">
              カードを追加して学習を始めましょう ✨
            </Typography>
          </Box>
        ) : (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              flexGrow: 1,
              gap: 2,
              mt: 1,
            }}
          >
            <Box sx={{ position: "relative", width: 130, height: 130 }}>
              <svg
                width="130"
                height="130"
                viewBox="0 0 130 130"
                style={{ transform: "rotate(-90deg)" }}
              >
                <defs>
                  <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#34d399" />
                  </linearGradient>
                </defs>
                <circle
                  cx="65"
                  cy="65"
                  r={radius}
                  fill="none"
                  stroke="#f1f5f9"
                  strokeWidth="10"
                />
                <circle
                  cx="65"
                  cy="65"
                  r={radius}
                  fill="none"
                  stroke="url(#ringGradient)"
                  strokeWidth="10"
                  strokeDasharray={`${masteredArc} ${circumference - masteredArc}`}
                  strokeLinecap="round"
                  style={{ transition: "stroke-dasharray 0.8s cubic-bezier(0.4, 0, 0.2, 1)" }}
                />
              </svg>
              <Box
                sx={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  textAlign: "center",
                }}
              >
                <Typography
                  variant="h5"
                  sx={{ fontWeight: 900, color: "#10b981", lineHeight: 1 }}
                >
                  {Math.round(masteredPct)}%
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.6rem" }}>
                  定着済み
                </Typography>
              </Box>
            </Box>

            <Stack direction="row" spacing={4} sx={{ mt: 0.5 }}>
              <Box sx={{ textAlign: "center" }}>
                <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1, color: "#10b981" }}>
                  {mastered}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.6rem" }}>
                  定着済み
                </Typography>
              </Box>
              <Divider orientation="vertical" flexItem />
              <Box sx={{ textAlign: "center" }}>
                <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1, color: "text.secondary" }}>
                  {learning}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.6rem" }}>
                  学習中
                </Typography>
              </Box>
            </Stack>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
