"use client";

import { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Stack,
  Snackbar,
  Alert,
} from "@mui/material";
import AppLayout from "@/components/common/AppLayout";

export default function ReviewFeedbackPage() {
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  const handleSubmit = async () => {
    const trimmed = message.trim();
    if (!trimmed) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed }),
      });
      if (!res.ok) throw new Error("Failed");
      setMessage("");
      setSnackbar({
        open: true,
        message: "レビューを送信しました。ご協力ありがとうございます。",
        severity: "success",
      });
    } catch {
      setSnackbar({
        open: true,
        message: "レビューの送信に失敗しました。時間をおいて再度お試しください。",
        severity: "error",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppLayout>
      <Box sx={{ maxWidth: 640, mx: "auto", mt: 2 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          使用感のフィードバック
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          このアプリの使い心地や改善してほしい点があれば、自由に記入してください。
          内容は管理者のみが確認します。
        </Typography>
        <Stack spacing={2}>
          <TextField
            label="レビュー内容"
            multiline
            minRows={5}
            fullWidth
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={!message.trim() || submitting}
            >
              送信する
            </Button>
          </Box>
        </Stack>
      </Box>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
      >
        <Alert severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </AppLayout>
  );
}

