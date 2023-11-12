import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

declare module "@mui/material/styles" {
  interface Theme {
    creamy: string;
    deepBlue: string;
    orange: string;
    midnightNavy: string;
  }
  // allow configuration using `createTheme`
  interface ThemeOptions {
    creamy?: string;
    deepBlue?: string;
    orange?: string;
    midnightNavy?: string;
  }
}
const theme = createTheme({
  creamy: "#FBF3F2",
  deepBlue: "#1C768F",
  orange: "#FA991C",
  midnightNavy: "#032539",
});

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <CssBaseline />
      <ThemeProvider theme={theme}>
        <QueryClientProvider client={queryClient}>
          <App />
          <ReactQueryDevtools />
        </QueryClientProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
