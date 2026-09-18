import { formatInr, formatPct } from "./calc";
import { DEED_OBJECT_LABELS } from "./types";
import type { BudgetProject, ComplianceResult, ComputedBudget, FunderType, Severity } from "./types";

export const SECTION_11_APPLICATION_PCT = 85;
export const SECTION_11_ACCUMULATION_CAP_PCT = 15;
export const FORM_10_MAX_YEARS = 5;
export const PROGRAM_FLOOR_PCT = 70;

export type FunderChecklistItem = {
  id: string;
  title: string;
  detail: string;
};

export type FunderRule = {
  label: string;
  adminCapPct: number;
  adminCapCitation: string;
  adminCapRemedy: string;
  checklist: FunderChecklistItem[];
};

export const FUNDER_RULES: Record<FunderType, FunderRule> = {
  csr: {
    label: "CSR (Companies Act, 2013)",
    adminCapPct: 5,
    adminCapCitation: "Rule 7(1), Companies (CSR Policy) Rules, 2014 — administrative overheads shall not exceed 5% of total CSR expenditure",
    adminCapRemedy:
      "Reduce admin overhead so it is at most 5% of this project's CSR spend. Direct implementation costs (trainers, materials, travel) belong in the program line, not admin.",
    checklist: [
      {
        id: "csr-schedule-vii",
        title: "Schedule VII activity",
        detail: "The activity must fall under Schedule VII of the Companies Act, 2013 (education, vocational skills, and related research/ICT).",
      },
      {
        id: "csr-unspent",
        title: "Unspent CSR Account (s.135(6))",
        detail:
          "Any unspent CSR amount for an ongoing project must be transferred to an Unspent CSR Account within 30 days of the financial-year end and utilised within three financial years.",
      },
      {
        id: "csr-ongoing",
        title: "Ongoing project window",
        detail: "If treated as an ongoing project, remaining funds have a three-year utilisation window; otherwise they must be transferred to a Schedule VII fund.",
      },
    ],
  },
  fcra: {
    label: "FCRA (Foreign Contribution)",
    adminCapPct: 20,
    adminCapCitation:
      "Section 8(1)(b), FCRA 2010 (as amended 2020) — administrative expenses shall not exceed 20% of foreign contribution received in that financial year; FCRR Rule 5 defines administrative expenses",
    adminCapRemedy:
      "Reduce administrative overhead to 20% or less of the foreign contribution received (this project's total budget). Reclassify genuine programme costs out of admin if they were mis-coded.",
    checklist: [
      {
        id: "fcra-rule-5",
        title: "FCRR Rule 5 — what counts as admin",
        detail:
          "Salaries of accounting/admin staff, travel of board members, office rent, and similar costs are administrative. Trainer fees for delivering the programme are not.",
      },
      {
        id: "fcra-s7",
        title: "Section 7 — no sub-granting",
        detail: "Foreign contribution cannot be transferred to any other person unless that person is also registered or has prior permission under FCRA.",
      },
      {
        id: "fcra-s17",
        title: "Section 17 — designated bank account",
        detail: "Foreign contribution must be received only in the designated FCRA account at SBI, New Delhi Main Branch, and utilised from the utilisation account(s) so notified.",
      },
    ],
  },
  government: {
    label: "Government grant",
    adminCapPct: 10,
    adminCapCitation: "GFR 2017 / scheme guidelines — administrative charges are typically capped at 10% unless the sanction order specifies otherwise",
    adminCapRemedy:
      "Bring admin overhead within 10% of the sanctioned amount, or obtain written scheme-specific approval for a higher rate.",
    checklist: [
      {
        id: "gfr-12a",
        title: "GFR 12-A utilisation certificate",
        detail: "A utilisation certificate in Form GFR 12-A is required after the grant is spent; unspent balances are refundable to the sponsoring department.",
      },
      {
        id: "gfr-uc-timeline",
        title: "UC timeline",
        detail: "File the utilisation certificate within the period stated in the sanction order, usually 12 months of the close of the financial year.",
      },
    ],
  },
  "domestic-donor": {
    label: "Domestic donor",
    adminCapPct: 15,
    adminCapCitation: "SEED Foundation policy — administrative overhead on domestic donations should not exceed 15% of the gift",
    adminCapRemedy: "Reduce admin overhead to 15% or below, or obtain the donor's written approval for a higher overhead rate.",
    checklist: [
      {
        id: "donor-80g",
        title: "Section 80G deduction",
        detail:
          "A qualifying donor may claim 50% of the donation as a deduction under s.80G, subject to the 10% of adjusted gross total income ceiling (unless the donation is 100% deductible).",
      },
      {
        id: "donor-10be",
        title: "Form 10BD / 10BE",
        detail: "SEED must file Form 10BD for the year and issue Form 10BE (certificate of donation) to the donor for the deduction to be allowed.",
      },
    ],
  },
};

