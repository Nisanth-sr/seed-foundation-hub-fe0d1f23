export type ReportMetaEntry = { label: string; value: string };

export type ReportBlock =
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[] }
  | { type: "meta"; entries: ReportMetaEntry[] };

export type ReportSection = {
  id: string;
  number: string;
  title: string;
  level: 1 | 2;
  blocks: ReportBlock[];
};

export type ParsedReport = {
  kicker: string | null;
  titles: string[];
  headerMeta: ReportMetaEntry[];
  sections: ReportSection[];
  fallbackParagraphs: string[];
};

export type EditorMetaEntry = ReportMetaEntry & { key: string };

export type EditorBlock =
  | { key: string; type: "paragraph"; text: string }
  | { key: string; type: "list"; items: string[] }
  | { key: string; type: "meta"; entries: EditorMetaEntry[] };

export type EditorSection = {
  key: string;
  number: string;
  title: string;
  level: 1 | 2;
  blocks: EditorBlock[];
};

export type EditorReport = {
  kicker: string;
  titles: { key: string; text: string }[];
  headerMeta: EditorMetaEntry[];
  sections: EditorSection[];
};

const SECTION_RE = /^(\d+)\.\s+(.+)$/;
const SUBSECTION_RE = /^(\d+\.\d+)\s+(.+)$/;
const LIST_RE = /^[-•]\s+(.+)$/;
const META_RE = /^([A-Za-z][A-Za-z0-9 .&/'-]{0,48}):\s+(.+)$/;

export const DEFAULT_HEADER_META: ReportMetaEntry[] = [
  { label: "Program Title", value: "" },
  { label: "Date", value: "" },
  { label: "Venue", value: "" },
  { label: "Organized by", value: "SEED FOUNDATION" },
  { label: "Target Group", value: "" },
  { label: "Report Prepared on", value: "" },
];

export const DEFAULT_ORGANIZING_META: ReportMetaEntry[] = [
  { label: "Organized By", value: "SEED FOUNDATION" },
  { label: "Program Name", value: "" },
  { label: "Date", value: "" },
  { label: "Venue", value: "" },
  { label: "Participants", value: "" },
  { label: "Mode of Conduct", value: "" },
];

const DEFAULT_SECTION_DEFS: Array<{
  number: string;
  title: string;
  level: 1 | 2;
  blocks: ReportBlock[];
}> = [
  { number: "1", title: "Introduction", level: 1, blocks: [{ type: "paragraph", text: "" }] },
  {
    number: "2",
    title: "Objectives of the Program",
    level: 1,
    blocks: [{ type: "list", items: [""] }],
  },
  {
    number: "3",
    title: "Organizing Details",
    level: 1,
    blocks: [
      { type: "meta", entries: DEFAULT_ORGANIZING_META },
      { type: "paragraph", text: "" },
    ],
  },
  { number: "4", title: "Participants", level: 1, blocks: [{ type: "paragraph", text: "" }] },
  { number: "5", title: "Activities Conducted", level: 1, blocks: [{ type: "paragraph", text: "" }] },
  {
    number: "6",
    title: "Outcomes and Achievements",
    level: 1,
    blocks: [{ type: "list", items: [""] }],
  },
  {
    number: "7",
    title: "Event Photographs",
    level: 1,
    blocks: [{ type: "paragraph", text: "A glimpse of the program." }],
  },
  { number: "8", title: "Event Poster", level: 1, blocks: [{ type: "paragraph", text: "" }] },
  { number: "9", title: "Feedback", level: 1, blocks: [{ type: "paragraph", text: "" }] },
  { number: "10", title: "Conclusion", level: 1, blocks: [{ type: "paragraph", text: "" }] },
  { number: "11", title: "Acknowledgement", level: 1, blocks: [{ type: "paragraph", text: "" }] },
];

export function newKey() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `k-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function isSectionHeading(line: string) {
  return SECTION_RE.test(line) && !SUBSECTION_RE.test(line);
}

function isSubsectionHeading(line: string) {
  return SUBSECTION_RE.test(line);
}

function isListItem(line: string) {
  return LIST_RE.test(line);
}

function isMetaLine(line: string) {
  if (isSectionHeading(line) || isSubsectionHeading(line) || isListItem(line)) return false;
  const match = line.match(META_RE);
  if (!match) return false;
  return match[1].length <= 40 && !match[1].includes(",");
}

function pushParagraph(blocks: ReportBlock[], text: string) {
  const trimmed = text.replace(/\s+/g, " ").trim();
  if (trimmed) blocks.push({ type: "paragraph", text: trimmed });
}

function flushBuffer(
  blocks: ReportBlock[],
  buffer: { kind: "paragraph" | "list" | "meta" | null; paragraph: string; items: string[]; entries: ReportMetaEntry[] },
) {
  if (buffer.kind === "paragraph") pushParagraph(blocks, buffer.paragraph);
  if (buffer.kind === "list" && buffer.items.length) blocks.push({ type: "list", items: buffer.items });
  if (buffer.kind === "meta" && buffer.entries.length) blocks.push({ type: "meta", entries: buffer.entries });
  buffer.kind = null;
  buffer.paragraph = "";
  buffer.items = [];
  buffer.entries = [];
}

export function parseReportBody(raw: string): ParsedReport {
  const lines = raw.replace(/\r\n/g, "\n").split("\n").map((line) => line.trim());
  const parsed: ParsedReport = {
    kicker: null,
    titles: [],
    headerMeta: [],
    sections: [],
    fallbackParagraphs: [],
  };

  let phase: "header" | "body" = "header";
  let current: ReportSection | null = null;
  const buffer = {
    kind: null as "paragraph" | "list" | "meta" | null,
    paragraph: "",
    items: [] as string[],
    entries: [] as ReportMetaEntry[],
  };

  const makeSection = (number: string, title: string, level: 1 | 2): ReportSection => ({
    id: `${level}-${number}-${title}`.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    number,
    title,
    level,
    blocks: [],
  });

  for (const line of lines) {
    if (!line) {
      if (phase === "body" && current) flushBuffer(current.blocks, buffer);
      continue;
    }

    if (phase === "header") {
      if (/^project report$/i.test(line)) {
        parsed.kicker = "Project Report";
        continue;
      }
      if (isSectionHeading(line) || isSubsectionHeading(line)) {
        phase = "body";
      } else if (isMetaLine(line)) {
        const match = line.match(META_RE)!;
        parsed.headerMeta.push({ label: match[1].trim(), value: match[2].trim() });
        continue;
      } else {
        parsed.titles.push(line.replace(/^["“]|["”]$/g, "").trim());
        continue;
      }
    }

    if (isSectionHeading(line) || isSubsectionHeading(line) || !current) {
      if (current) {
        flushBuffer(current.blocks, buffer);
        parsed.sections.push(current);
      }
      if (isSectionHeading(line)) {
        const match = line.match(SECTION_RE)!;
        current = makeSection(match[1], match[2].trim(), 1);
        continue;
      }
      if (isSubsectionHeading(line)) {
        const match = line.match(SUBSECTION_RE)!;
        current = makeSection(match[1], match[2].trim(), 2);
        continue;
      }
      current = makeSection("", line, 1);
      continue;
    }

    if (isListItem(line)) {
      if (buffer.kind !== "list") flushBuffer(current.blocks, buffer);
      buffer.kind = "list";
      buffer.items.push(line.replace(LIST_RE, "$1").trim());
      continue;
    }

    if (isMetaLine(line)) {
      if (buffer.kind !== "meta") flushBuffer(current.blocks, buffer);
      buffer.kind = "meta";
      const match = line.match(META_RE)!;
      buffer.entries.push({ label: match[1].trim(), value: match[2].trim() });
      continue;
    }

    if (buffer.kind !== "paragraph") flushBuffer(current.blocks, buffer);
    buffer.kind = "paragraph";
    buffer.paragraph = buffer.paragraph ? `${buffer.paragraph} ${line}` : line;
  }

  if (current) {
    flushBuffer(current.blocks, buffer);
    parsed.sections.push(current);
  }

  if (parsed.sections.length === 0) {
    parsed.fallbackParagraphs = raw
      .replace(/\r\n/g, "\n")
      .split(/\n{2,}/)
      .map((p) => p.replace(/\s+/g, " ").trim())
      .filter(Boolean);
  }

  return parsed;
}

function mergeMetaEntries(existing: ReportMetaEntry[], defaults: ReportMetaEntry[]): EditorMetaEntry[] {
  const remaining = new Map(existing.map((entry) => [entry.label.toLowerCase(), entry]));
  const result: EditorMetaEntry[] = [];
  for (const def of defaults) {
    const found = remaining.get(def.label.toLowerCase());
    result.push({
      key: newKey(),
      label: def.label,
      value: found?.value ?? def.value,
    });
    if (found) remaining.delete(def.label.toLowerCase());
  }
  for (const extra of remaining.values()) {
    result.push({ key: newKey(), ...extra });
  }
  if (result.length === 0) result.push({ key: newKey(), label: "", value: "" });
  return result;
}

function toEditorBlock(block: ReportBlock, metaDefaults: ReportMetaEntry[] = []): EditorBlock {
  if (block.type === "paragraph") return { key: newKey(), type: "paragraph", text: block.text };
  if (block.type === "list") return { key: newKey(), type: "list", items: block.items.length ? block.items : [""] };
  return {
    key: newKey(),
    type: "meta",
    entries: mergeMetaEntries(block.entries, metaDefaults),
  };
}

function withDefaultHeaderMeta(entries: ReportMetaEntry[]): EditorMetaEntry[] {
  return mergeMetaEntries(entries, DEFAULT_HEADER_META);
}

function toTitleLines(titles: string[]): EditorReport["titles"] {
  if (titles.length === 0) {
    return [
      { key: newKey(), text: "" },
      { key: newKey(), text: "An Initiative by SEED FOUNDATION" },
    ];
  }
  const lines = titles.map((text) => ({ key: newKey(), text }));
  if (/^an initiative by/i.test(titles[0])) {
    return [{ key: newKey(), text: "" }, ...lines];
  }
  return lines;
}

function toEditorSections(sections: ReportSection[]): EditorSection[] {
  return sections.map((section) => {
    const organizing = /organizing details/i.test(section.title);
    let blocks = section.blocks;
    if (organizing) {
      const metaIndex = blocks.findIndex((block) => block.type === "meta");
      if (metaIndex < 0) {
        blocks = [{ type: "meta", entries: DEFAULT_ORGANIZING_META }, ...blocks];
      }
    }
    return {
      key: newKey(),
      number: section.number,
      title: section.title,
      level: section.level,
      blocks: blocks.length
        ? blocks.map((block, index) =>
            toEditorBlock(
              block,
              organizing && block.type === "meta" && index === blocks.findIndex((item) => item.type === "meta")
                ? DEFAULT_ORGANIZING_META
                : [],
            ),
          )
        : [{ key: newKey(), type: "paragraph", text: "" }],
    };
  });
}

export function createEmptyReport(): EditorReport {
  return {
    kicker: "Project Report",
    titles: [
      { key: newKey(), text: "" },
      { key: newKey(), text: "An Initiative by SEED FOUNDATION" },
    ],
    headerMeta: DEFAULT_HEADER_META.map((entry) => ({ key: newKey(), ...entry })),
    sections: DEFAULT_SECTION_DEFS.map((section) => ({
      key: newKey(),
      number: section.number,
      title: section.title,
      level: section.level,
      blocks: section.blocks.map((block) => toEditorBlock(block)),
    })),
  };
}

export function toEditorReport(raw: string): EditorReport {
  if (!raw.trim()) return createEmptyReport();

  const parsed = parseReportBody(raw);
  let sections = parsed.sections;
  if (sections.length === 0 && parsed.fallbackParagraphs.length) {
    sections = [
      {
        id: "introduction",
        number: "1",
        title: "Introduction",
        level: 1,
        blocks: parsed.fallbackParagraphs.map((text) => ({ type: "paragraph" as const, text })),
      },
    ];
  }

  if (
    parsed.titles.length === 0 &&
    parsed.headerMeta.length === 0 &&
    sections.length === 0
  ) {
    return createEmptyReport();
  }

  return {
    kicker: parsed.kicker ?? "Project Report",
    titles: toTitleLines(parsed.titles),
    headerMeta: withDefaultHeaderMeta(parsed.headerMeta),
    sections: toEditorSections(sections),
  };
}

export function serializeReportBody(report: EditorReport): string {
  const lines: string[] = [];
  const kicker = report.kicker.trim();
  if (kicker) {
    lines.push(/^project report$/i.test(kicker) ? "PROJECT REPORT" : kicker);
  }
  for (const title of report.titles) {
    if (title.text.trim()) lines.push(title.text.trim());
  }

  const headerMeta = report.headerMeta.filter((entry) => entry.label.trim() && entry.value.trim());
  if (headerMeta.length) {
    if (lines.length) lines.push("");
    for (const entry of headerMeta) {
      lines.push(`${entry.label.trim()}: ${entry.value.trim()}`);
    }
  }

  for (const section of report.sections) {
    const title = section.title.trim();
    const number = section.number.trim();
    if (!title && !number && section.blocks.length === 0) continue;

    lines.push("");
    if (section.level === 2 && number) {
      lines.push(`${number} ${title}`.trim());
    } else if (number) {
      lines.push(`${number}. ${title}`.trim());
    } else if (title) {
      lines.push(title);
    }

    for (const block of section.blocks) {
      const started = lines.length;
      if (block.type === "paragraph") {
        const text = block.text.replace(/\s+/g, " ").trim();
        if (text) lines.push(text);
      } else if (block.type === "list") {
        for (const item of block.items) {
          if (item.trim()) lines.push(`- ${item.trim()}`);
        }
      } else {
        for (const entry of block.entries) {
          if (entry.label.trim() && entry.value.trim()) {
            lines.push(`${entry.label.trim()}: ${entry.value.trim()}`);
          }
        }
      }
      if (lines.length > started) lines.push("");
    }
  }

  return lines.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}

export function nextSectionNumber(sections: EditorSection[]): string {
  const tops = sections
    .filter((section) => section.level === 1)
    .map((section) => parseInt(section.number, 10))
    .filter((n) => !Number.isNaN(n));
  return String((tops.length ? Math.max(...tops) : 0) + 1);
}

export function nextSubsectionNumber(sections: EditorSection[], afterIndex: number): string {
  let parent = "1";
  for (let i = afterIndex; i >= 0; i -= 1) {
    const section = sections[i];
    if (section.level === 1 && section.number) {
      parent = section.number;
      break;
    }
    if (section.level === 2 && section.number.includes(".")) {
      parent = section.number.split(".")[0];
      break;
    }
  }
  const prefix = `${parent}.`;
  const subs = sections
    .filter((section) => section.number.startsWith(prefix))
    .map((section) => parseInt(section.number.slice(prefix.length), 10))
    .filter((n) => !Number.isNaN(n));
  return `${parent}.${(subs.length ? Math.max(...subs) : 0) + 1}`;
}
