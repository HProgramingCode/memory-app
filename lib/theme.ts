import { createTheme } from "@mui/material/styles";

/**
 * Memory App カスタムテーマ
 * 美学方向性: Clean Minimal + Warm Functional
 */
const theme = createTheme({
  palette: {
    primary: {
      main: "#5C6BC0",
      light: "#8E99A4",
      dark: "#3949AB",
    },
    success: {
      main: "#66BB6A",
    },
    warning: {
      main: "#FFA726",
    },
    error: {
      main: "#EF5350",
    },
    background: {
      default: "#FAFAFA",
      paper: "#FFFFFF",
    },
    text: {
      primary: "#212121",
      secondary: "#757575",
    },
  },
  typography: {
    fontFamily: '"Roboto", "Noto Sans JP", sans-serif',
    h4: {
      fontWeight: 700,
    },
    h5: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 600,
    },
    body1: {
      lineHeight: 1.6,
    },
    body2: {
      lineHeight: 1.6,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCard: {
      defaultProps: {
        elevation: 1,
      },
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: "none",
          borderRadius: 8,
          fontWeight: 600,
        },
      },
    },
    MuiAppBar: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          backgroundColor: "#FFFFFF",
          borderBottom: "1px solid #E0E0E0",
        },
      },
    },
  },
});

export default theme;
