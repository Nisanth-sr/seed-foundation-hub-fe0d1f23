import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { UserDetail } from "@/lib/admin.server";

type Props = {
  matches: UserDetail["careerMatches"];
  savedCareers: UserDetail["savedCareers"];
};

export function AdminCareerMatchesPanel({ matches, savedCareers }: Props) {
  return (
    <div className="space-y-4">
      {savedCareers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Saved Careers</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {savedCareers.map((s) => (
              <Badge key={s.careerKey} variant="secondary">
                {s.careerKey.replace(/_/g, " ")}
              </Badge>
            ))}
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {matches.map((m, i) => (
          <Card key={m.career.key}>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <CardTitle className="text-base">
                    <span className="mr-2 text-muted-foreground">#{i + 1}</span>
                    {m.career.title_en}
                  </CardTitle>
                  <CardDescription>{m.career.industry}</CardDescription>
                </div>
                <Badge variant="secondary" className="bg-primary/10 text-primary">
                  {m.score}% match
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <Progress value={m.score} />
              <ul className="list-disc pl-5 text-sm text-muted-foreground">
                {m.reasons.map((r, idx) => (
                  <li key={idx}>{r}</li>
                ))}
              </ul>
              <div className="grid gap-2 text-sm sm:grid-cols-3">
                <div>
                  <p className="text-xs text-muted-foreground">Salary</p>
                  <p className="font-medium">{m.career.salary_en}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Growth</p>
                  <p className="font-medium">{m.career.growth_en}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Education</p>
                  <p className="font-medium">{m.career.education_en}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
