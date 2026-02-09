"use client";

import { use, useState } from "react";
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
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useRouter } from "next/navigation";
import { useDeckStore } from "@/stores/useDeckStore";
import { useCardStore } from "@/stores/useCardStore";
import { isMastered, isDueToday } from "@/lib/srs";
import AppLayout from "@/components/common/AppLayout";
import EmptyState from "@/components/common/EmptyState";
import ConfirmDialog from "@/components/common/ConfirmDialog";

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
  const getDeck = useDeckStore((s) => s.getDeck);
  const getCardsByDeckId = useCardStore((s) => s.getCardsByDeckId);
  const deleteCard = useCardStore((s) => s.deleteCard);

  const deck = getDeck(id);
  const cards = getCardsByDeckId(id);

  const [searchQuery, setSearchQuery] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

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
          c.backText.toLowerCase().includes(searchQuery.toLowerCase())
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
          }}
        >
          <Typography variant="h5">{deck.name}</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => router.push(`/cards/new?deckId=${id}`)}
          >
            カードを追加
          </Button>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {cards.length} 枚のカード
        </Typography>
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
    </AppLayout>
  );
}
