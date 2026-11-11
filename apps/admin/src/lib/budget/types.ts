export type FunderType = "csr" | "fcra" | "government" | "domestic-donor";

export type DeedObject = "education" | "ai-research" | "ict" | "skill-development";

export type TrainerLine = {
  id: string;
  name: string;
  cost: number;
  relatedParty: boolean;
  relationship?: string;
};

export type BudgetProject = {
  id: string;
  name: string;
  funderType: FunderType;
  deedObjects: DeedObject[];
  totalBudget: number;
  beneficiaries: number;
  trainers: TrainerLine[];
  materialCost: number;
  travelCost: number;
  adminOverhead: number;
  reserveAmount: number;
  form10Filed: boolean;
  form10Purpose?: string;
  form10Years?: number;
  createdAt: string;
  updatedAt: string;
};

export type PerBeneficiaryCost = {
  total: number;
  program: number;
  trainer: number;
  material: number;
  travel: number;
  admin: number;
};

export type ComputedBudget = {
  trainerCost: number;
  programCost: number;
  adminCost: number;
  reserveCost: number;
  allocated: number;
  unallocated: number;
  overAllocated: boolean;
  programPct: number;
  adminPct: number;
  reservePct: number;
  perBeneficiary: PerBeneficiaryCost;
};

export type Severity = "pass" | "warn" | "fail";

export type ComplianceResult = {
  id: string;
  severity: Severity;
  title: string;
  actual: string;
  threshold: string;
  citation: string;
  remedy: string;
};

export type AuditAction = "created" | "updated" | "deleted" | "exported";

export type AuditEntry = {
  id: string;
  at: string;
  actor: string;
  projectId: string;
  projectName: string;
  action: AuditAction;
  field?: string;
  from?: string;
  to?: string;
};

export type DocumentKind = "csr-proposal" | "board-resolution" | "fcra-annexe" | "donor-letter";

export type DocumentSection = {
  heading: string;
  paragraphs: string[];
  table?: { headers: string[]; rows: string[][] };
};

export type GeneratedDocument = {
  kind: DocumentKind;
  title: string;
  subtitle: string;
  sections: DocumentSection[];
};

export const FUNDER_TYPE_LABELS: Record<FunderType, string> = {
  csr: "CSR",
  fcra: "FCRA",
  government: "Government grant",
  "domestic-donor": "Domestic donor",
};

export const DEED_OBJECT_LABELS: Record<DeedObject, string> = {
  education: "Education",
  "ai-research": "AI Research",
  ict: "ICT",
  "skill-development": "Skill Development",
};

export const DOCUMENT_KIND_LABELS: Record<DocumentKind, string> = {
  "csr-proposal": "CSR proposal",
  "board-resolution": "Board resolution",
  "fcra-annexe": "FCRA annexe",
  "donor-letter": "Donor letter",
};

export const DEED_OBJECTS: DeedObject[] = [
  "education",
  "ai-research",
  "ict",
  "skill-development",
];

export const FUNDER_TYPES: FunderType[] = ["csr", "fcra", "government", "domestic-donor"];

export function newId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function createEmptyProject(): BudgetProject {
  const now = new Date().toISOString();
  return {
    id: newId(),
    name: "Untitled project",
    funderType: "csr",
    deedObjects: ["education"],
    totalBudget: 0,
    beneficiaries: 0,
    trainers: [{ id: newId(), name: "", cost: 0, relatedParty: false }],
    materialCost: 0,
    travelCost: 0,
    adminOverhead: 0,
    reserveAmount: 0,
    form10Filed: false,
    createdAt: now,
    updatedAt: now,
  };
}

export function createTrainerLine(): TrainerLine {
  return { id: newId(), name: "", cost: 0, relatedParty: false };
}
