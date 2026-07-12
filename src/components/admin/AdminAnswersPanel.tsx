import { BIG_FIVE_QUESTIONS, RIASEC_QUESTIONS } from "@/lib/career-questions";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { UserDetail } from "@/lib/admin.server";

const SCALE = ["Strongly disagree", "Disagree", "Neutral", "Agree", "Strongly agree"];

type Props = {
  bigFiveAnswers: UserDetail["bigFive"]["answers"];
  riasecAnswers: UserDetail["riasec"]["answers"];
};

function AnswerList({
  answers,
  questions,
}: {
  answers: Record<string, number>;
  questions: Array<{ id: string; en: string }>;
}) {
  return (
    <div className="space-y-2">
      {questions.map((q) => {
        const val = answers[q.id];
        return (
          <div key={q.id} className="rounded-md border border-border/60 p-3 text-sm">
            <p className="font-medium">{q.en}</p>
            <p className="mt-1 text-muted-foreground">
              {typeof val === "number" ? `${val}/5 — ${SCALE[val - 1] ?? ""}` : "Not answered"}
            </p>
          </div>
        );
      })}
    </div>
  );
}

export function AdminAnswersPanel({ bigFiveAnswers, riasecAnswers }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Raw Assessment Answers</CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="bigfive">
            <AccordionTrigger>Big Five ({BIG_FIVE_QUESTIONS.length} questions)</AccordionTrigger>
            <AccordionContent>
              <AnswerList answers={bigFiveAnswers} questions={BIG_FIVE_QUESTIONS} />
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="riasec">
            <AccordionTrigger>RIASEC ({RIASEC_QUESTIONS.length} questions)</AccordionTrigger>
            <AccordionContent>
              <AnswerList answers={riasecAnswers} questions={RIASEC_QUESTIONS} />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}
