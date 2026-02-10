"use client";

import { Box, Typography } from "@mui/material";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

/**
 * 空状態プレースホルダー — フレンドリーなデザイン
 */
export default function EmptyState({
  icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        py: 7,
        textAlign: "center",
        animation: "fadeInUp 0.4s ease-out",
      }}
    >
      <Box
        sx={{
          mb: 2.5,
          p: 2,
          borderRadius: "50%",
          bgcolor: "rgba(99, 102, 241, 0.06)",
          border: "1px solid rgba(99, 102, 241, 0.1)",
          animation: "float 4s ease-in-out infinite",
        }}
      >
        {icon || (
          <FolderOpenIcon
            sx={{ fontSize: 44, color: "rgba(99, 102, 241, 0.4)" }}
          />
        )}
      </Box>
      <Typography
        variant="h6"
        sx={{ fontWeight: 700, mb: 0.5, color: "text.primary" }}
      >
        {title}
      </Typography>
      {description && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ mb: 2, maxWidth: 280 }}
        >
          {description}
        </Typography>
      )}
      {action}
    </Box>
  );
}
