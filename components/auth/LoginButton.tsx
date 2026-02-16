"use client";

import { Button, Stack } from "@mui/material";
import { signIn } from "next-auth/react";
import GoogleIcon from "@mui/icons-material/Google";
import { useState } from "react";
import { toast } from "react-hot-toast";

export default function LoginButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (provider: "google" | "github") => {
    setIsLoading(true);
    try {
      await signIn(provider, { callbackUrl: "/" });
    } catch (error) {
      console.error(error);
      toast.error("ログインに失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Stack spacing={2} direction="column" sx={{ maxWidth: 300, margin: "auto" }}>
      <Button
        variant="outlined"
        startIcon={<GoogleIcon />}
        onClick={() => handleLogin("google")}
        disabled={isLoading}
        fullWidth
      >
        Google でログイン
      </Button>
    </Stack>
  );
}
