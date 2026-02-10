import { createTheme } from "@mui/material/styles";

/**
 * Memory App カスタムテーマ
 * 美学方向性: Clean Modern Light — Soft Indigo accent
 */
const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#6366f1",   // Indigo 500
      light: "#818cf8",  // Indigo 400
      dark: "#4f46e5",   // Indigo 600
    },
    secondary: {
      main: "#8b5cf6",   // Violet 500
      light: "#a78bfa",
      dark: "#7c3aed",
    },
    success: {
      main: "#10b981",   // Emerald 500
      light: "#34d399",
      dark: "#059669",
    },
    warning: {
      main: "#f59e0b",   // Amber 500
      light: "#fbbf24",
      dark: "#d97706",
    },
    error: {
      main: "#ef4444",   // Red 500
      light: "#f87171",
      dark: "#dc2626",
    },
    background: {
      default: "#f8fafc",  // Slate 50
      paper: "#ffffff",
    },
    text: {
      primary: "#1e293b",   // Slate 800
      secondary: "#64748b", // Slate 500
    },
    divider: "rgba(0, 0, 0, 0.06)",
  },
  typography: {
    fontFamily: '"Inter", "Noto Sans JP", sans-serif',
    h4: {
      fontWeight: 800,
      letterSpacing: "-0.02em",
    },
    h5: {
      fontWeight: 700,
      letterSpacing: "-0.01em",
    },
    h6: {
      fontWeight: 700,
    },
    subtitle2: {
      fontWeight: 600,
      letterSpacing: "0.03em",
      textTransform: "uppercase" as const,
      fontSize: "0.68rem",
      color: "#94a3b8",
    },
    body1: {
      lineHeight: 1.7,
    },
    body2: {
      lineHeight: 1.6,
    },
  },
  shape: {
    borderRadius: 16,
  },
  components: {
    MuiCard: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          borderRadius: 16,
          border: "1px solid rgba(0, 0, 0, 0.06)",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.03)",
          transition: "box-shadow 0.3s ease, transform 0.3s ease",
          "&:hover": {
            boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none" as const,
          borderRadius: 12,
          fontWeight: 700,
          letterSpacing: "0.01em",
          transition: "all 0.2s ease",
        },
        contained: {
          boxShadow: "0 2px 8px rgba(99, 102, 241, 0.25)",
          "&:hover": {
            boxShadow: "0 4px 16px rgba(99, 102, 241, 0.35)",
            transform: "translateY(-1px)",
          },
        },
        outlined: {
          borderColor: "rgba(0, 0, 0, 0.1)",
          "&:hover": {
            borderColor: "#6366f1",
            backgroundColor: "rgba(99, 102, 241, 0.04)",
          },
        },
      },
    },
    MuiAppBar: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          backgroundColor: "rgba(255, 255, 255, 0.85)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          borderBottom: "1px solid rgba(0, 0, 0, 0.06)",
          color: "#1e293b",
        },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          height: 6,
          backgroundColor: "rgba(0, 0, 0, 0.04)",
        },
        bar: {
          borderRadius: 8,
          background: "linear-gradient(90deg, #6366f1, #8b5cf6)",
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 20,
          boxShadow: "0 25px 50px rgba(0, 0, 0, 0.12)",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 600,
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          transition: "all 0.2s ease",
          "&:hover": {
            backgroundColor: "rgba(99, 102, 241, 0.04)",
          },
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 12,
          },
        },
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          borderRadius: 12,
          border: "1px solid rgba(0, 0, 0, 0.06)",
          boxShadow: "0 10px 40px rgba(0, 0, 0, 0.1)",
        },
      },
    },
  },
});

export default theme;
