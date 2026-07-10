import { createFileRoute } from "@tanstack/react-router";
import { AssessmentRunner } from "@/components/career/AssessmentRunner";
import { RIASEC_QUESTIONS } from "@/lib/career-questions";
import { useI18n } from "@/lib/career-i18n";

export const Route = createFileRoute("/career/assessment/riasec")({
  component: RiasecPage,
});

function RiasecPage() {
  const { t } = useI18n();
  return (
    <AssessmentRunner
      type="riasec"
      title={t("assess.riasec.title")}
      intro={t("assess.riasec.intro")}
      questions={RIASEC_QUESTIONS}
    />
  );
}
