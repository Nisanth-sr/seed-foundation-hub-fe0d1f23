import Link from "next/link";
import { useRouter } from "next/navigation";
import { Brain, LogOut, Moon, Sun, Globe } from "lucide-react";
import { useCareerAuth } from "@/lib/career-auth";
import { useI18n, type Locale } from "@/lib/career-i18n";
import { useCareerTheme } from "@/lib/career-theme";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import type { ReactNode } from "react";

export function CareerHeader() {
  const { user, signOut } = useCareerAuth();
  const { locale, setLocale, t } = useI18n();
  const { theme, toggle } = useCareerTheme();
  const router = useRouter();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/career" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/60 text-primary-foreground">
            <Brain className="h-5 w-5" />
          </div>
          <span className="font-semibold tracking-tight">{t("brand")}</span>
        </Link>

        <div className="flex items-center gap-1 sm:gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2">
                <Globe className="h-4 w-4" />
                <span className="text-xs font-medium uppercase">{locale}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {(["en", "ta"] as Locale[]).map((l) => (
                <DropdownMenuItem key={l} onClick={() => setLocale(l)}>
                  {l === "en" ? t("lang.english") : t("lang.tamil")}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="ghost" size="icon" onClick={toggle} aria-label={t("theme.toggle")}>
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>

          {user ? (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/career/dashboard">{t("nav.dashboard")}</Link>
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/career/profile">{t("nav.profile")}</Link>
              </Button>
              <Button variant="ghost" size="icon" onClick={async () => { await signOut(); router.push("/career"); }} aria-label={t("nav.signout")}>
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <Button size="sm" asChild>
              <Link href="/career/auth">{t("nav.signin")}</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}

export function CareerShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <CareerHeader />
      <main>{children}</main>
    </div>
  );
}
