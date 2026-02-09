"use client";

import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  IconButton,
  Box,
} from "@mui/material";
import SettingsIcon from "@mui/icons-material/Settings";
import { useRouter } from "next/navigation";

/**
 * 共通レイアウト（ヘッダー + メインコンテンツ領域）
 */
export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <AppBar position="sticky">
        <Toolbar>
          <Typography
            variant="h6"
            sx={{
              flexGrow: 1,
              color: "primary.main",
              fontWeight: 700,
              cursor: "pointer",
            }}
            onClick={() => router.push("/")}
          >
            Memory App
          </Typography>
          <IconButton
            color="default"
            onClick={() => router.push("/settings")}
            aria-label="設定"
          >
            <SettingsIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg" sx={{ py: 3 }}>
        {children}
      </Container>
    </Box>
  );
}
