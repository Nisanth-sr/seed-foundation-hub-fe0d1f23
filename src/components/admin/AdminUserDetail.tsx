import { ArrowLeft, Loader2, Mail, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AdminBigFivePanel } from "./AdminBigFivePanel";
import { AdminRiasecPanel } from "./AdminRiasecPanel";
import { AdminCareerMatchesPanel } from "./AdminCareerMatchesPanel";
import { AdminAnswersPanel } from "./AdminAnswersPanel";
import { AdminAiAnalysisPanel } from "./AdminAiAnalysisPanel";
import type { UserDetail } from "@/lib/admin.server";
import type { AnalysisResult } from "@/lib/admin-analysis-prompt.server";

type AnalysisData = {
  model: string;
  promptVersion: string;
  analysis: AnalysisResult;
  createdAt: string;
  updatedAt: string;
};

type Props = {
  detail: UserDetail;
  analysis: AnalysisData | null;
  generating: boolean;
  loading: boolean;
  onBack: () => void;
  onGenerateAnalysis: () => void;
};

function fmt(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleString();
}

export function AdminUserDetail({
  detail,
  analysis,
  generating,
  loading,
  onBack,
  onGenerateAnalysis,
}: Props) {
  if (loading) {
    return (
      <div className="flex min-h-[40dvh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const currentAnalysis = analysis ?? detail.analysis;

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" onClick={onBack}>
        <ArrowLeft className="mr-1 h-4 w-4" /> Back to list
      </Button>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <User className="h-5 w-5" />
                {detail.displayName}
              </CardTitle>
              <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                <Mail className="h-3.5 w-3.5" /> {detail.email}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">Locale: {detail.locale}</Badge>
              <Badge variant="outline" className="font-mono">
                Holland: {detail.riasec.hollandCode}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 text-sm sm:grid-cols-3">
            <div>
              <p className="text-muted-foreground">Profile created</p>
              <p className="font-medium">{fmt(detail.profileCreatedAt)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Account created</p>
              <p className="font-medium">{fmt(detail.authCreatedAt)}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Last sign in</p>
              <p className="font-medium">{fmt(detail.lastSignInAt)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="analysis">
        <TabsList className="flex h-auto flex-wrap">
          <TabsTrigger value="analysis">AI Analysis</TabsTrigger>
          <TabsTrigger value="bigfive">Big Five</TabsTrigger>
          <TabsTrigger value="riasec">RIASEC</TabsTrigger>
          <TabsTrigger value="careers">Career Matches</TabsTrigger>
          <TabsTrigger value="answers">Raw Answers</TabsTrigger>
        </TabsList>

        <TabsContent value="analysis" className="mt-4">
          <AdminAiAnalysisPanel
            analysis={currentAnalysis}
            generating={generating}
            onGenerate={onGenerateAnalysis}
          />
        </TabsContent>

        <TabsContent value="bigfive" className="mt-4">
          <AdminBigFivePanel bigFive={detail.bigFive} />
        </TabsContent>

        <TabsContent value="riasec" className="mt-4">
          <AdminRiasecPanel riasec={detail.riasec} />
        </TabsContent>

        <TabsContent value="careers" className="mt-4">
          <AdminCareerMatchesPanel matches={detail.careerMatches} savedCareers={detail.savedCareers} />
        </TabsContent>

        <TabsContent value="answers" className="mt-4">
          <AdminAnswersPanel
            bigFiveAnswers={detail.bigFive.answers}
            riasecAnswers={detail.riasec.answers}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
