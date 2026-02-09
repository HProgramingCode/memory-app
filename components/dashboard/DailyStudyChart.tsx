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
  Cell,
} from "recharts";
import { Paper, Typography, Box, useTheme, Card } from "@mui/material";
import { useStudyStore } from "@/stores/useStudyStore";
import { format, subDays, eachDayOfInterval, isSameDay } from "date-fns";
import { ja } from "date-fns/locale";

/**
 * 日別の学習枚数グラフ
 * 直近7日間の学習枚数を棒グラフで表示
 */
export default function DailyStudyChart() {
  const theme = useTheme();
  const records = useStudyStore((s) => s.records);

  const data = useMemo(() => {
    const today = new Date();
    const startDate = subDays(today, 6); // 過去7日間（今日含む）

    // 日付の配列を作成
    const dates = eachDayOfInterval({ start: startDate, end: today });

    return dates.map((date) => {
      const dateStr = format(date, "yyyy-MM-dd"); // Format current date for comparison
      // その日のレコードを検索
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
    <Card
      sx={{
        p: 3,
        height: "100%",
        borderRadius: 4,
        boxShadow: "0 4px 20px 0 rgba(0,0,0,0.05)",
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 3 }} color="text.secondary">
        直近7日間の学習枚数
      </Typography>
      <Box sx={{ width: "100%", height: 250 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.palette.divider} />
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
              cursor={{ fill: "rgba(0,0,0,0.04)", radius: 4 }}
              contentStyle={{
                backgroundColor: theme.palette.background.paper,
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 8,
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                padding: "8px 12px",
              }}
              labelStyle={{ color: theme.palette.text.primary, fontWeight: 700, marginBottom: 4 }}
              itemStyle={{ padding: 0 }}
              formatter={(value: number | undefined) => [`${value ?? 0} 枚`, "学習枚数"]}
              labelFormatter={(label, payload) => {
                if (payload && payload.length > 0) {
                  return payload[0].payload.fullDate;
                }
                return label;
              }}
            />
            <Bar dataKey="count" radius={[6, 6, 0, 0]} maxBarSize={32}>
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={theme.palette.primary.main}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Card>
  );
}
