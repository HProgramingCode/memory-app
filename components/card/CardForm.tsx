"use client";

import { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  MenuItem,
  Tabs,
  Tab,
  Paper,
  Stack,
  IconButton,
  Toolbar,
} from "@mui/material";
import FormatBoldIcon from "@mui/icons-material/FormatBold";
import FormatItalicIcon from "@mui/icons-material/FormatItalic";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import FormatListNumberedIcon from "@mui/icons-material/FormatListNumbered";
import CodeIcon from "@mui/icons-material/Code";
import TitleIcon from "@mui/icons-material/Title";
import { v4 as uuidv4 } from "uuid";
import { useSession } from "next-auth/react";
import { useDeckStore } from "@/stores/useDeckStore";
import { useCardStore } from "@/stores/useCardStore";
import { saveImage, deleteImage } from "@/lib/imageDb";
import ImageUpload from "@/components/common/ImageUpload";
import MarkdownPreview from "@/components/common/MarkdownPreview";
import type { Card } from "@/types";

interface CardFormProps {
  /** 編集時に渡す既存カード */
  existingCard?: Card;
  /** デフォルトのデッキID */
  defaultDeckId?: string;
  /** 保存後のコールバック */
  onSaved?: () => void;
  /** キャンセル時のコールバック */
  onCancel?: () => void;
}

/**
 * カード登録/編集フォーム
 */
