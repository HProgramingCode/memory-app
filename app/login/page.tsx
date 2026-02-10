import { Box, Typography, Container } from "@mui/material";
import LoginButton from "@/components/auth/LoginButton";

export default function LoginPage() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "#f8fafc",
      }}
    >
      <Container maxWidth="sm">
        <Box
          sx={{
            p: { xs: 4, sm: 5 },
            width: "100%",
            textAlign: "center",
            borderRadius: 5,
            bgcolor: "#fff",
            border: "1px solid rgba(0, 0, 0, 0.06)",
            boxShadow: "0 4px 24px rgba(0, 0, 0, 0.06)",
            animation: "fadeInUp 0.5s ease-out",
          }}
        >
          <Box
            sx={{
              display: "inline-flex",
              p: 2,
              borderRadius: 3,
              bgcolor: "rgba(99, 102, 241, 0.06)",
              mb: 3,
            }}
          >
            <Typography sx={{ fontSize: 32 }}>🧠</Typography>
          </Box>

          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            sx={{
              fontWeight: 900,
              color: "#4338ca",
              letterSpacing: "-0.02em",
            }}
          >
            Memory App
          </Typography>
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ mb: 4, lineHeight: 1.8 }}
          >
            忘却曲線ベースのスマート復習で
            <br />
            学習効率を最大化しましょう
          </Typography>
          <LoginButton />
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: "block", mt: 3, opacity: 0.6 }}
          >
            Google アカウントで安全にログイン
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
