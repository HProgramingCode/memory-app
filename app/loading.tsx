"use client";

import { Box, CircularProgress, Typography } from "@mui/material";

/**
 * ページ遷移時のローディング表示
 */
export default function Loading() {
  return (
    <Box
      sx={{
        minHeight: "60vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 2,
        animation: "fadeInUp 0.3s ease-out",
      }}
    >
      <CircularProgress
        size={36}
        thickness={4}
        sx={{ color: "primary.main" }}
      />
      <Typography variant="body2" color="text.secondary">
        読み込み中...
      </Typography>
    </Box>
  );
}
