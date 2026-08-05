import { FeedbackForm } from "@/components/site/FeedbackForm";
import { Section } from "@/components/site/Section";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Feedback",
  description: "Share your feedback with SEED Foundation. No account required.",
  path: "/feedback",
});

export default function FeedbackPage() {
  return (
    <Section
      title="Feedback"
      subtitle="Tell us what you thought about the session. Your response helps us improve."
      spacing="md"
      className="min-h-[70vh]"
    >
      <FeedbackForm />
    </Section>
  );
}
