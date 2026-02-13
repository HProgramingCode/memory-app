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
import LogoutButton from "../auth/LogoutButton";

/**
 * 共通レイアウト（フロストヘッダー + クリーン背景）
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
              fontWeight: 800,
              cursor: "pointer",
              color: "primary.main",
              letterSpacing: "-0.02em",
            }}
            onClick={() => router.push("/")}
          >
            Memory App
          </Typography>
          <LogoutButton />
          <IconButton
            sx={{
              color: "text.secondary",
              transition: "all 0.2s ease",
              "&:hover": {
                color: "primary.main",
                transform: "rotate(90deg)",
              },
            }}
            onClick={() => router.push("/settings")}
            aria-label="設定"
          >
            <SettingsIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <Container
        maxWidth="lg"
        sx={{
          py: { xs: 2, md: 3 },
          animation: "fadeInUp 0.4s ease-out",
        }}
      >
        {children}
      </Container>
    </Box>
  );
}
