"use client";

import { useEffect } from "react";
import { Box, Typography, Button, Container } from "@mui/material";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // ログ収集サービス等があればここでエラーを送信
    console.error(error);
  }, [error]);

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          gap: 2,
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom color="error">
          エラーが発生しました
        </Typography>
        <Typography variant="body1" color="text.secondary">
          予期せぬエラーが発生しました。もう一度お試しください。
        </Typography>
        <Button variant="contained" onClick={() => reset()}>
          再試行
        </Button>
      </Box>
    </Container>
  );
}