function result(
  id: string,
  severity: Severity,
  title: string,
  actual: string,
  threshold: string,
  citation: string,
  remedy: string,
): ComplianceResult {
  return { id, severity, title, actual, threshold, citation, remedy };
}

export function evaluateCompliance(project: BudgetProject, computed: ComputedBudget): ComplianceResult[] {
  const results: ComplianceResult[] = [];
  const funder = FUNDER_RULES[project.funderType];

  if (computed.overAllocated) {
    results.push(
      result(
        "over-allocated",
        "fail",
        "Budget is over-allocated",
        formatInr(Math.abs(computed.unallocated)) + " over the total",
        "Line items must not exceed total budget",
        "Internal control — books of account (s.11 / s.12A record-keeping)",
        "Reduce trainer, material, travel, admin, or reserve lines so the sum equals the total budget.",
      ),
    );
  } else if (computed.unallocated !== 0) {
    results.push(
      result(
        "unallocated",
        "warn",
        "Unallocated budget",
        formatInr(computed.unallocated) + " unallocated",
        "Allocated amount should equal total budget",
        "Internal control — complete application of earmarked funds",
        "Assign the remainder to program, admin, or reserve, or reduce the stated total.",
      ),
    );
  } else {
    results.push(
      result(
        "unallocated",
        "pass",
        "Budget fully allocated",
        formatInr(computed.allocated),
        "Allocated amount equals total budget",
        "Internal control — complete application of earmarked funds",
        "No action required.",
      ),
    );
  }

  const accumulationOk = computed.reservePct <= SECTION_11_ACCUMULATION_CAP_PCT;
  if (!accumulationOk && !project.form10Filed) {
    results.push(
      result(
        "section-11-accumulation",
        "fail",
        "Reserve exceeds 15% without Form 10",
        formatPct(computed.reservePct),
        `At most ${SECTION_11_ACCUMULATION_CAP_PCT}% may be accumulated without Form 10`,
        "Income-tax Act s.11(1)(a) — at least 85% of income must be applied to the objects; accumulation above 15% requires s.11(2) / Form 10",
        "Apply the excess to programme objects this year, or pass a board resolution, file Form 10, specify the purpose, and invest only in s.11(5) modes for a maximum of 5 years.",
      ),
    );
  } else if (!accumulationOk && project.form10Filed) {
    results.push(
      result(
        "section-11-accumulation",
        "pass",
        "Accumulation covered by Form 10",
        formatPct(computed.reservePct),
        `Above ${SECTION_11_ACCUMULATION_CAP_PCT}% permitted only with Form 10`,
        "Income-tax Act s.11(2) read with Form 10",
        "Keep Form 10, the board resolution, and s.11(5) investment evidence on file.",
      ),
    );
  } else {
    results.push(
      result(
        "section-11-accumulation",
        "pass",
        "Section 11 income application",
        `${formatPct(computed.programPct + computed.adminPct)} applied / ${formatPct(computed.reservePct)} accumulated`,
        `At least ${SECTION_11_APPLICATION_PCT}% applied; accumulation ≤ ${SECTION_11_ACCUMULATION_CAP_PCT}%`,
        "Income-tax Act s.11(1)(a)",
        "No action required.",
      ),
    );
  }

  if (project.form10Filed) {
    const years = project.form10Years ?? 0;
    const purposeMissing = !project.form10Purpose?.trim();
    const yearsInvalid = years < 1 || years > FORM_10_MAX_YEARS;
    if (purposeMissing || yearsInvalid) {
      results.push(
        result(
          "form-10-particulars",
          "warn",
          "Form 10 particulars incomplete",
          `Purpose ${purposeMissing ? "missing" : "stated"}; years ${years || "not set"}`,
          "Specified purpose and accumulation period of 1–5 years",
          "Income-tax Act s.11(2) — Form 10 must state the purpose and the period (not exceeding 5 years); funds must be invested in s.11(5) modes",
          "Record the specific object for which funds are accumulated and the number of years (maximum 5). Invest only in modes listed in s.11(5).",
        ),
      );
    } else {
      results.push(
        result(
          "form-10-particulars",
          "pass",
          "Form 10 particulars complete",
          `${project.form10Purpose}; ${years} year(s)`,
          "Specified purpose and 1–5 years",
          "Income-tax Act s.11(2) / Form 10",
          "No action required.",
        ),
      );
    }
  }

  const related = project.trainers.filter((t) => t.relatedParty);
  if (related.length > 0) {
    const amount = related.reduce((sum, t) => sum + (t.cost || 0), 0);
    const names = related
      .map((t) => `${t.name || "Unnamed trainer"}${t.relationship ? ` (${t.relationship})` : ""}`)
      .join("; ");
    results.push(
      result(
        "section-13-related-party",
        "fail",
        "Related-party trainer (no trustee benefit)",
        `${names}; ${formatInr(amount)}`,
        "No payment of income or benefit to a s.13(3) specified person",
        "Income-tax Act s.13(1)(c), s.13(2) and s.13(3) — use of income for the benefit of the settlor, trustee, or a specified person can forfeit exemption; the amount is taxable at maximum marginal rate",
        "Do not engage a specified person (trustee, relative, or concerned concern) as a paid trainer. If already contracted, reverse or disclose the payment and treat the amount as taxable at MMR.",
      ),
    );
  } else {
    results.push(
      result(
        "section-13-related-party",
        "pass",
        "No related-party trainer",
        "No s.13(3) specified person on the trainer list",
        "No trustee or specified-person benefit",
        "Income-tax Act s.13(1)(c) / s.13(3)",
        "No action required.",
      ),
    );
  }

  if (project.deedObjects.length === 0) {
    results.push(
      result(
        "deed-scope",
        "fail",
        "Outside Trust Deed objects",
        "No deed object selected",
        "Activity must fall under Education, AI Research, ICT, or Skill Development",
        "Indian Trusts Act / Trust Deed — expenditure must be intra vires the objects; s.11 exemption applies only to income applied to the charitable objects",
        "Map the project to at least one Trust Deed object before committing funds.",
      ),
    );
  } else {
    results.push(
      result(
        "deed-scope",
        "pass",
        "Within Trust Deed objects",
        project.deedObjects.map((id) => DEED_OBJECT_LABELS[id]).join(", "),
        "Education, AI Research, ICT, Skill Development",
        "Trust Deed objects of SEED Foundation; Income-tax Act s.11",
        "No action required.",
      ),
    );
  }

  if (computed.programPct < PROGRAM_FLOOR_PCT) {
    results.push(
      result(
        "program-floor",
        "warn",
        "Program share below 70%",
        formatPct(computed.programPct),
        `At least ${PROGRAM_FLOOR_PCT}% of budget on program work`,
        "SEED Foundation policy (not a statutory floor) — programme costs should dominate the budget",
        "Shift spend from admin or reserve into trainers, materials, or travel so program work is at least 70%.",
      ),
    );
  } else {
    results.push(
      result(
        "program-floor",
        "pass",
        "Program share meets 70% policy",
        formatPct(computed.programPct),
        `At least ${PROGRAM_FLOOR_PCT}% of budget on program work`,
        "SEED Foundation policy (not a statutory floor)",
        "No action required.",
      ),
    );
  }

  if (computed.adminPct > funder.adminCapPct) {
    results.push(
      result(
        "funder-admin-cap",
        "fail",
        `${funder.label} admin cap exceeded`,
        formatPct(computed.adminPct),
        `At most ${funder.adminCapPct}% admin`,
        funder.adminCapCitation,
        funder.adminCapRemedy,
      ),
    );
  } else {
    results.push(
      result(
        "funder-admin-cap",
        "pass",
        `${funder.label} admin cap`,
        formatPct(computed.adminPct),
        `At most ${funder.adminCapPct}% admin`,
        funder.adminCapCitation,
        "No action required.",
      ),
    );
  }

  if (project.funderType === "csr" && computed.reserveCost > 0) {
    results.push(
      result(
        "csr-unspent",
        "warn",
        "CSR reserve / unspent amount",
        formatInr(computed.reserveCost),
        "Unspent CSR of an ongoing project must follow s.135(6)",
        "Companies Act s.135(6) — transfer unspent amounts to an Unspent CSR Account within 30 days; utilise within 3 financial years",
        "Treat this reserve as an ongoing-project balance (3-year window) or plan a transfer to the Unspent CSR Account / a Schedule VII fund at year-end.",
      ),
    );
  }

  return results;
}

export function overallSeverity(results: ComplianceResult[]): Severity {
  if (results.some((r) => r.severity === "fail")) return "fail";
  if (results.some((r) => r.severity === "warn")) return "warn";
  return "pass";
}
