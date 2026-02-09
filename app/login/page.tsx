import { Box, Typography, Container, Paper } from "@mui/material";
import LoginButton from "@/components/auth/LoginButton";

export default function LoginPage() {
  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            width: "100%",
            textAlign: "center",
            borderRadius: 2,
          }}
        >
          <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
            Memory App
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            ログインして学習を始めましょう
          </Typography>
          <LoginButton />
        </Paper>
      </Box>
    </Container>
  );
}
