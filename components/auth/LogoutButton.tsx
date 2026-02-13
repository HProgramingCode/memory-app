"use client";

import { Button, Stack } from "@mui/material";
import { signOut } from "next-auth/react";
import LogoutIcon from "@mui/icons-material/Logout";
import { useState } from "react";
import { toast } from "react-hot-toast";

export default function LogoutButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await signOut({ callbackUrl: "/" });
    } catch (error) {
      console.error(error);
      toast.error("ログアウトに失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Stack spacing={2} direction="column" sx={{ maxWidth: 300, margin: "auto" }}>
      <Button
        variant="outlined"
        color="error"
        startIcon={<LogoutIcon />}
        onClick={handleLogout}
        disabled={isLoading}
        fullWidth
      >
        ログアウト
      </Button>
    </Stack>
  );
}
