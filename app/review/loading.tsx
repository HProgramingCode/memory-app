"use client";

import { Box, CircularProgress, Typography } from "@mui/material";

/**
 * 復習ページ遷移時のローディング表示
 */
export default function ReviewLoading() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 2,
        bgcolor: "background.default",
      }}
    >
      <CircularProgress
        size={36}
        thickness={4}
        sx={{ color: "primary.main" }}
      />
      <Typography variant="body2" color="text.secondary">
        カードを準備中...
      </Typography>
    </Box>
  );
}
