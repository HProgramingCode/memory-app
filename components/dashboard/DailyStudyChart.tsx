"use client";

import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Typography, Box, useTheme, Card } from "@mui/material";
import { useStudyStore } from "@/stores/useStudyStore";
import { format, subDays, eachDayOfInterval } from "date-fns";
import { ja } from "date-fns/locale";

/**
 * 日別の学習枚数グラフ — ライトモード + グラデーションバー
 */
export default function DailyStudyChart() {
  const theme = useTheme();
  const records = useStudyStore((s) => s.records);

  const data = useMemo(() => {
    const today = new Date();
    const startDate = subDays(today, 6);
    const dates = eachDayOfInterval({ start: startDate, end: today });

    return dates.map((date) => {
      const dateStr = format(date, "yyyy-MM-dd");
      const dayRecord = records.find((r) => r.date === dateStr);
      const count = dayRecord ? (dayRecord.reviewedCount + (dayRecord.freeStudyCount || 0)) : 0;
      return {
        date: format(date, "M/d", { locale: ja }),
        fullDate: format(date, "yyyy年M月d日", { locale: ja }),
        count,
      };
    });
  }, [records]);

  return (
    <Card sx={{ p: 3, height: "100%" }}>
      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 3 }}>
        直近7日間の学習枚数
      </Typography>
      <Box sx={{ width: "100%", height: 250 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
          >
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#818cf8" stopOpacity={0.7} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="rgba(0,0,0,0.04)"
            />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: theme.palette.text.secondary, fontWeight: 500 }}
              tickLine={false}
              axisLine={false}
              dy={10}
            />
            <YAxis
              tick={{ fontSize: 11, fill: theme.palette.text.secondary, fontWeight: 500 }}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
            />
            <Tooltip
              cursor={{ fill: "rgba(99, 102, 241, 0.04)", radius: 4 }}
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid rgba(0,0,0,0.08)",
                borderRadius: 12,
                boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
                padding: "10px 14px",
              }}
              labelStyle={{
                color: theme.palette.text.primary,
                fontWeight: 700,
                marginBottom: 4,
              }}
              itemStyle={{ padding: 0, color: theme.palette.text.secondary }}
              formatter={(value: number | undefined) => [`${value ?? 0} 枚`, "学習枚数"]}
              labelFormatter={(label, payload) => {
                if (payload && payload.length > 0) {
                  return payload[0].payload.fullDate;
                }
                return label;
              }}
            />
            <Bar
              dataKey="count"
              fill="url(#barGradient)"
              radius={[6, 6, 0, 0]}
              maxBarSize={32}
            />
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Card>
  );
}
