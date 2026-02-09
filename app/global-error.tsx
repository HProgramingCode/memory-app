"use client";

import { Box, Typography, Button, Container } from "@mui/material";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
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
              致命的なエラーが発生しました
            </Typography>
            <Typography variant="body1" color="text.secondary">
              アプリケーションを開始できませんでした。
            </Typography>
            <Button variant="contained" onClick={() => reset()}>
              再読み込み
            </Button>
          </Box>
        </Container>
      </body>
    </html>
  );
}
