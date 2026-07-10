import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useCareerAuth } from "@/lib/career-auth";
import { useI18n } from "@/lib/career-i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export const Route = createFileRoute("/career/auth")({
  component: AuthPage,
});

function AuthPage() {
  const { t } = useI18n();
  const { user, loading } = useCareerAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup" | "reset">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && user) navigate({ to: "/career/dashboard" });
  }, [user, loading, navigate]);

  async function onSignIn(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) toast.error(error.message);
    else navigate({ to: "/career/dashboard" });
  }

  async function onSignUp(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { display_name: name }, emailRedirectTo: `${window.location.origin}/career/auth` },
    });
    setBusy(false);
    if (error) toast.error(error.message);
    else {
      toast.success(t("auth.success.signup"));
      navigate({ to: "/career/dashboard" });
    }
  }

  async function onReset(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/career/reset-password`,
    });
    setBusy(false);
    if (error) toast.error(error.message);
    else toast.success(t("auth.reset.sent"));
  }

  async function onGoogle() {
    setBusy(true);
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/career/auth" });
    if (result.error) {
      setBusy(false);
      toast.error(result.error.message ?? t("auth.error.generic"));
      return;
    }
    if (result.redirected) return;
    navigate({ to: "/career/dashboard" });
  }

  return (
    <div className="mx-auto flex min-h-[calc(100dvh-4rem)] max-w-md items-center px-4 py-10 sm:px-6">
      <Card className="w-full">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl">{t("auth.title")}</CardTitle>
          <CardDescription>{t("auth.subtitle")}</CardDescription>
        </CardHeader>
        <CardContent>
          {mode === "reset" ? (
            <form onSubmit={onReset} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="rem">{t("auth.email")}</Label>
                <Input id="rem" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <Button type="submit" className="w-full" disabled={busy}>{t("auth.reset.send")}</Button>
              <button type="button" onClick={() => setMode("signin")} className="block w-full text-center text-sm text-muted-foreground hover:text-foreground">
                {t("auth.back")}
              </button>
            </form>
          ) : (
            <>
              <Button variant="outline" className="w-full" onClick={onGoogle} disabled={busy}>
                <GoogleIcon className="mr-2 h-4 w-4" /> {t("auth.google")}
              </Button>
              <div className="my-4 flex items-center gap-3 text-xs uppercase text-muted-foreground">
                <div className="h-px flex-1 bg-border" /> {t("auth.or")} <div className="h-px flex-1 bg-border" />
              </div>

              <Tabs value={mode} onValueChange={(v) => setMode(v as "signin" | "signup")}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="signin">{t("auth.tab.signin")}</TabsTrigger>
                  <TabsTrigger value="signup">{t("auth.tab.signup")}</TabsTrigger>
                </TabsList>
                <TabsContent value="signin" className="space-y-4 pt-4">
                  <form onSubmit={onSignIn} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="e1">{t("auth.email")}</Label>
                      <Input id="e1" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="p1">{t("auth.password")}</Label>
                        <button type="button" onClick={() => setMode("reset")} className="text-xs text-primary hover:underline">
                          {t("auth.forgot")}
                        </button>
                      </div>
                      <Input id="p1" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    </div>
                    <Button type="submit" className="w-full" disabled={busy}>{t("auth.submit.signin")}</Button>
                  </form>
                </TabsContent>
                <TabsContent value="signup" className="space-y-4 pt-4">
                  <form onSubmit={onSignUp} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="n1">{t("auth.name")}</Label>
                      <Input id="n1" value={name} onChange={(e) => setName(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="e2">{t("auth.email")}</Label>
                      <Input id="e2" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="p2">{t("auth.password")}</Label>
                      <Input id="p2" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
                    </div>
                    <Button type="submit" className="w-full" disabled={busy}>{t("auth.submit.signup")}</Button>
                  </form>
                </TabsContent>
              </Tabs>
            </>
          )}

          <div className="mt-6 text-center text-xs text-muted-foreground">
            <Link to="/career" className="hover:text-foreground">← {t("nav.home")}</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.75h3.57c2.08-1.92 3.28-4.74 3.28-8.07z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.75c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.12A6.6 6.6 0 0 1 5.48 12c0-.73.13-1.45.36-2.12V7.04H2.18a11 11 0 0 0 0 9.92l3.66-2.84z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1a11 11 0 0 0-9.82 6.04l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"/>
    </svg>
  );
}
