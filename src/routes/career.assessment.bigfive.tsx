import { createFileRoute } from "@tanstack/react-router";
import { AssessmentRunner } from "@/components/career/AssessmentRunner";
import { BIG_FIVE_QUESTIONS } from "@/lib/career-questions";
import { useI18n } from "@/lib/career-i18n";

export const Route = createFileRoute("/career/assessment/bigfive")({
  component: BigFivePage,
});

function BigFivePage() {
  const { t } = useI18n();
  return (
    <AssessmentRunner
      type="bigfive"
      title={t("assess.bigfive.title")}
      intro={t("assess.bigfive.intro")}
      questions={BIG_FIVE_QUESTIONS}
    />
  );
}
