import { Loader2, RefreshCw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { AnalysisResult } from "@/lib/admin-analysis-prompt.server";

type AnalysisData = {
  model: string;
  promptVersion: string;
  analysis: AnalysisResult;
  createdAt: string;
  updatedAt: string;
};

type Props = {
  analysis: AnalysisData | null;
  generating: boolean;
  onGenerate: () => void;
};

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="text-sm leading-relaxed text-muted-foreground">{children}</CardContent>
    </Card>
  );
}

export function AdminAiAnalysisPanel({ analysis, generating, onGenerate }: Props) {
  const data = analysis?.analysis;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">AI Personality Analysis</h2>
          {analysis && (
            <p className="text-xs text-muted-foreground">
              Model: {analysis.model} · Updated {new Date(analysis.updatedAt).toLocaleString()}
            </p>
          )}
        </div>
        <Button onClick={onGenerate} disabled={generating}>
          {generating ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : data ? (
            <RefreshCw className="mr-2 h-4 w-4" />
          ) : (
            <Sparkles className="mr-2 h-4 w-4" />
          )}
          {data ? "Regenerate" : "Generate Analysis"}
        </Button>
      </div>

      {!data && !generating && (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            No AI analysis yet. Click Generate to create a comprehensive personality and career report via OpenRouter.
          </CardContent>
        </Card>
      )}

      {generating && (
        <Card>
          <CardContent className="flex items-center justify-center gap-2 py-10 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            Generating analysis… this may take 30–60 seconds
          </CardContent>
        </Card>
      )}

      {data && !generating && (
        <div className="space-y-4">
          <Card className="border-primary/30 bg-primary/5">
            <CardHeader>
              <CardTitle>Executive Summary</CardTitle>
            </CardHeader>
            <CardContent className="whitespace-pre-wrap text-sm leading-relaxed">{data.summary}</CardContent>
          </Card>

          <Section title="Personality Profile">
            <div className="space-y-3">
              {Object.entries(data.personalityProfile).map(([key, value]) => (
                <div key={key}>
                  <p className="font-medium capitalize text-foreground">{key.replace(/([A-Z])/g, " $1")}</p>
                  <p>{value}</p>
                </div>
              ))}
            </div>
          </Section>

          <Section title="Behavioral Patterns">
            <ul className="list-disc pl-5 space-y-1">
              {data.behavioralPatterns.map((p, i) => (
                <li key={i}>{p}</li>
              ))}
            </ul>
          </Section>

          <div className="grid gap-4 sm:grid-cols-2">
            <Section title="Strengths">
              <ul className="list-disc pl-5 space-y-1">
                {data.strengths.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </Section>
            <Section title="Growth Areas">
              <ul className="list-disc pl-5 space-y-1">
                {data.growthAreas.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </Section>
          </div>

          <Section title="Work Style">{data.workStyle}</Section>
          <Section title="Team & Social Dynamics">{data.teamAndSocial}</Section>
          <Section title="Stress & Resilience">{data.stressAndResilience}</Section>
          <Section title="Career Guidance">{data.careerGuidance}</Section>

          <Section title="Recommended Paths">
            <ul className="list-disc pl-5 space-y-1">
              {data.recommendedPaths.map((p, i) => (
                <li key={i}>{p}</li>
              ))}
            </ul>
          </Section>

          <Section title="Counselor Notes">{data.counselorNotes}</Section>

          <Card>
            <CardContent className="py-4">
              <CardDescription className="text-xs italic">{data.disclaimer}</CardDescription>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
