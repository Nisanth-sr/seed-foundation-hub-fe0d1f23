import { formatInr, formatPct } from "./calc";
import { FUNDER_RULES } from "./compliance";
import { DEED_OBJECT_DETAILS, SEED } from "./seed-foundation";
import {
  DEED_OBJECT_LABELS,
  FUNDER_TYPE_LABELS,
  type BudgetProject,
  type ComplianceResult,
  type ComputedBudget,
  type DocumentKind,
  type GeneratedDocument,
} from "./types";

function todayLong(): string {
  return new Date().toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function objectsList(project: BudgetProject): string {
  return project.deedObjects.map((id) => DEED_OBJECT_LABELS[id]).join(", ") || "—";
}

function scheduleVii(project: BudgetProject): string {
  if (project.deedObjects.length === 0) return "Not mapped — select a Trust Deed object.";
  return project.deedObjects.map((id) => DEED_OBJECT_DETAILS[id].scheduleVii).join("; ");
}

function trainerRows(project: BudgetProject): string[][] {
  return project.trainers.map((t) => [
    t.name || "Unnamed trainer",
    formatInr(t.cost),
    t.relatedParty ? `Yes${t.relationship ? ` — ${t.relationship}` : ""}` : "No",
  ]);
}

function budgetTable(project: BudgetProject, computed: ComputedBudget): { headers: string[]; rows: string[][] } {
  return {
    headers: ["Head", "Amount", "% of total"],
    rows: [
      ["Trainer costs", formatInr(computed.trainerCost), formatPct(computed.programPct && computed.trainerCost ? (computed.trainerCost / (project.totalBudget || 1)) * 100 : 0)],
      ["Material costs", formatInr(project.materialCost), formatPct(project.totalBudget ? (project.materialCost / project.totalBudget) * 100 : 0)],
      ["Travel costs", formatInr(project.travelCost), formatPct(project.totalBudget ? (project.travelCost / project.totalBudget) * 100 : 0)],
      ["Program work (subtotal)", formatInr(computed.programCost), formatPct(computed.programPct)],
      ["Admin overhead", formatInr(computed.adminCost), formatPct(computed.adminPct)],
      ["Reserve", formatInr(computed.reserveCost), formatPct(computed.reservePct)],
      ["Allocated", formatInr(computed.allocated), formatPct(project.totalBudget ? (computed.allocated / project.totalBudget) * 100 : 0)],
      ["Total budget", formatInr(project.totalBudget), "100.0%"],
    ],
  };
}

function complianceSummary(results: ComplianceResult[]): string {
  const fails = results.filter((r) => r.severity === "fail");
  const warns = results.filter((r) => r.severity === "warn");
  if (fails.length === 0 && warns.length === 0) {
    return "Internal compliance review: no flags. All automated checks passed.";
  }
  const parts: string[] = [];
  if (fails.length) {
    parts.push("Fails: " + fails.map((r) => r.title).join("; ") + ".");
  }
  if (warns.length) {
    parts.push("Warnings: " + warns.map((r) => r.title).join("; ") + ".");
  }
  return `Internal compliance review — ${parts.join(" ")}`;
}

function letterhead(): string {
  return `${SEED.legalName} | Trust registration ${SEED.trustReg} | DARPAN ${SEED.darpan} | 12A ${SEED.registration12A} | 80G ${SEED.registration80G} | PAN ${SEED.pan}`;
}

export function generateDocument(
  kind: DocumentKind,
  project: BudgetProject,
  computed: ComputedBudget,
  results: ComplianceResult[],
): GeneratedDocument {
  switch (kind) {
    case "csr-proposal":
      return csrProposal(project, computed, results);
    case "board-resolution":
      return boardResolution(project, computed, results);
    case "fcra-annexe":
      return fcraAnnexe(project, computed, results);
    case "donor-letter":
      return donorLetter(project, computed, results);
  }
}

function csrProposal(project: BudgetProject, computed: ComputedBudget, results: ComplianceResult[]): GeneratedDocument {
  const cap = FUNDER_RULES.csr.adminCapPct;
  return {
    kind: "csr-proposal",
    title: `CSR proposal — ${project.name}`,
    subtitle: `${SEED.legalName} · ${todayLong()}`,
    sections: [
      {
        heading: "Implementing organisation",
        paragraphs: [
          letterhead(),
          `${SEED.name} is a public charitable trust registered as ${SEED.trustReg}. DARPAN unique ID: ${SEED.darpan}. Registered office: ${SEED.registeredOffice}.`,
          `Trust Deed objects invoked: ${objectsList(project)}.`,
        ],
      },
      {
        heading: "Section 135 / Schedule VII framing",
        paragraphs: [
          `This proposal is submitted for consideration as a corporate social responsibility project under Section 135 of the Companies Act, 2013.`,
          `Schedule VII mapping: ${scheduleVii(project)}.`,
          `Funder type recorded: ${FUNDER_TYPE_LABELS[project.funderType]}. Number of beneficiaries: ${project.beneficiaries}.`,
        ],
      },
      {
        heading: "Project budget",
        paragraphs: [
          `Total CSR project budget: ${formatInr(project.totalBudget)}. Admin overhead is ${formatPct(computed.adminPct)} of the project (Rule 7(1) cap: ${cap}%).`,
        ],
        table: budgetTable(project, computed),
      },
      {
        heading: "Trainer schedule",
        paragraphs: project.trainers.length
          ? ["The following trainers are budgeted as direct programme costs."]
          : ["No trainers have been listed."],
        table: { headers: ["Trainer", "Cost", "Related party (s.13)"], rows: trainerRows(project) },
      },
      {
        heading: "Admin ratio statement",
        paragraphs: [
          `Administrative overheads of ${formatInr(computed.adminCost)} (${formatPct(computed.adminPct)}) are within the meaning of Rule 7(1) of the Companies (CSR Policy) Rules, 2014, which caps administrative overheads at ${cap}% of total CSR expenditure.`,
          computed.reserveCost > 0
            ? `A reserve of ${formatInr(computed.reserveCost)} is included. If this amount remains unspent at year-end on an ongoing project, it will be transferred to an Unspent CSR Account within 30 days under Section 135(6) and utilised within three financial years.`
            : "No unspent / reserve amount is budgeted.",
          complianceSummary(results),
        ],
      },
    ],
  };
}

function boardResolution(project: BudgetProject, computed: ComputedBudget, results: ComplianceResult[]): GeneratedDocument {
  const form10Needed = computed.reservePct > 15;
  return {
    kind: "board-resolution",
    title: `Board resolution — ${project.name}`,
    subtitle: `${SEED.legalName} · Meeting of the Board of Trustees · ${todayLong()}`,
    sections: [
      {
        heading: "Resolution",
        paragraphs: [
          `RESOLVED THAT the Board of Trustees of ${SEED.legalName} (Trust registration ${SEED.trustReg}; DARPAN ${SEED.darpan}) hereby approves the project titled “${project.name}” with a total budget of ${formatInr(project.totalBudget)}, funded as ${FUNDER_TYPE_LABELS[project.funderType]}.`,
          `RESOLVED FURTHER THAT the project is intra vires the Trust Deed objects of Education, AI Research, ICT, and Skill Development, and specifically engages: ${objectsList(project)}.`,
          `RESOLVED FURTHER THAT the allocation shall be programme work ${formatInr(computed.programCost)} (${formatPct(computed.programPct)}), administrative overhead ${formatInr(computed.adminCost)} (${formatPct(computed.adminPct)}), and reserve ${formatInr(computed.reserveCost)} (${formatPct(computed.reservePct)}), serving approximately ${project.beneficiaries} beneficiaries.`,
        ],
        table: budgetTable(project, computed),
      },
      {
        heading: "Section 11 and Section 13 declarations",
        paragraphs: [
          `The Board records that income of the Trust shall be applied to the charitable objects in accordance with Section 11(1)(a) of the Income-tax Act, 1961 (at least 85% application; accumulation not exceeding 15% unless Section 11(2) is invoked).`,
          `The Board further records that no part of the income or property of the Trust shall be used for the benefit of the settlor, any trustee, or any specified person within the meaning of Section 13(1)(c), 13(2) and 13(3). Related-party trainer payments, if any, are flagged in the compliance review.`,
          complianceSummary(results),
        ],
      },
      {
        heading: form10Needed ? "Form 10 / Section 11(2) resolution" : "Accumulation",
        paragraphs: form10Needed
          ? [
              `RESOLVED FURTHER THAT, the reserve of ${formatInr(computed.reserveCost)} (${formatPct(computed.reservePct)}) exceeding 15% of the project income, the Trust shall accumulate the excess under Section 11(2), file Form 10, specify the purpose as “${project.form10Purpose?.trim() || "[purpose to be specified]"}”, and accumulate for ${project.form10Years ?? "[years]"} year(s) (not exceeding 5), investing the amount only in modes specified in Section 11(5).`,
              project.form10Filed
                ? "The Board notes that Form 10 has been marked as filed in the planner; the secretary shall keep the acknowledgement and investment evidence with the statutory records."
                : "The Board directs the secretary to prepare Form 10 and place it for signature before the due date.",
            ]
          : [
              `The reserved amount of ${formatInr(computed.reserveCost)} (${formatPct(computed.reservePct)}) does not exceed 15%. No Form 10 filing is required for this project budget.`,
            ],
      },
    ],
  };
}

function fcraAnnexe(project: BudgetProject, computed: ComputedBudget, results: ComplianceResult[]): GeneratedDocument {
  return {
    kind: "fcra-annexe",
    title: `FCRA utilisation annexe — ${project.name}`,
    subtitle: `${SEED.legalName} · FC-4 style summary · ${todayLong()}`,
    sections: [
      {
        heading: "Association particulars",
        paragraphs: [
          letterhead(),
          `FCRA registration / prior permission: ${SEED.fcraNumber}.`,
          `Designated FCRA account: ${SEED.designatedFcraBank}.`,
          `Project: ${project.name}. Foreign contribution earmarked (this budget): ${formatInr(project.totalBudget)}.`,
        ],
      },
      {
        heading: "Utilisation summary (FC-4 style)",
        paragraphs: [
          `Programme utilisation ${formatInr(computed.programCost)} (${formatPct(computed.programPct)}); administrative expenses ${formatInr(computed.adminCost)} (${formatPct(computed.adminPct)}); unutilised / reserve ${formatInr(computed.reserveCost)} (${formatPct(computed.reservePct)}).`,
          `Administrative expenses are ${formatPct(computed.adminPct)} of foreign contribution received on this project. Section 8(1)(b) FCRA 2010 (as amended 2020) caps administrative expenses at 20% of foreign contribution received in the financial year. FCRR Rule 5 defines what constitutes administrative expense.`,
        ],
        table: budgetTable(project, computed),
      },
      {
        heading: "Declarations",
        paragraphs: [
          "Section 7: no foreign contribution from this budget will be transferred to any other person unless that person is registered or has prior permission under FCRA.",
          "Section 17: receipts will be credited only to the designated FCRA account at SBI, New Delhi Main Branch, and utilised from the notified utilisation account(s).",
          `Trust Deed objects: ${objectsList(project)}.`,
          complianceSummary(results),
        ],
      },
    ],
  };
}

function donorLetter(project: BudgetProject, computed: ComputedBudget, results: ComplianceResult[]): GeneratedDocument {
  return {
    kind: "donor-letter",
    title: `Donor acknowledgement — ${project.name}`,
    subtitle: `${SEED.legalName} · ${todayLong()}`,
    sections: [
      {
        heading: "Acknowledgement",
        paragraphs: [
          `Dear Donor,`,
          `On behalf of the Board of Trustees of ${SEED.legalName} (Trust registration ${SEED.trustReg}; DARPAN ${SEED.darpan}), we thank you for your contribution of ${formatInr(project.totalBudget)} towards “${project.name}”.`,
          `The gift will be applied to the Trust Deed objects of ${objectsList(project)}, reaching approximately ${project.beneficiaries} beneficiaries. Programme work is budgeted at ${formatInr(computed.programCost)} (${formatPct(computed.programPct)}); administrative overhead at ${formatInr(computed.adminCost)} (${formatPct(computed.adminPct)}).`,
        ],
        table: budgetTable(project, computed),
      },
      {
        heading: "Tax deduction under Section 80G",
        paragraphs: [
          `SEED Foundation holds registration under Section 12A (${SEED.registration12A}) and Section 80G (${SEED.registration80G}). PAN: ${SEED.pan}.`,
          `A donor who is an assessee in India may claim a deduction under Section 80G of the Income-tax Act, 1961 equal to 50% of a qualifying donation, subject to the ceiling of 10% of adjusted gross total income (unless the donation is of a 100% deductible category). This letter is not tax advice; the donor should take advice on their own facts.`,
          `SEED will file Form 10BD for the financial year and issue Form 10BE (certificate of donation) so that the deduction can be allowed. Please share your PAN and address for the certificate.`,
          complianceSummary(results),
          `With regards,\nBoard of Trustees\n${SEED.legalName}\n${SEED.email} · ${SEED.url}`,
        ],
      },
    ],
  };
}

export function documentToMarkdown(doc: GeneratedDocument): string {
  const lines: string[] = [`# ${doc.title}`, "", doc.subtitle, ""];
  for (const section of doc.sections) {
    lines.push(`## ${section.heading}`, "");
    for (const paragraph of section.paragraphs) {
      lines.push(paragraph, "");
    }
    if (section.table) {
      lines.push(`| ${section.table.headers.join(" | ")} |`);
      lines.push(`| ${section.table.headers.map(() => "---").join(" | ")} |`);
      for (const row of section.table.rows) {
        lines.push(`| ${row.join(" | ")} |`);
      }
      lines.push("");
    }
  }
  return lines.join("\n");
}

export function documentFilename(kind: DocumentKind, projectName: string): string {
  const safe = projectName.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase() || "project";
  const date = new Date().toISOString().slice(0, 10);
  return `seed-${kind}-${safe}-${date}.md`;
}
