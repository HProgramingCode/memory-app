"use client";

import { useState, useEffect } from "react";
import { Box, Skeleton } from "@mui/material";
import { getImageUrl } from "@/lib/imageDb";

interface CardImageProps {
  imageId: string;
}

/**
 * IndexedDB から画像を取得して表示するコンポーネント
 */
export default function CardImage({ imageId }: CardImageProps) {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let revoke: string | null = null;
    getImageUrl(imageId)
      .then((u) => {
        setUrl(u);
        revoke = u;
      })
      .finally(() => setLoading(false));
    return () => {
      if (revoke) URL.revokeObjectURL(revoke);
    };
  }, [imageId]);

  if (loading) {
    return (
      <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 1 }} />
    );
  }

  if (!url) return null;

  return (
    <Box
      component="img"
      src={url}
      alt="カード画像"
      sx={{
        maxWidth: "100%",
        maxHeight: 400,
        borderRadius: 1,
        objectFit: "contain",
      }}
    />
  );
}
