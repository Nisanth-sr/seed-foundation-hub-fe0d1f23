"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { CareerAuthProvider } from "@/lib/career-auth";
import { CareerI18nProvider } from "@/lib/career-i18n";
import { CareerThemeProvider } from "@/lib/career-theme";
import { CareerShell } from "@/components/career/CareerShell";

export function CareerProviders({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <CareerThemeProvider>
        <CareerI18nProvider>
          <CareerAuthProvider>
            <CareerShell>{children}</CareerShell>
          </CareerAuthProvider>
        </CareerI18nProvider>
      </CareerThemeProvider>
    </QueryClientProvider>
  );
}
