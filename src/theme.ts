import { createTheme } from "@mui/material/styles";

const appTheme = createTheme({
  cssVariables: true,
  palette: {
    mode: "light",
    primary: {
      main: "#101828",
      light: "#344054",
      dark: "#0b1220",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#38bdf8",
      light: "#7dd3fc",
      dark: "#0369a1",
      contrastText: "#101828",
    },
    info: {
      main: "#0f766e",
    },
    success: {
      main: "#15803d",
    },
    warning: {
      main: "#d97706",
    },
    error: {
      main: "#b91c1c",
    },
    background: {
      default: "#f8fafc",
      paper: "#ffffff",
    },
    text: {
      primary: "#101828",
      secondary: "#64748b",
    },
    divider: "rgba(16, 24, 40, 0.1)",
  },
  shape: {
    borderRadius: 12,
  },
  typography: {
    fontFamily: '"Manrope", sans-serif',
    button: {
      fontWeight: 800,
      letterSpacing: "-0.01em",
      textTransform: "none",
    },
  },
  components: {
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 999,
          minHeight: 34,
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          backgroundColor: "#ffffff",
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "rgba(16, 24, 40, 0.38)",
            borderWidth: 1,
          },
        },
        notchedOutline: {
          borderColor: "rgba(16, 24, 40, 0.14)",
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          fontWeight: 700,
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          border: "1px solid rgba(16, 24, 40, 0.1)",
          borderRadius: 24,
          boxShadow: "0 24px 72px rgba(16, 24, 40, 0.2)",
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          fontWeight: 800,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        rounded: {
          borderRadius: 20,
        },
      },
    },
  },
});

export default appTheme;
