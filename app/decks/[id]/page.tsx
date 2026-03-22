"use client";

import { use, useState, useRef, useMemo } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  InputAdornment,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  IconButton,
  Chip,
  Stack,
  Snackbar,
  Alert,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SchoolIcon from "@mui/icons-material/School";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useRouter } from "next/navigation";
import { useDeckStore } from "@/stores/useDeckStore";
import { useCardStore } from "@/stores/useCardStore";
import { isMastered, isDueToday } from "@/lib/srs";
import AppLayout from "@/components/common/AppLayout";
import EmptyState from "@/components/common/EmptyState";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import { exportDeckData, importDeckData } from "@/lib/exportImport";

/**
 * デッキ詳細ページ（カード一覧）
 */
export default function DeckDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  // 配列そのものを購読し、find/filter は useMemo で派生（セレクタ内で毎回 filter すると新配列になり React 19 の getSnapshot 警告になる）
  const decks = useDeckStore((s) => s.decks);
  const allCards = useCardStore((s) => s.cards);
  const deck = useMemo(() => decks.find((d) => d.id === id), [decks, id]);
  const cards = useMemo(() => allCards.filter((c) => c.deckId === id), [allCards, id]);
  const deleteCard = useCardStore((s) => s.deleteCard);

  const [searchQuery, setSearchQuery] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleExportDeck = async () => {
    try {
      const json = await exportDeckData(id);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const safeName = deck?.name || "deck";
      a.href = url;
      a.download = `memory-app-deck-${safeName}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setSnackbar({
        open: true,
        message: "デッキのエクスポートが完了しました",
        severity: "success",
      });
    } catch {
      setSnackbar({
        open: true,
        message: "デッキのエクスポートに失敗しました",
        severity: "error",
      });
    }
  };

  const handleImportDeck = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelected = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    event.target.value = "";
    try {
      const text = await file.text();
      await importDeckData(id, text);
      setSnackbar({
        open: true,
        message: "デッキのインポートが完了しました",
        severity: "success",
      });
      // デッキ・カード一覧は通常の一覧APIと DataInitializer に任せるため、
      // ここではストアの即時リフレッシュは行わない（次回起動時に反映）。
    } catch {
      setSnackbar({
        open: true,
        message:
          "デッキのインポートに失敗しました。ファイル形式を確認してください。",
        severity: "error",
      });
    }
  };

  if (!deck) {
    return (
      <AppLayout>
        <EmptyState title="デッキが見つかりません" />
      </AppLayout>
    );
  }

  // 検索フィルタリング
  const filteredCards = searchQuery
    ? cards.filter(
        (c) =>
          c.frontText.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.backText.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : cards;

  return (
    <AppLayout>
      {/* ヘッダー */}
      <Box sx={{ mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push("/")}
          color="inherit"
          sx={{ mb: 1 }}
        >
          ダッシュボード
        </Button>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
          }}
        >
          <Typography variant="h5">{deck.name}</Typography>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button variant="outlined" size="small" onClick={handleExportDeck}>
              デッキをエクスポート
            </Button>
            <Button variant="outlined" size="small" onClick={handleImportDeck}>
              デッキをインポート
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => router.push(`/cards/new?deckId=${id}`)}
            >
              カードを追加
            </Button>
          </Box>
        </Box>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mt: 1,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Typography variant="body2" color="text.secondary">
              {cards.length} 枚のカード
            </Typography>
            {cards.length > 0 &&
              (() => {
                const masteredCount = cards.filter(isMastered).length;
                const masteryPct = Math.round(
                  (masteredCount / cards.length) * 100,
                );
                const dueCount = cards.filter(isDueToday).length;
                return (
                  <>
                    <Chip
                      label={`定着率: ${masteryPct}%`}
                      size="small"
                      color={
                        masteryPct >= 80
                          ? "success"
                          : masteryPct >= 50
                            ? "warning"
                            : "default"
                      }
                      variant="outlined"
                    />
                    {dueCount > 0 && (
                      <Chip
                        label={`要復習: ${dueCount}`}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    )}
                  </>
                );
              })()}
          </Box>
          <Box sx={{ display: "flex", gap: 1 }}>
            {cards.filter(isDueToday).length > 0 && (
              <Button
                variant="outlined"
                size="small"
                startIcon={<PlayArrowIcon />}
                onClick={() => router.push(`/review?deckId=${id}`)}
              >
                復習
              </Button>
            )}
            {cards.length > 0 && (
              <Button
                variant="outlined"
                size="small"
                color="secondary"
                startIcon={<SchoolIcon />}
                onClick={() => router.push(`/review?deckId=${id}&mode=free`)}
              >
                自由学習
              </Button>
            )}
          </Box>
        </Box>
      </Box>

      {/* 検索 */}
      {cards.length > 0 && (
        <TextField
          fullWidth
          placeholder="カードを検索..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="disabled" />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 2 }}
        />
      )}

      {/* カード一覧 */}
      {cards.length === 0 ? (
        <EmptyState
          title="カードがありません"
          description="このデッキにカードを追加しましょう"
          action={
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => router.push(`/cards/new?deckId=${id}`)}
            >
              最初のカードを追加
            </Button>
          }
        />
      ) : filteredCards.length === 0 ? (
        <EmptyState title="検索結果がありません" />
      ) : (
        <List disablePadding>
          {filteredCards.map((card) => (
            <ListItem
              key={card.id}
              disablePadding
              secondaryAction={
                <Stack direction="row" spacing={0.5}>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(
                        `/review?deckId=${id}&mode=preview&cardId=${card.id}`
                      );
                    }}
                    aria-label="プレビュー"
                  >
                    <VisibilityIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => router.push(`/cards/${card.id}/edit`)}
                    aria-label="編集"
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => setDeleteTarget(card.id)}
                    aria-label="削除"
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Stack>
              }
              sx={{ mb: 0.5 }}
            >
              <ListItemButton
                onClick={() => router.push(`/cards/${card.id}/edit`)}
                sx={{ borderRadius: 2 }}
              >
                <ListItemText
                  primary={
                    card.frontText.length > 80
                      ? card.frontText.slice(0, 80) + "..."
                      : card.frontText || "(画像のみ)"
                  }
                  secondary={
                    <Box
                      component="span"
                      sx={{ display: "flex", gap: 0.5, mt: 0.5 }}
                    >
                      {isDueToday(card) && (
                        <Chip
                          component="span"
                          label="要復習"
                          size="small"
                          color="primary"
                        />
                      )}
                      {isMastered(card) && (
                        <Chip
                          component="span"
                          label="定着済み"
                          size="small"
                          color="success"
                        />
                      )}
                    </Box>
                  }
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      )}

      {/* 削除確認ダイアログ */}
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="カードを削除"
        message="このカードを削除しますか？この操作は元に戻せません。"
        onConfirm={async () => {
          if (deleteTarget) await deleteCard(deleteTarget);
          setDeleteTarget(null);
        }}
        onCancel={() => setDeleteTarget(null)}
      />

      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        style={{ display: "none" }}
        onChange={handleFileSelected}
      />

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
