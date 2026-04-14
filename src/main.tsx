import { StrictMode } from "react";

import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";

import { queryClient } from "./lib/queryClient.ts";
import router from "./routes";
import { AuthInitializer } from "@/components/auth/AuthInitializer.tsx";
import { Toaster } from "@/components/ui/toaster.tsx";
import { ThemeProvider } from "@/contexts/ThemeContext";
import "./index.css";

const ThemedApp = () => {
  return (
    <>
      <RouterProvider router={router} />
      <Toaster />
    </>
  );
};

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthInitializer>
        <ThemeProvider initialValue="light">
          <ThemedApp />
        </ThemeProvider>
      </AuthInitializer>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </StrictMode>
);
