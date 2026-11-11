import type { AuditEntry, BudgetProject } from "./types";

export const PROJECTS_KEY = "seed.budget.projects.v1";
export const AUDIT_KEY = "seed.budget.audit.v1";

export type ProjectsPayload = {
  projects: BudgetProject[];
  activeId: string | null;
};

const EMPTY_PAYLOAD: ProjectsPayload = { projects: [], activeId: null };

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function readJson<T>(key: string, fallback: T): T {
  if (!canUseStorage()) return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  if (!canUseStorage()) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Quota or private-mode failures should not break the planner.
  }
}

export function loadProjects(): ProjectsPayload {
  const parsed = readJson<ProjectsPayload | BudgetProject[]>(PROJECTS_KEY, EMPTY_PAYLOAD);
  if (Array.isArray(parsed)) {
    return { projects: parsed, activeId: parsed[0]?.id ?? null };
  }
  if (!parsed || !Array.isArray(parsed.projects)) return EMPTY_PAYLOAD;
  return {
    projects: parsed.projects,
    activeId: parsed.activeId ?? parsed.projects[0]?.id ?? null,
  };
}

export function saveProjects(payload: ProjectsPayload) {
  writeJson(PROJECTS_KEY, payload);
}

export function loadAudit(): AuditEntry[] {
  const parsed = readJson<AuditEntry[]>(AUDIT_KEY, []);
  return Array.isArray(parsed) ? parsed : [];
}

export function saveAudit(entries: AuditEntry[]) {
  writeJson(AUDIT_KEY, entries);
}

export function appendAudit(existing: AuditEntry[], entry: Omit<AuditEntry, "id" | "at"> & { id?: string; at?: string }): AuditEntry[] {
  const next: AuditEntry = {
    id: entry.id ?? (typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `audit-${Date.now()}`),
    at: entry.at ?? new Date().toISOString(),
    actor: entry.actor,
    projectId: entry.projectId,
    projectName: entry.projectName,
    action: entry.action,
    field: entry.field,
    from: entry.from,
    to: entry.to,
  };
  const all = [next, ...existing].slice(0, 500);
  saveAudit(all);
  return all;
}

function asText(value: unknown): string {
  if (value === undefined || value === null || value === "") return "—";
  if (typeof value === "boolean") return value ? "yes" : "no";
  if (typeof value === "number") return String(value);
  if (Array.isArray(value)) return value.length ? value.join(", ") : "—";
  return String(value);
}

function trainersSummary(project: BudgetProject): string {
  if (project.trainers.length === 0) return "—";
  return project.trainers
    .map((t) => {
      const name = t.name || "Unnamed";
      const related = t.relatedParty ? ` related${t.relationship ? `: ${t.relationship}` : ""}` : "";
      return `${name} ${t.cost}${related}`;
    })
    .join("; ");
}

const SCALAR_FIELDS: { key: keyof BudgetProject; label: string }[] = [
  { key: "name", label: "Project name" },
  { key: "funderType", label: "Funder type" },
  { key: "totalBudget", label: "Total budget" },
  { key: "beneficiaries", label: "Beneficiaries" },
  { key: "materialCost", label: "Material costs" },
  { key: "travelCost", label: "Travel costs" },
  { key: "adminOverhead", label: "Admin overhead" },
  { key: "reserveAmount", label: "Reserve amount" },
  { key: "form10Filed", label: "Form 10 filed" },
  { key: "form10Purpose", label: "Form 10 purpose" },
  { key: "form10Years", label: "Form 10 years" },
];

export function diffProject(prev: BudgetProject, next: BudgetProject): { field: string; from: string; to: string }[] {
  const changes: { field: string; from: string; to: string }[] = [];

  for (const { key, label } of SCALAR_FIELDS) {
    const from = asText(prev[key]);
    const to = asText(next[key]);
    if (from !== to) changes.push({ field: label, from, to });
  }

  const prevObjects = [...prev.deedObjects].sort().join(", ");
  const nextObjects = [...next.deedObjects].sort().join(", ");
  if (prevObjects !== nextObjects) {
    changes.push({ field: "Deed objects", from: asText(prev.deedObjects), to: asText(next.deedObjects) });
  }

  const prevTrainers = trainersSummary(prev);
  const nextTrainers = trainersSummary(next);
  if (prevTrainers !== nextTrainers) {
    changes.push({ field: "Trainers", from: prevTrainers, to: nextTrainers });
  }

  return changes;
}
