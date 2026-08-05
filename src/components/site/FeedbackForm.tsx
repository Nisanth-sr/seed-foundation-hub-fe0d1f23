"use client";

import { type FormEvent, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { FEEDBACK_CATEGORIES } from "@/lib/feedback";
import { track } from "@/lib/analytics";

type FormState = "idle" | "submitting" | "success";

const empty = {
  name: "",
  email: "",
  contact: "",
  category: "",
  feedback: "",
  website: "",
};

export function FeedbackForm() {
  const [state, setState] = useState<FormState>("idle");
  const [values, setValues] = useState(empty);

  function update(field: keyof typeof empty, value: string) {
    setValues((prev) => ({ ...prev, [field]: value }));
  }

  function resetForm() {
    setValues(empty);
    setState("idle");
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (state === "submitting") return;

    setState("submitting");
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };

      if (!res.ok) {
        throw new Error(data.error || "Could not submit feedback. Please try again.");
      }

      track("Feedback Submit", { category: values.category });
      setState("success");
    } catch (err) {
      setState("idle");
      toast.error(err instanceof Error ? err.message : "Could not submit feedback.");
    }
  }

  if (state === "success") {
    return (
      <div className="mx-auto max-w-lg border border-foreground bg-background p-8 text-center md:p-12">
        <div
          className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-3xl font-semibold text-primary-foreground"
          aria-hidden
        >
          ✓
        </div>
        <h2 className="text-2xl font-semibold">Thank you!</h2>
        <p className="mt-3 text-base leading-relaxed text-foreground/80">
          Your feedback has been submitted successfully.
        </p>
        <Button type="button" variant="outline" size="lg" className="mt-8" onClick={resetForm}>
          Submit another feedback
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="mx-auto max-w-lg space-y-5 border border-foreground bg-background p-6 md:p-8"
      noValidate
    >
      <h2 className="text-2xl font-semibold text-primary">Feedback</h2>

      <div>
        <label htmlFor="feedback-name" className="mb-1 block text-sm font-semibold text-primary">
          Your name
        </label>
        <input
          id="feedback-name"
          name="name"
          type="text"
          required
          autoComplete="name"
          placeholder="Enter your name"
          value={values.name}
          onChange={(e) => update("name", e.target.value)}
          className="h-11 w-full border border-foreground bg-background px-3 text-sm"
        />
      </div>

      <div>
        <label htmlFor="feedback-email" className="mb-1 block text-sm font-semibold text-primary">
          Email
        </label>
        <input
          id="feedback-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="Enter your email"
          value={values.email}
          onChange={(e) => update("email", e.target.value)}
          className="h-11 w-full border border-foreground bg-background px-3 text-sm"
        />
      </div>

      <div>
        <label htmlFor="feedback-contact" className="mb-1 block text-sm font-semibold text-primary">
          Contact No
        </label>
        <input
          id="feedback-contact"
          name="contact"
          type="tel"
          required
          autoComplete="tel"
          placeholder="Enter your contact number"
          value={values.contact}
          onChange={(e) => update("contact", e.target.value)}
          className="h-11 w-full border border-foreground bg-background px-3 text-sm"
        />
      </div>

      <div>
        <label htmlFor="feedback-category" className="mb-1 block text-sm font-semibold text-primary">
          Category
        </label>
        <select
          id="feedback-category"
          name="category"
          required
          value={values.category}
          onChange={(e) => update("category", e.target.value)}
          className="h-11 w-full border border-foreground bg-background px-3 text-sm font-medium text-primary"
        >
          <option value="">Select your category</option>
          {FEEDBACK_CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="feedback-message" className="mb-1 block text-sm font-semibold text-primary">
          Feedback
        </label>
        <textarea
          id="feedback-message"
          name="feedback"
          required
          rows={5}
          placeholder="Share your thoughts and feedback about the session..."
          value={values.feedback}
          onChange={(e) => update("feedback", e.target.value)}
          className="w-full border border-foreground bg-background px-3 py-2 text-sm"
        />
      </div>

      <input
        type="text"
        name="website"
        value={values.website}
        onChange={(e) => update("website", e.target.value)}
        className="hidden"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
      />

      <Button type="submit" variant="outline" size="lg" className="w-full" disabled={state === "submitting"}>
        {state === "submitting" ? "Submitting…" : "Submit"}
      </Button>
    </form>
  );
}
