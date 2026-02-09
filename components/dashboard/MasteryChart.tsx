"use client";

import { Card, CardContent, Typography, Box, Stack, Divider } from "@mui/material";
import { isMastered } from "@/lib/srs";
import type { Card as CardType } from "@/types";

interface MasteryChartProps {
  cards: CardType[];
}

/**
 * 定着度グラフ（シンプルなドーナツ風の円グラフ）
 * 外部ライブラリを使わず、CSS + SVG で実装
 */
export default function MasteryChart({ cards }: MasteryChartProps) {
  const total = cards.length;
  const mastered = cards.filter(isMastered).length;
  const learning = total - mastered;
  const masteredPct = total > 0 ? (mastered / total) * 100 : 0;

  // SVG 円グラフ用の計算
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const masteredArc = (masteredPct / 100) * circumference;

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
      <CardContent sx={{ p: 3, display: "flex", flexDirection: "column", height: "100%" }}>
        <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600, mb: 1 }}>
          カードの定着度
        </Typography>

        {total === 0 ? (
          <Box sx={{ flexGrow: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Typography variant="body2" color="text.secondary">
              カードを登録しましょう
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
            {/* SVG ドーナツチャート */}
            <Box sx={{ position: "relative", width: 140, height: 140 }}>
              <svg
                width="140"
                height="140"
                viewBox="0 0 140 140"
                style={{ transform: "rotate(-90deg)" }}
              >
                {/* 背景円 */}
                <circle
                  cx="70"
                  cy="70"
                  r={radius}
                  fill="none"
                  stroke="rgba(0,0,0,0.04)"
                  strokeWidth="12"
                />
                {/* 定着済み部分 */}
                <circle
                  cx="70"
                  cy="70"
                  r={radius}
                  fill="none"
                  stroke="#4CAF50"
                  strokeWidth="12"
                  strokeDasharray={`${masteredArc} ${circumference - masteredArc}`}
                  strokeLinecap="round"
                  style={{ transition: "stroke-dasharray 0.5s ease" }}
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
                <Typography variant="h5" sx={{ fontWeight: 800, color: "text.primary" }}>
                  {Math.round(masteredPct)}%
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Mastered
                </Typography>
              </Box>
            </Box>

            {/* 凡例 */}
            <Box sx={{ width: "100%", mt: 1 }}>
              <Stack direction="row" justifyContent="space-around" spacing={2}>
                <Box sx={{ textAlign: "center" }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1 }}>{mastered}</Typography>
                  <Typography variant="caption" color="text.secondary">定着済み</Typography>
                </Box>
                <Divider orientation="vertical" flexItem sx={{ opacity: 0.6 }} />
                <Box sx={{ textAlign: "center" }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1 }}>{learning}</Typography>
                  <Typography variant="caption" color="text.secondary">学習中</Typography>
                </Box>
              </Stack>
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
