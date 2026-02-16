"use client";

import { Box, CircularProgress } from "@mui/material";

/**
 * 設定ページ遷移時のローディング表示
 */
export default function SettingsLoading() {
  return (
    <Box
      sx={{
        minHeight: "60vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <CircularProgress size={36} thickness={4} sx={{ color: "primary.main" }} />
    </Box>
  );
}
