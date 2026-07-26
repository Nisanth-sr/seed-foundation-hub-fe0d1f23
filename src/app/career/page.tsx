"use client";

import Link from "next/link";
import { Brain, Compass, Target, ArrowRight, Sparkles } from "lucide-react";
import { useI18n } from "@/lib/career-i18n";
import { useCareerAuth } from "@/lib/career-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function CareerLandingPage() {
  const { t } = useI18n();
  const { user } = useCareerAuth();

  const features = [
    { icon: Brain, key: "1" },
    { icon: Compass, key: "2" },
    { icon: Target, key: "3" },
  ] as const;

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24">
      <section className="mx-auto max-w-3xl text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5" />
          Big Five · RIASEC · AI Coach
        </div>
        <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-6xl">{t("landing.hero.title")}</h1>
        <p className="mt-6 text-lg text-muted-foreground">{t("landing.hero.subtitle")}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {user ? (
            <Button size="lg" asChild>
              <Link href="/career/dashboard">
                {t("nav.dashboard")} <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          ) : (
            <Button size="lg" asChild>
              <Link href="/career/auth">
                {t("landing.hero.cta")} <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          )}
        </div>
      </section>

      <section className="mt-20 grid gap-6 sm:grid-cols-3">
        {features.map((f) => (
          <Card key={f.key} className="border-border/60">
            <CardContent className="p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">{t(`landing.feature.${f.key}.title`)}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{t(`landing.feature.${f.key}.desc`)}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <p className="mt-16 text-center text-xs text-muted-foreground">{t("landing.privacy")}</p>
    </div>
  );
}
