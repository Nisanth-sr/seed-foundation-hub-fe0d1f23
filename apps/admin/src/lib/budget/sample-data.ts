import type { BudgetProject } from "./types";

function stamp(id: string, createdAt: string): Pick<BudgetProject, "id" | "createdAt" | "updatedAt"> {
  return { id, createdAt, updatedAt: createdAt };
}

export const SAMPLE_PROJECTS: BudgetProject[] = [
  {
    ...stamp("sample-digital-literacy", "2026-04-12T09:00:00.000Z"),
    name: "Digital Literacy for Rural Schools",
    funderType: "csr",
    deedObjects: ["ict", "education"],
    totalBudget: 1_000_000,
    beneficiaries: 400,
    trainers: [
      { id: "sample-1-t1", name: "Meena Joseph", cost: 250_000, relatedParty: false },
      { id: "sample-1-t2", name: "Arun Prakash", cost: 150_000, relatedParty: false },
    ],
    materialCost: 350_000,
    travelCost: 200_000,
    adminOverhead: 50_000,
    reserveAmount: 0,
    form10Filed: false,
  },
  {
    ...stamp("sample-ai-skills-lab", "2026-05-03T09:00:00.000Z"),
    name: "AI Skills Lab",
    funderType: "fcra",
    deedObjects: ["ai-research", "skill-development"],
    totalBudget: 2_500_000,
    beneficiaries: 120,
    trainers: [
      { id: "sample-2-t1", name: "Priya Raman", cost: 450_000, relatedParty: false },
      {
        id: "sample-2-t2",
        name: "K. Selvam",
        cost: 250_000,
        relatedParty: true,
        relationship: "Trustee's spouse",
      },
    ],
    materialCost: 500_000,
    travelCost: 300_000,
    adminOverhead: 600_000,
    reserveAmount: 200_000,
    form10Filed: false,
  },
  {
    ...stamp("sample-vocational-training", "2026-06-18T09:00:00.000Z"),
    name: "Vocational Training Centre",
    funderType: "government",
    deedObjects: ["skill-development"],
    totalBudget: 1_500_000,
    beneficiaries: 80,
    trainers: [
      { id: "sample-3-t1", name: "Lakshmi Devi", cost: 400_000, relatedParty: false },
      { id: "sample-3-t2", name: "Suresh Babu", cost: 200_000, relatedParty: false },
    ],
    materialCost: 310_000,
    travelCost: 200_000,
    adminOverhead: 120_000,
    reserveAmount: 270_000,
    form10Filed: false,
  },
];
