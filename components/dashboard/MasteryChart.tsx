"use client";

import { Card, CardContent, Typography, Box } from "@mui/material";
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
    <Card>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          カードの定着度
        </Typography>

        {total === 0 ? (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ textAlign: "center", py: 3 }}
          >
            カードを登録すると定着度が表示されます
          </Typography>
        ) : (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 3,
              mt: 1,
            }}
          >
            {/* SVG ドーナツチャート */}
            <Box sx={{ position: "relative", width: 120, height: 120 }}>
              <svg
                width="120"
                height="120"
                viewBox="0 0 120 120"
                style={{ transform: "rotate(-90deg)" }}
              >
                {/* 背景円 */}
                <circle
                  cx="60"
                  cy="60"
                  r={radius}
                  fill="none"
                  stroke="#E0E0E0"
                  strokeWidth="12"
                />
                {/* 定着済み部分 */}
                <circle
                  cx="60"
                  cy="60"
                  r={radius}
                  fill="none"
                  stroke="#66BB6A"
                  strokeWidth="12"
                  strokeDasharray={`${masteredArc} ${
                    circumference - masteredArc
                  }`}
                  strokeLinecap="round"
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
                <Typography variant="h6" sx={{ lineHeight: 1 }}>
                  {Math.round(masteredPct)}%
                </Typography>
              </Box>
            </Box>

            {/* 凡例 */}
            <Box>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}
              >
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: "50%",
                    bgcolor: "#66BB6A",
                  }}
                />
                <Typography variant="body2">定着済み: {mastered} 枚</Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: "50%",
                    bgcolor: "#E0E0E0",
                  }}
                />
                <Typography variant="body2">学習中: {learning} 枚</Typography>
              </Box>
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
