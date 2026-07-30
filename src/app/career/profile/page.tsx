"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import {
  AGE_RANGES,
  CURRENT_STATUSES,
  EDUCATION_LEVELS,
  parseLanguagesInput,
  type AgeRange,
  type CurrentStatus,
  type EducationLevel,
} from "@seed/career-core";
import { supabase } from "@/integrations/supabase/client";
import { useCareerAuth } from "@/lib/career-auth";
import { useI18n } from "@/lib/career-i18n";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const NONE = "__none__";

export default function ProfilePage() {
  const { user, loading } = useCareerAuth();
  const { t } = useI18n();
  const router = useRouter();

  const [fetching, setFetching] = useState(true);
  const [saving, setSaving] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [phone, setPhone] = useState("");
  const [ageRange, setAgeRange] = useState<string>(NONE);
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [educationLevel, setEducationLevel] = useState<string>(NONE);
  const [currentStatus, setCurrentStatus] = useState<string>(NONE);
  const [schoolOrCollege, setSchoolOrCollege] = useState("");
  const [languagesRaw, setLanguagesRaw] = useState("");

  useEffect(() => {
    if (!loading && !user) router.push("/career/auth");
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select(
          "display_name,phone,age_range,city,state,education_level,current_status,school_or_college,languages_spoken",
        )
        .eq("id", user.id)
        .maybeSingle();
      if (error) toast.error(error.message);
      if (data) {
        setDisplayName(data.display_name ?? "");
        setPhone(data.phone ?? "");
        setAgeRange(data.age_range ?? NONE);
        setCity(data.city ?? "");
        setState(data.state ?? "");
        setEducationLevel(data.education_level ?? NONE);
        setCurrentStatus(data.current_status ?? NONE);
        setSchoolOrCollege(data.school_or_college ?? "");
        setLanguagesRaw((data.languages_spoken ?? []).join(", "));
      } else {
        setDisplayName(user.email?.split("@")[0] ?? "");
      }
      setFetching(false);
    })();
  }, [user]);

  async function onSave(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        display_name: displayName.trim() || null,
        phone: phone.trim() || null,
        age_range: ageRange === NONE ? null : (ageRange as AgeRange),
        city: city.trim() || null,
        state: state.trim() || null,
        education_level: educationLevel === NONE ? null : (educationLevel as EducationLevel),
        current_status: currentStatus === NONE ? null : (currentStatus as CurrentStatus),
        school_or_college: schoolOrCollege.trim() || null,
        languages_spoken: parseLanguagesInput(languagesRaw),
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);
    setSaving(false);
    if (error) toast.error(error.message);
    else toast.success(t("profile.saved"));
  }

  if (loading || !user || fetching) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 sm:px-6">
      <Button variant="ghost" size="sm" className="mb-4 gap-2" asChild>
        <Link href="/career/dashboard">
          <ArrowLeft className="h-4 w-4" />
          {t("results.back")}
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>{t("profile.title")}</CardTitle>
          <CardDescription>{t("profile.subtitle")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSave} className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="displayName">{t("profile.displayName")}</Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                autoComplete="name"
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label>{t("auth.email")}</Label>
              <Input value={user.email ?? ""} disabled />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">{t("profile.phone")}</Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                autoComplete="tel"
                placeholder="+91 …"
              />
            </div>

            <div className="space-y-2">
              <Label>{t("profile.ageRange")}</Label>
              <Select value={ageRange} onValueChange={setAgeRange}>
                <SelectTrigger>
                  <SelectValue placeholder={t("profile.select")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE}>{t("profile.select")}</SelectItem>
                  {AGE_RANGES.map((v) => (
                    <SelectItem key={v} value={v}>
                      {t(`profile.age.${v}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">{t("profile.city")}</Label>
              <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} autoComplete="address-level2" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="state">{t("profile.state")}</Label>
              <Input id="state" value={state} onChange={(e) => setState(e.target.value)} autoComplete="address-level1" />
            </div>

            <div className="space-y-2">
              <Label>{t("profile.education")}</Label>
              <Select value={educationLevel} onValueChange={setEducationLevel}>
                <SelectTrigger>
                  <SelectValue placeholder={t("profile.select")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE}>{t("profile.select")}</SelectItem>
                  {EDUCATION_LEVELS.map((v) => (
                    <SelectItem key={v} value={v}>
                      {t(`profile.edu.${v}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t("profile.status")}</Label>
              <Select value={currentStatus} onValueChange={setCurrentStatus}>
                <SelectTrigger>
                  <SelectValue placeholder={t("profile.select")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE}>{t("profile.select")}</SelectItem>
                  {CURRENT_STATUSES.map((v) => (
                    <SelectItem key={v} value={v}>
                      {t(`profile.status.${v}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="school">{t("profile.school")}</Label>
              <Input
                id="school"
                value={schoolOrCollege}
                onChange={(e) => setSchoolOrCollege(e.target.value)}
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="languages">{t("profile.languages")}</Label>
              <Input
                id="languages"
                value={languagesRaw}
                onChange={(e) => setLanguagesRaw(e.target.value)}
                placeholder={t("profile.languages.hint")}
              />
              <p className="text-xs text-muted-foreground">{t("profile.languages.hint")}</p>
            </div>

            <div className="sm:col-span-2">
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t("profile.saving")}
                  </>
                ) : (
                  t("profile.save")
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
