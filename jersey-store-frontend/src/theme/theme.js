// src/theme/theme.js

import { createTheme } from "@mui/material/styles";

// Define the grey, black, and white pastel theme
const theme = createTheme({
  palette: {
    primary: {
      main: "#6D6D6D", // Grey
    },
    secondary: {
      main: "#B3B3B3", // Light grey
    },
    background: {
      default: "#F5F5F5", // White pastel
      paper: "#E0E0E0",   // Slightly darker grey
    },
    text: {
      primary: "#212121", // Black
      secondary: "#757575", // Dark grey
    },
  },
  typography: {
    fontFamily: "Roboto, Arial, sans-serif",
    h1: {
      fontSize: "2rem",
      fontWeight: 500,
      color: "#212121",
    },
    body1: {
      fontSize: "1rem",
      color: "#6D6D6D",
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: "12px", // Smooth rounded corners
          textTransform: "none", // Disable uppercase text
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: "16px",
          boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.1)",
        },
      },
    },
  },
});

export default theme;
