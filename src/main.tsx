import { lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router/dom";
import { MutationCache, QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CssBaseline } from "@mui/material";
import { StyledEngineProvider, ThemeProvider } from "@mui/material/styles";
import { ToastProvider } from "@/context/ToastContext";
import ToastContainer from "@/components/layout/ToastContainer";
import RootErrorBoundary from "@/components/route/RootErrorBoundary";
import { getApiErrorMessage } from "@/lib/apiError";
import { emitToast } from "@/lib/toastEvents";
import { router } from "./router";
import appTheme from "./theme";
import "./index.css";

// Lazy load devtools in development
const ReactQueryDevtools = import.meta.env.DEV
  ? lazy(() =>
      import("@tanstack/react-query-devtools").then((d) => ({
        default: d.ReactQueryDevtools,
      }))
    )
  : () => null;

// Create a TanStack Query client
const queryClient = new QueryClient({
  mutationCache: new MutationCache({
    onError: (error) => {
      emitToast(getApiErrorMessage(error, "Unable to save changes. Please try again."), "error");
    },
  }),
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

createRoot(document.getElementById("root")!).render(
  // <StrictMode>
  <StyledEngineProvider injectFirst>
    <ThemeProvider theme={appTheme}>
      <CssBaseline />
      <ToastProvider>
        <RootErrorBoundary>
          <QueryClientProvider client={queryClient}>
            <RouterProvider router={router} />
            <ToastContainer />
            <Suspense fallback={null}>
              <ReactQueryDevtools initialIsOpen={false} />
            </Suspense>
          </QueryClientProvider>
        </RootErrorBoundary>
      </ToastProvider>
    </ThemeProvider>
  </StyledEngineProvider>
  // </StrictMode>
);
