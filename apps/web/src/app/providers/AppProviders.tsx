import type { PropsWithChildren } from "react";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "../../shared/api/queryClient";
import { AuthProvider } from "../../shared/auth/AuthProvider";
import { LocaleProvider } from "../../shared/i18n";
import { ThemeProvider } from "../../shared/theme";
import { AuthBootstrap } from "./AuthBootstrap";

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <ThemeProvider>
      <LocaleProvider>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <AuthBootstrap>{children}</AuthBootstrap>
          </AuthProvider>
        </QueryClientProvider>
      </LocaleProvider>
    </ThemeProvider>
  );
}
