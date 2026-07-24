import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useState } from "react";
import { Loader2, ShieldCheck, Sparkles, ArrowLeft, RefreshCw, CheckCircle2, XCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCareerAuth } from "@/lib/career-auth";
import {
  listAssessmentUsers,
  getUserDetail,
  analyzeUser,
  type AdminUserRow,
  type AdminUserDetail,
} from "@/lib/admin.functions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/career/admin-console-x7k2p9")({
  component: AdminConsole,
});

const FREE_MODELS = [
  "meta-llama/llama-3.3-70b-instruct:free",
  "google/gemini-2.0-flash-exp:free",
  "deepseek/deepseek-chat-v3.1:free",
  "qwen/qwen-2.5-72b-instruct:free",
  "mistralai/mistral-small-3.2-24b-instruct:free",
];

function AdminConsole() {
  const { user, loading } = useCareerAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [rows, setRows] = useState<AdminUserRow[]>([]);
  const [fetching, setFetching] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [onlyCompleted, setOnlyCompleted] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);

  const listFn = useServerFn(listAssessmentUsers);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/career/auth" });
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("is_admin")
        .eq("id", user.id)
        .maybeSingle();
      setIsAdmin(!!data?.is_admin);
    })();
  }, [user]);

  const load = async () => {
    setFetching(true);
    setErr(null);
    try {
      const data = await listFn();
      setRows(data);
    } catch (e: any) {
      setErr(e?.message ?? "Failed to load");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    if (isAdmin) load();
  }, [isAdmin]);

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (onlyCompleted && !(r.bigfive_status === "completed" && r.riasec_status === "completed"))
        return false;
      if (!q) return true;
      const s = q.toLowerCase();
      return (
        (r.email ?? "").toLowerCase().includes(s) ||
        (r.display_name ?? "").toLowerCase().includes(s)
      );
    });
  }, [rows, q, onlyCompleted]);

  if (loading || isAdmin === null) {
    return (
      <div className="flex min-h-[60dvh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <ShieldCheck className="mx-auto mb-4 h-10 w-10 text-muted-foreground" />
        <h1 className="text-2xl font-semibold">Admin access required</h1>
        <p className="mt-2 text-muted-foreground">
          Your account does not have admin privileges.
        </p>
        <Button className="mt-6" variant="outline" onClick={() => navigate({ to: "/career/dashboard" })}>
          Back to dashboard
        </Button>
      </div>
    );
  }

  if (selected) {
    return <UserDetailView userId={selected} onBack={() => setSelected(null)} />;
  }

  const completedCount = rows.filter(
    (r) => r.bigfive_status === "completed" && r.riasec_status === "completed",
  ).length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
            <ShieldCheck className="h-3.5 w-3.5" /> Admin Console
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Assessment Users</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {rows.length} total user{rows.length === 1 ? "" : "s"} · {completedCount} completed both
            assessments
          </p>
        </div>
        <Button variant="outline" onClick={load} disabled={fetching}>
          <RefreshCw className={`mr-2 h-4 w-4 ${fetching ? "animate-spin" : ""}`} /> Refresh
        </Button>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Input
          placeholder="Search email or name…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="max-w-sm"
        />
        <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
          <input
            type="checkbox"
            checked={onlyCompleted}
            onChange={(e) => setOnlyCompleted(e.target.checked)}
            className="h-4 w-4 accent-primary"
          />
          Only users who completed both
        </label>
      </div>

      {err && (
        <Card className="mb-4 border-destructive/40 bg-destructive/5">
          <CardContent className="pt-6 text-sm text-destructive">{err}</CardContent>
        </Card>
      )}

      {fetching ? (
        <div className="flex items-center gap-2 py-12 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading users…
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            No users match your filters.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Big Five</th>
                  <th className="px-4 py-3">RIASEC</th>
                  <th className="px-4 py-3">Joined</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.user_id} className="border-b last:border-0 hover:bg-muted/30">
                    <td className="px-4 py-3">
                      <div className="font-medium">{r.display_name ?? "—"}</div>
                      <div className="text-xs text-muted-foreground">{r.email}</div>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={r.bigfive_status} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={r.riasec_status} />
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {new Date(r.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button size="sm" variant="ghost" onClick={() => setSelected(r.user_id)}>
                        View
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  if (status === "completed")
    return (
      <Badge variant="default" className="bg-primary/15 text-primary hover:bg-primary/15">
        <CheckCircle2 className="mr-1 h-3 w-3" /> Completed
      </Badge>
    );
  if (status === "in_progress")
    return <Badge variant="secondary">In progress</Badge>;
  return (
    <Badge variant="outline" className="text-muted-foreground">
      <XCircle className="mr-1 h-3 w-3" /> Not started
    </Badge>
  );
}

function UserDetailView({ userId, onBack }: { userId: string; onBack: () => void }) {
  const [detail, setDetail] = useState<AdminUserDetail | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [model, setModel] = useState(FREE_MODELS[0]);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  const detailFn = useServerFn(getUserDetail);
  const analyzeFn = useServerFn(analyzeUser);

  useEffect(() => {
    (async () => {
      try {
        const d = await detailFn({ data: { userId } });
        setDetail(d);
      } catch (e: any) {
        setErr(e?.message ?? "Failed");
      }
    })();
  }, [userId]);

  const runAnalysis = async () => {
    setAnalyzing(true);
    setErr(null);
    setAnalysis(null);
    try {
      const res = await analyzeFn({ data: { userId, model } });
      setAnalysis(res.analysis);
    } catch (e: any) {
      setErr(e?.message ?? "Analysis failed");
    } finally {
      setAnalyzing(false);
    }
  };

  if (!detail && !err) {
    return (
      <div className="flex min-h-[50dvh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <Button variant="ghost" onClick={onBack} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to list
      </Button>

      {err && (
        <Card className="mb-4 border-destructive/40 bg-destructive/5">
          <CardContent className="pt-6 text-sm text-destructive whitespace-pre-wrap">{err}</CardContent>
        </Card>
      )}

      {detail && (
        <>
          <div className="mb-6">
            <h1 className="text-2xl font-bold">{detail.display_name ?? "Unnamed user"}</h1>
            <p className="text-sm text-muted-foreground">
              {detail.email} · Joined {new Date(detail.created_at).toLocaleDateString()}
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <ScoresCard title="Big Five Personality" data={detail.bigfive} labels={BF_LABELS} />
            <ScoresCard title="RIASEC Interests" data={detail.riasec} labels={RI_LABELS} />
          </div>

          {detail.saved_careers.length > 0 && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="text-base">Saved careers</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {detail.saved_careers.map((s) => (
                  <Badge key={s.career_key} variant="secondary">
                    {s.career_key}
                  </Badge>
                ))}
              </CardContent>
            </Card>
          )}

          <Card className="mt-6 border-primary/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Sparkles className="h-4 w-4 text-primary" /> AI Personality & Career Analysis
              </CardTitle>
              <CardDescription>
                Runs on OpenRouter free models using the full assessment data.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <Select value={model} onValueChange={setModel}>
                  <SelectTrigger className="w-[340px] max-w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FREE_MODELS.map((m) => (
                      <SelectItem key={m} value={m}>
                        {m}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  onClick={runAnalysis}
                  disabled={
                    analyzing ||
                    detail.bigfive?.status !== "completed" ||
                    detail.riasec?.status !== "completed"
                  }
                >
                  {analyzing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating…
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" /> Generate analysis
                    </>
                  )}
                </Button>
              </div>

              {detail.bigfive?.status !== "completed" || detail.riasec?.status !== "completed" ? (
                <p className="text-xs text-muted-foreground">
                  This user has not completed both assessments yet.
                </p>
              ) : null}

              {analysis && (
                <div
                  className="prose prose-sm dark:prose-invert max-w-none rounded-lg border bg-muted/30 p-4"
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(analysis) }}
                />
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

const BF_LABELS: Record<string, string> = {
  O: "Openness",
  C: "Conscientiousness",
  E: "Extraversion",
  A: "Agreeableness",
  N: "Emotional Stability",
};
const RI_LABELS: Record<string, string> = {
  R: "Realistic",
  I: "Investigative",
  A: "Artistic",
  S: "Social",
  E: "Enterprising",
  C: "Conventional",
};

function ScoresCard({
  title,
  data,
  labels,
}: {
  title: string;
  data: any;
  labels: Record<string, string>;
}) {
  const scores = (data?.scores ?? {}) as Record<string, number>;
  const status = data?.status ?? "not_started";
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-base">
          <span>{title}</span>
          <StatusBadge status={status} />
        </CardTitle>
        {data?.completed_at && (
          <CardDescription>
            Completed {new Date(data.completed_at).toLocaleString()}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-2">
        {Object.keys(labels).map((k) => {
          const v = scores[k] ?? 0;
          return (
            <div key={k}>
              <div className="mb-1 flex justify-between text-xs">
                <span className="text-muted-foreground">{labels[k]}</span>
                <span className="font-medium tabular-nums">{v}</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${Math.max(0, Math.min(100, v))}%` }}
                />
              </div>
            </div>
          );
        })}
        {status === "not_started" && (
          <p className="pt-2 text-xs text-muted-foreground">No data yet.</p>
        )}
      </CardContent>
    </Card>
  );
}

// Minimal safe markdown → HTML (headings, bold, italic, code, lists, paragraphs)
function renderMarkdown(md: string): string {
  const esc = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const lines = md.split("\n");
  const out: string[] = [];
  let inList = false;
  const closeList = () => {
    if (inList) {
      out.push("</ul>");
      inList = false;
    }
  };
  const inline = (s: string) =>
    esc(s)
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/\*([^*]+)\*/g, "<em>$1</em>");
  for (const raw of lines) {
    const line = raw.trimEnd();
    if (!line.trim()) {
      closeList();
      continue;
    }
    const h = /^(#{1,6})\s+(.*)$/.exec(line);
    if (h) {
      closeList();
      const level = h[1].length;
      out.push(`<h${level}>${inline(h[2])}</h${level}>`);
      continue;
    }
    if (/^[-*]\s+/.test(line)) {
      if (!inList) {
        out.push("<ul>");
        inList = true;
      }
      out.push(`<li>${inline(line.replace(/^[-*]\s+/, ""))}</li>`);
      continue;
    }
    closeList();
    out.push(`<p>${inline(line)}</p>`);
  }
  closeList();
  return out.join("\n");
}
