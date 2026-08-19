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

const SECTION_RE = /^(\d+)\.\s+(.+)$/;
const SUBSECTION_RE = /^(\d+\.\d+)\s+(.+)$/;
const LIST_RE = /^[-•]\s+(.+)$/;
const META_RE = /^([A-Za-z][A-Za-z0-9 .&/'-]{0,48}):\s+(.+)$/;

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
  // Avoid treating long sentences with a colon as metadata.
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

  function startSection(number: string, title: string, level: 1 | 2) {
    if (current) {
      flushBuffer(current.blocks, buffer);
      parsed.sections.push(current);
    }
    current = {
      id: `${level}-${number}-${title}`.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      number,
      title,
      level,
      blocks: [],
    };
  }

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

    if (isSectionHeading(line)) {
      const match = line.match(SECTION_RE)!;
      startSection(match[1], match[2].trim(), 1);
      continue;
    }
    if (isSubsectionHeading(line)) {
      const match = line.match(SUBSECTION_RE)!;
      startSection(match[1], match[2].trim(), 2);
      continue;
    }

    if (!current) {
      startSection("", line, 1);
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
