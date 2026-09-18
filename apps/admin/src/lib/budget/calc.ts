import type { BudgetProject, ComputedBudget, PerBeneficiaryCost } from "./types";

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const inrDecimal = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 2,
});

export function trainerTotal(project: BudgetProject): number {
  return project.trainers.reduce((sum, line) => sum + toRupees(line.cost), 0);
}

export function toRupees(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.round(value));
}

export function pctOf(part: number, total: number): number {
  if (total <= 0) return 0;
  return (part / total) * 100;
}

export function formatInr(value: number): string {
  return inr.format(Math.round(value || 0));
}

export function formatInrPrecise(value: number): string {
  return inrDecimal.format(value || 0);
}

export function formatPct(value: number): string {
  if (!Number.isFinite(value)) return "0.0%";
  return `${value.toFixed(1)}%`;
}

function perHead(amount: number, beneficiaries: number): number {
  if (beneficiaries <= 0) return 0;
  return amount / beneficiaries;
}

export function computeBudget(project: BudgetProject): ComputedBudget {
  const trainerCost = trainerTotal(project);
  const programCost = trainerCost + toRupees(project.materialCost) + toRupees(project.travelCost);
  const adminCost = toRupees(project.adminOverhead);
  const reserveCost = toRupees(project.reserveAmount);
  const allocated = programCost + adminCost + reserveCost;
  const total = toRupees(project.totalBudget);
  const unallocated = total - allocated;
  const heads = Math.max(0, Math.round(project.beneficiaries || 0));

  const perBeneficiary: PerBeneficiaryCost = {
    total: perHead(total, heads),
    program: perHead(programCost, heads),
    trainer: perHead(trainerCost, heads),
    material: perHead(toRupees(project.materialCost), heads),
    travel: perHead(toRupees(project.travelCost), heads),
    admin: perHead(adminCost, heads),
  };

  return {
    trainerCost,
    programCost,
    adminCost,
    reserveCost,
    allocated,
    unallocated,
    overAllocated: unallocated < 0,
    programPct: pctOf(programCost, total),
    adminPct: pctOf(adminCost, total),
    reservePct: pctOf(reserveCost, total),
    perBeneficiary,
  };
}
