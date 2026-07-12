import { createFileRoute, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { z } from "zod";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminLogin } from "@/components/admin/AdminLogin";
import { AdminUserTable } from "@/components/admin/AdminUserTable";
import { AdminUserDetail } from "@/components/admin/AdminUserDetail";
import {
  adminLogin,
  adminLogout,
  adminCheckSession,
  adminListCompletedUsers,
  adminGetUserDetail,
  adminGenerateAnalysis,
} from "@/lib/admin.functions";
import type { CompletedUserSummary, UserDetail } from "@/lib/admin.server";
import type { AnalysisResult } from "@/lib/admin-analysis-prompt.server";

const searchSchema = z.object({
  user: z.string().uuid().optional(),
});

export const Route = createFileRoute("/internal/$slug")({
  ssr: false,
  validateSearch: (s) => searchSchema.parse(s),
  beforeLoad: ({ params }) => {
    const expected = import.meta.env.VITE_ADMIN_CONSOLE_PATH;
    if (!expected || params.slug !== expected) throw notFound();
  },
  head: () => ({
    meta: [{ name: "robots", content: "noindex, nofollow" }],
  }),
  component: AdminConsolePage,
});

type AnalysisData = {
  model: string;
  promptVersion: string;
  analysis: AnalysisResult;
  createdAt: string;
  updatedAt: string;
};

function AdminConsolePage() {
  const { user: userId } = Route.useSearch();
  const navigate = Route.useNavigate();

  const [checking, setChecking] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const [users, setUsers] = useState<CompletedUserSummary[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const [detail, setDetail] = useState<UserDetail | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    adminCheckSession()
      .then((r) => setAuthenticated(r.authenticated))
      .finally(() => setChecking(false));
  }, []);

  useEffect(() => {
    if (!authenticated || userId) return;
    setLoadingUsers(true);
    adminListCompletedUsers()
      .then((r) => setUsers(r.users))
      .catch(console.error)
      .finally(() => setLoadingUsers(false));
  }, [authenticated, userId]);

  useEffect(() => {
    if (!authenticated || !userId) {
      setDetail(null);
      setAnalysis(null);
      return;
    }
    setLoadingDetail(true);
    adminGetUserDetail({ data: { userId } })
      .then((r) => {
        setDetail(r.detail);
        setAnalysis(r.detail.analysis);
      })
      .catch(console.error)
      .finally(() => setLoadingDetail(false));
  }, [authenticated, userId]);

  async function handleLogin(password: string) {
    setLoginError(null);
    try {
      await adminLogin({ data: { password } });
      setAuthenticated(true);
    } catch (e) {
      setLoginError(e instanceof Error ? e.message : "Login failed");
    }
  }

  async function handleLogout() {
    try {
      await adminLogout();
    } catch {
      // ignore
    }
    setAuthenticated(false);
    setUsers([]);
    setDetail(null);
    navigate({ search: {} });
  }

  function selectUser(id: string) {
    navigate({ search: { user: id } });
  }

  function goBack() {
    navigate({ search: {} });
  }

  async function handleGenerateAnalysis() {
    if (!userId) return;
    setGenerating(true);
    try {
      const r = await adminGenerateAnalysis({ data: { userId } });
      setAnalysis(r.analysis as AnalysisData);
      if (detail) setDetail({ ...detail, analysis: r.analysis as AnalysisData });
    } catch (e) {
      console.error(e);
      alert(e instanceof Error ? e.message : "Failed to generate analysis");
    } finally {
      setGenerating(false);
    }
  }

  if (checking) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!authenticated) {
    return <AdminLogin onLogin={handleLogin} error={loginError} />;
  }

  return (
    <AdminShell onLogout={handleLogout}>
      {userId ? (
        detail ? (
          <AdminUserDetail
            detail={detail}
            analysis={analysis}
            generating={generating}
            loading={loadingDetail}
            onBack={goBack}
            onGenerateAnalysis={handleGenerateAnalysis}
          />
        ) : (
          <div className="flex min-h-[40dvh] items-center justify-center">
            {loadingDetail ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : (
              <p className="text-muted-foreground">User not found</p>
            )}
          </div>
        )
      ) : loadingUsers ? (
        <div className="flex min-h-[40dvh] items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <AdminUserTable users={users} onSelectUser={selectUser} />
      )}
    </AdminShell>
  );
}
