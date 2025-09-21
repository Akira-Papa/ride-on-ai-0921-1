import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#5A3E85",
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: "#F3B431",
      contrastText: "#121212",
    },
    background: {
      default: "#121212",
      paper: "#1E1E1E",
    },
    text: {
      primary: "#FFFFFF",
      secondary: "#C7C7C7",
    },
  },
  typography: {
    fontFamily: "var(--font-body)",
    h1: {
      fontFamily: "var(--font-heading)",
      fontWeight: 700,
    },
    h2: {
      fontFamily: "var(--font-heading)",
      fontWeight: 700,
    },
    button: {
      textTransform: "none",
      fontWeight: 600,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 999,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: "#1E1E1E",
        },
      },
    },
  },
});
