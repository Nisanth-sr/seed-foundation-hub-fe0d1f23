export const AGE_RANGES = [
  "under_15",
  "15_17",
  "18_21",
  "22_25",
  "26_30",
  "31_40",
  "41_plus",
] as const;

export type AgeRange = (typeof AGE_RANGES)[number];

export const EDUCATION_LEVELS = [
  "below_10",
  "10th",
  "12th",
  "diploma",
  "undergraduate",
  "postgraduate",
  "other",
] as const;

export type EducationLevel = (typeof EDUCATION_LEVELS)[number];

export const CURRENT_STATUSES = ["student", "working", "seeking", "other"] as const;

export type CurrentStatus = (typeof CURRENT_STATUSES)[number];

export type ProfilePersonalFields = {
  phone: string | null;
  ageRange: AgeRange | null;
  city: string | null;
  state: string | null;
  educationLevel: EducationLevel | null;
  currentStatus: CurrentStatus | null;
  schoolOrCollege: string | null;
  languagesSpoken: string[];
};

export const AGE_RANGE_LABELS: Record<AgeRange, string> = {
  under_15: "Under 15",
  "15_17": "15–17",
  "18_21": "18–21",
  "22_25": "22–25",
  "26_30": "26–30",
  "31_40": "31–40",
  "41_plus": "41+",
};

export const EDUCATION_LEVEL_LABELS: Record<EducationLevel, string> = {
  below_10: "Below 10th",
  "10th": "10th",
  "12th": "12th",
  diploma: "Diploma",
  undergraduate: "Undergraduate",
  postgraduate: "Postgraduate",
  other: "Other",
};

export const CURRENT_STATUS_LABELS: Record<CurrentStatus, string> = {
  student: "Student",
  working: "Working",
  seeking: "Looking for a job",
  other: "Other",
};

export function parseLanguagesInput(raw: string): string[] {
  return raw
    .split(/[,;\n]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}
