"use client";

import { useState } from "react";
import {
  Box,
  Typography,
  Button,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Menu,
  MenuItem,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import SchoolIcon from "@mui/icons-material/School";
import { useRouter } from "next/navigation";
import { useDeckStore } from "@/stores/useDeckStore";
import { useCardStore } from "@/stores/useCardStore";
import { isMastered } from "@/lib/srs";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import EmptyState from "@/components/common/EmptyState";

/**
 * デッキ一覧セクション
 */
export default function DeckList() {
  const router = useRouter();
  const { decks, addDeck, updateDeck, deleteDeck } = useDeckStore();
  const { getCardsByDeckId, getDueCardsByDeckId, deleteCardsByDeckId } =
    useCardStore();

  // 新規/編集ダイアログの状態
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDeckId, setEditingDeckId] = useState<string | null>(null);
  const [deckName, setDeckName] = useState("");

  // 削除確認ダイアログ
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  // コンテキストメニュー
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [menuDeckId, setMenuDeckId] = useState<string | null>(null);

  const handleOpenCreate = () => {
    setEditingDeckId(null);
    setDeckName("");
    setDialogOpen(true);
  };

  const handleOpenEdit = (id: string, name: string) => {
    setEditingDeckId(id);
    setDeckName(name);
    setDialogOpen(true);
    setMenuAnchor(null);
  };

  const handleSave = async () => {
    const trimmed = deckName.trim();
    if (!trimmed) return;
    if (editingDeckId) {
      await updateDeck(editingDeckId, trimmed);
    } else {
      await addDeck(trimmed);
    }
    setDialogOpen(false);
  };

  const handleDeleteConfirm = async () => {
    if (deleteTarget) {
      deleteCardsByDeckId(deleteTarget);
      await deleteDeck(deleteTarget);
    }
    setDeleteTarget(null);
  };

  const handleMenuOpen = (e: React.MouseEvent<HTMLElement>, deckId: string) => {
    e.stopPropagation();
    setMenuAnchor(e.currentTarget);
    setMenuDeckId(deckId);
  };

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 2,
        }}
      >
        <Typography variant="h6">デッキ一覧</Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            size="small"
            onClick={handleOpenCreate}
          >
            新規デッキ
          </Button>
        </Box>
      </Box>

      {decks.length === 0 ? (
        <EmptyState
          title="デッキがありません"
          description="新規デッキを作成して、カードを登録しましょう"
          action={
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpenCreate}
            >
              最初のデッキを作成
            </Button>
          }
        />
      ) : (
        <List disablePadding>
          {decks.map((deck) => {
            const deckCards = getCardsByDeckId(deck.id);
            const cardCount = deckCards.length;
            const dueCount = getDueCardsByDeckId(deck.id).length;
            const masteredCount = deckCards.filter(isMastered).length;
            const masteryPct =
              cardCount > 0 ? Math.round((masteredCount / cardCount) * 100) : 0;
            return (
              <ListItem
                key={deck.id}
                disablePadding
                secondaryAction={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    {dueCount > 0 && (
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => router.push(`/review?deckId=${deck.id}`)}
                        aria-label="復習"
                        title="今日の復習"
                      >
                        <PlayArrowIcon />
                      </IconButton>
                    )}
                    {cardCount > 0 && (
                      <IconButton
                        size="small"
                        color="secondary"
                        onClick={() =>
                          router.push(
                            `/review?deckId=${deck.id}&mode=free`
                          )
                        }
                        aria-label="自由学習"
                        title="自由学習"
                      >
                        <SchoolIcon />
                      </IconButton>
                    )}
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, deck.id)}
                      aria-label="メニュー"
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </Box>
                }
                sx={{ mb: 0.5 }}
              >
                <ListItemButton
                  onClick={() => router.push(`/decks/${deck.id}`)}
                  sx={{ borderRadius: 2 }}
                >
                  <ListItemText
                    primary={deck.name}
                    secondary={
                      <Box
                        component="span"
                        sx={{ display: "flex", gap: 1, mt: 0.5, flexWrap: "wrap" }}
                      >
                        <Chip
                          component="span"
                          label={`${cardCount} 枚`}
                          size="small"
                          variant="outlined"
                        />
                        {dueCount > 0 && (
                          <Chip
                            component="span"
                            label={`復習: ${dueCount}`}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        )}
                        {cardCount > 0 && (
                          <Chip
                            component="span"
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
                        )}
                      </Box>
                    }
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      )}

      {/* コンテキストメニュー */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
      >
        <MenuItem
          onClick={() => {
            if (menuDeckId) {
              const deck = decks.find((d) => d.id === menuDeckId);
              if (deck) handleOpenEdit(deck.id, deck.name);
            }
          }}
        >
          名前を変更
        </MenuItem>
        <MenuItem
          onClick={() => {
            setDeleteTarget(menuDeckId);
            setMenuAnchor(null);
          }}
          sx={{ color: "error.main" }}
        >
          削除
        </MenuItem>
      </Menu>

      {/* 新規/編集ダイアログ */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>
          {editingDeckId ? "デッキ名を変更" : "新規デッキ作成"}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            label="デッキ名"
            value={deckName}
            onChange={(e) => setDeckName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSave();
            }}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} color="inherit">
            キャンセル
          </Button>
          <Button
            onClick={handleSave}
            variant="contained"
            disabled={!deckName.trim()}
          >
            {editingDeckId ? "保存" : "作成"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* 削除確認ダイアログ */}
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="デッキを削除"
        message="このデッキと、含まれる全てのカードが削除されます。この操作は元に戻せません。"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </Box>
  );
}
