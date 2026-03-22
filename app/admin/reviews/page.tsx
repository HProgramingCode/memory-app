"use client";

import useSWR from "swr";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Chip,
  CircularProgress,
} from "@mui/material";
import AppLayout from "@/components/common/AppLayout";

type AdminReview = {
  id: string;
  message: string;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    email: string | null;
  };
};

const fetcher = async (url: string) => {
  const res = await fetch(url);
  const body = await res.json();
  if (!res.ok) {
    const msg = body?.error === "Forbidden" ? "管理者権限がありません。" : `取得に失敗しました (${res.status})`;
    throw new Error(msg);
  }
  return body;
};

export default function AdminReviewsPage() {
  const { data, error, isLoading } = useSWR<AdminReview[]>(
    "/api/admin/reviews",
    fetcher
  );

  return (
    <AppLayout>
      <Box sx={{ maxWidth: 800, mx: "auto", mt: 2 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          レビュー一覧（管理者用）
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          ユーザーから送信された使用感のレビューです。内容は管理者のみが閲覧できます。
        </Typography>
        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Typography color="error">
            レビューの取得に失敗しました。権限またはネットワークを確認してください。
          </Typography>
        ) : !data ? (
          <Typography color="text.secondary">読み込み中です。</Typography>
        ) : !Array.isArray(data) ? (
          <Typography color="error">
            レビューの取得に失敗しました。権限またはネットワークを確認してください。
          </Typography>
        ) : data.length === 0 ? (
          <Typography color="text.secondary">
            まだ一件も送信されていません。ユーザーがレビューフォームから送信するとここに表示されます。
          </Typography>
        ) : (
          <List>
            {data.map((r) => (
              <ListItem key={r.id} alignItems="flex-start" divider>
                <ListItemText
                  primary={
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 1,
                      }}
                    >
                      <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                        <Typography variant="subtitle2">
                          {r.user.name || r.user.email || "(不明なユーザー)"}
                        </Typography>
                        {r.user.email && (
                          <Chip
                            label={r.user.email}
                            size="small"
                            variant="outlined"
                          />
                        )}
                      </Box>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(r.createdAt).toLocaleString("ja-JP")}
                      </Typography>
                    </Box>
                  }
                  secondary={
                    <Typography
                      variant="body2"
                      sx={{ whiteSpace: "pre-wrap", mt: 0.5 }}
                    >
                      {r.message}
                    </Typography>
                  }
                />
              </ListItem>
            ))}
          </List>
        )}
      </Box>
    </AppLayout>
  );
}

