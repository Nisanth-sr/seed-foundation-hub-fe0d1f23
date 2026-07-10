import { createFileRoute, Outlet } from "@tanstack/react-router";
import { CareerAuthProvider } from "@/lib/career-auth";
import { CareerI18nProvider } from "@/lib/career-i18n";
import { CareerThemeProvider } from "@/lib/career-theme";
import { CareerShell } from "@/components/career/CareerShell";

export const Route = createFileRoute("/career")({
  ssr: false,
  component: CareerLayout,
});

function CareerLayout() {
  return (
    <CareerThemeProvider>
      <CareerI18nProvider>
        <CareerAuthProvider>
          <CareerShell>
            <Outlet />
          </CareerShell>
        </CareerAuthProvider>
      </CareerI18nProvider>
    </CareerThemeProvider>
  );
}
