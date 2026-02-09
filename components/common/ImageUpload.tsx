"use client";

import { useRef, useState, useEffect } from "react";
import { Box, Button, IconButton, Typography } from "@mui/material";
import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import DeleteIcon from "@mui/icons-material/Delete";
import { IMAGE_CONSTRAINTS } from "@/types";
import { getImageUrl } from "@/lib/imageDb";

interface ImageUploadProps {
  /** 現在の画像ID（IndexedDB内） */
  imageId: string | null;
  /** 新たに選択されたファイル */
  onFileSelect: (file: File | null) => void;
  /** 既存画像の削除 */
  onRemove: () => void;
  label?: string;
}

/**
 * 画像アップロード + プレビューコンポーネント
 */
export default function ImageUpload({
  imageId,
  onFileSelect,
  onRemove,
  label = "画像を追加",
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 既存画像のプレビューを取得
  useEffect(() => {
    if (imageId) {
      getImageUrl(imageId).then((url) => setPreviewUrl(url));
    } else {
      setPreviewUrl(null);
    }
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [imageId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    // バリデーション: ファイルタイプ
    if (!IMAGE_CONSTRAINTS.allowedTypes.includes(file.type as never)) {
      setError("対応フォーマット: JPEG, PNG, GIF, WebP");
      return;
    }

    // バリデーション: ファイルサイズ
    if (file.size > IMAGE_CONSTRAINTS.maxSizeBytes) {
      setError("画像サイズは3MB以下にしてください");
      return;
    }

    // ローカルプレビュー
    const url = URL.createObjectURL(file);
    setLocalPreview(url);
    onFileSelect(file);
  };

  const handleRemove = () => {
    if (localPreview) URL.revokeObjectURL(localPreview);
    setLocalPreview(null);
    setPreviewUrl(null);
    onFileSelect(null);
    onRemove();
    if (inputRef.current) inputRef.current.value = "";
  };

  const displayUrl = localPreview || previewUrl;

  return (
    <Box>
      {displayUrl ? (
        <Box sx={{ position: "relative", display: "inline-block" }}>
          <Box
            component="img"
            src={displayUrl}
            alt="プレビュー"
            sx={{
              maxWidth: "100%",
              maxHeight: 200,
              borderRadius: 1,
              objectFit: "contain",
            }}
          />
          <IconButton
            size="small"
            onClick={handleRemove}
            sx={{
              position: "absolute",
              top: 4,
              right: 4,
              bgcolor: "rgba(0,0,0,0.5)",
              color: "white",
              "&:hover": { bgcolor: "rgba(0,0,0,0.7)" },
            }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      ) : (
        <Button
          variant="outlined"
          startIcon={<AddPhotoAlternateIcon />}
          onClick={() => inputRef.current?.click()}
          size="small"
        >
          {label}
        </Button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={IMAGE_CONSTRAINTS.allowedTypes.join(",")}
        onChange={handleFileChange}
        style={{ display: "none" }}
      />
      {error && (
        <Typography
          color="error"
          variant="caption"
          sx={{ display: "block", mt: 0.5 }}
        >
          {error}
        </Typography>
      )}
    </Box>
  );
}
