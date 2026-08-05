import { z } from "zod";

export const FEEDBACK_CATEGORIES = [
  { value: "student", label: "Student" },
  { value: "employee", label: "Employee" },
  { value: "healthcare", label: "Healthcare professional" },
  { value: "educator", label: "Educator" },
  { value: "volunteer", label: "Volunteer" },
  { value: "other", label: "Other" },
] as const;

export const feedbackCategoryValues = FEEDBACK_CATEGORIES.map((c) => c.value);

export const feedbackSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(120),
  email: z.string().trim().email("Enter a valid email").max(254),
  contact: z
    .string()
    .trim()
    .min(7, "Enter a valid contact number")
    .max(30)
    .regex(/^[\d\s+().-]+$/, "Enter a valid contact number"),
  category: z.enum(feedbackCategoryValues as [string, ...string[]]),
  feedback: z.string().trim().min(1, "Feedback is required").max(5000),
  website: z.string().optional(),
});

export type FeedbackPayload = z.infer<typeof feedbackSchema>;