export default function CardForm({
  existingCard,
  defaultDeckId,
  onSaved,
  onCancel,
}: CardFormProps) {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const decks = useDeckStore((s) => s.decks);
  const addCard = useCardStore((s) => s.addCard);
  const updateCard = useCardStore((s) => s.updateCard);

  const [deckId, setDeckId] = useState(
    existingCard?.deckId ?? defaultDeckId ?? ""
  );
  const [frontText, setFrontText] = useState(existingCard?.frontText ?? "");
  const [backText, setBackText] = useState(existingCard?.backText ?? "");
  const [frontImageId, setFrontImageId] = useState<string | null>(
    existingCard?.frontImageId ?? null
  );
  const [backImageId, setBackImageId] = useState<string | null>(
    existingCard?.backImageId ?? null
  );
  const [newFrontImage, setNewFrontImage] = useState<File | null>(null);
  const [newBackImage, setNewBackImage] = useState<File | null>(null);

  // プレビュータブ
  const [frontTab, setFrontTab] = useState(0);
  const [backTab, setBackTab] = useState(0);

  // デッキが1つだけの場合は自動選択
  useEffect(() => {
    if (!deckId && decks.length === 1) {
      setDeckId(decks[0].id);
    }
  }, [decks, deckId]);

  const handleSave = async () => {
    if (!deckId || (!frontText.trim() && !frontImageId && !newFrontImage))
      return;

    // 画像を IndexedDB に保存
    let finalFrontImageId = frontImageId;
    let finalBackImageId = backImageId;

    if (newFrontImage) {
      // ユーザーIDがある場合はプレフィックスを付ける
      const prefix = userId ? `image:${userId}:` : "";
      const id = `${prefix}${uuidv4()}`;
      await saveImage(id, newFrontImage);
      // 古い画像があれば削除
      if (
        existingCard?.frontImageId &&
        existingCard.frontImageId !== frontImageId
      ) {
        await deleteImage(existingCard.frontImageId);
      }
      finalFrontImageId = id;
    }

    if (newBackImage) {
      const prefix = userId ? `image:${userId}:` : "";
      const id = `${prefix}${uuidv4()}`;
      await saveImage(id, newBackImage);
      if (
        existingCard?.backImageId &&
        existingCard.backImageId !== backImageId
      ) {
        await deleteImage(existingCard.backImageId);
      }
      finalBackImageId = id;
    }

    if (existingCard) {
      await updateCard(existingCard.id, {
        deckId,
        frontText,
        backText,
        frontImageId: finalFrontImageId,
        backImageId: finalBackImageId,
      });
    } else {
      await addCard({
        deckId,
        frontText,
        backText,
        frontImageId: finalFrontImageId,
        backImageId: finalBackImageId,
      });
    }

    onSaved?.();
  };

  /** Markdown ツールバーの装飾挿入 */
  const insertMarkdown = (
    setter: (v: string) => void,
    current: string,
    prefix: string,
    suffix: string = ""
  ) => {
    setter(current + prefix + suffix);
  };

  const renderMarkdownToolbar = (
    text: string,
    setText: (v: string) => void
  ) => (
    <Toolbar
      variant="dense"
      disableGutters
      sx={{ minHeight: 36, gap: 0.5, px: 0.5, flexWrap: "wrap" }}
    >
      <IconButton
        size="small"
        onClick={() => insertMarkdown(setText, text, "\n## ", "")}
        title="見出し"
      >
        <TitleIcon fontSize="small" />
      </IconButton>
      <IconButton
        size="small"
        onClick={() => insertMarkdown(setText, text, "**", "**")}
        title="太字"
      >
        <FormatBoldIcon fontSize="small" />
      </IconButton>
      <IconButton
        size="small"
        onClick={() => insertMarkdown(setText, text, "*", "*")}
        title="イタリック"
      >
        <FormatItalicIcon fontSize="small" />
      </IconButton>
      <IconButton
        size="small"
        onClick={() => insertMarkdown(setText, text, "\n- ", "")}
        title="箇条書き"
      >
        <FormatListBulletedIcon fontSize="small" />
      </IconButton>
      <IconButton
        size="small"
        onClick={() => insertMarkdown(setText, text, "\n1. ", "")}
        title="番号付きリスト"
      >
        <FormatListNumberedIcon fontSize="small" />
      </IconButton>
      <IconButton
        size="small"
        onClick={() => insertMarkdown(setText, text, "\n```\n", "\n```")}
        title="コードブロック"
      >
        <CodeIcon fontSize="small" />
      </IconButton>
    </Toolbar>
  );

  const renderSide = (
    label: string,
    text: string,
    setText: (v: string) => void,
    imageId: string | null,
    onFileSelect: (f: File | null) => void,
    onImageRemove: () => void,
    tab: number,
    setTab: (v: number) => void
  ) => (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        {label}
      </Typography>
      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 1 }}>
        <Tab label="編集" sx={{ minWidth: 80 }} />
        <Tab label="プレビュー" sx={{ minWidth: 80 }} />
      </Tabs>
      {tab === 0 ? (
        <>
          {renderMarkdownToolbar(text, setText)}
          <TextField
            multiline
            minRows={4}
            maxRows={12}
            fullWidth
            placeholder="Markdown で入力..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            sx={{ "& .MuiInputBase-root": { fontFamily: "monospace" } }}
          />
        </>
      ) : (
        <Box
          sx={{
            minHeight: 120,
            p: 1,
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 1,
          }}
        >
          {text ? (
            <MarkdownPreview content={text} />
          ) : (
            <Typography color="text.secondary" variant="body2">
              テキストを入力するとプレビューが表示されます
            </Typography>
          )}
        </Box>
      )}
      <Box sx={{ mt: 1 }}>
        <ImageUpload
          imageId={imageId}
          onFileSelect={onFileSelect}
          onRemove={onImageRemove}
        />
      </Box>
    </Paper>
  );

  return (
    <Box>
      {/* デッキ選択 */}
      <TextField
        select
        fullWidth
        label="デッキ"
        value={deckId}
        onChange={(e) => setDeckId(e.target.value)}
        sx={{ mb: 2 }}
      >
        {decks.map((d) => (
          <MenuItem key={d.id} value={d.id}>
            {d.name}
          </MenuItem>
        ))}
      </TextField>

      <Stack spacing={2}>
        {/* 表面 */}
        {renderSide(
          "表面（問題）",
          frontText,
          setFrontText,
          frontImageId,
          setNewFrontImage,
          () => {
            if (frontImageId) deleteImage(frontImageId);
            setFrontImageId(null);
          },
          frontTab,
          setFrontTab
        )}

        {/* 裏面 */}
        {renderSide(
          "裏面（答え）",
          backText,
          setBackText,
          backImageId,
          setNewBackImage,
          () => {
            if (backImageId) deleteImage(backImageId);
            setBackImageId(null);
          },
          backTab,
          setBackTab
        )}
      </Stack>

      {/* アクションボタン */}
      <Stack
        direction="row"
        spacing={1}
        justifyContent="flex-end"
        sx={{ mt: 2 }}
      >
        {onCancel && (
          <Button onClick={onCancel} color="inherit">
            キャンセル
          </Button>
        )}
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={
            !deckId || (!frontText.trim() && !frontImageId && !newFrontImage)
          }
        >
          {existingCard ? "更新" : "保存"}
        </Button>
      </Stack>
    </Box>
  );
}
