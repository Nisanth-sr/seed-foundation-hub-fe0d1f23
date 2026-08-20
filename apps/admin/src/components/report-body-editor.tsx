"use client";

import type { ReactNode } from "react";
import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import {
  DEFAULT_ORGANIZING_META,
  nextSectionNumber,
  nextSubsectionNumber,
  newKey,
  type EditorBlock,
  type EditorMetaEntry,
  type EditorReport,
  type EditorSection,
} from "@/lib/parse-report-body";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const selectClassName =
  "flex h-9 rounded border border-foreground bg-background px-2 py-1 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary";

function moveItem<T>(items: T[], index: number, direction: -1 | 1): T[] {
  const next = index + direction;
  if (next < 0 || next >= items.length) return items;
  const copy = [...items];
  const current = copy[index];
  copy[index] = copy[next];
  copy[next] = current;
  return copy;
}

function emptyParagraph(): EditorBlock {
  return { key: newKey(), type: "paragraph", text: "" };
}

function emptyList(): EditorBlock {
  return { key: newKey(), type: "list", items: [""] };
}

function emptyMeta(entries?: EditorMetaEntry[]): EditorBlock {
  return {
    key: newKey(),
    type: "meta",
    entries: entries?.length
      ? entries.map((entry) => ({ ...entry, key: newKey() }))
      : [{ key: newKey(), label: "", value: "" }],
  };
}

function IconButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <Button type="button" size="icon" variant="ghost" aria-label={label} title={label} disabled={disabled} onClick={onClick}>
      {children}
    </Button>
  );
}

export function ReportBodyEditor({
  value,
  onChange,
}: {
  value: EditorReport;
  onChange: (next: EditorReport) => void;
}) {
  function patch(partial: Partial<EditorReport>) {
    onChange({ ...value, ...partial });
  }

  function updateSection(index: number, next: EditorSection) {
    patch({ sections: value.sections.map((section, i) => (i === index ? next : section)) });
  }

  return (
    <div className="space-y-8">
      <p className="text-sm text-muted-foreground">
        These fields match the project report visitors see on Our Stories: a header, details grid, numbered
        sections, bullet lists, and labelled facts.
      </p>

      <div className="border border-foreground">
        <div className="bg-foreground px-4 py-3">
          <Label htmlFor="report-kicker" className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
            Header label
          </Label>
          <Input
            id="report-kicker"
            className="mt-2 border-primary/40 bg-background text-xs font-semibold uppercase tracking-[0.18em]"
            value={value.kicker}
            onChange={(e) => patch({ kicker: e.target.value })}
          />
        </div>
        <div className="space-y-4 px-4 py-5">
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <Label>Report titles</Label>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => patch({ titles: [...value.titles, { key: newKey(), text: "" }] })}
              >
                <Plus className="h-3.5 w-3.5" />
                Add line
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">First line is the large title on the website. Extra lines sit underneath.</p>
            {value.titles.map((title, index) => (
              <div key={title.key} className="flex gap-2">
                <Input
                  value={title.text}
                  placeholder={index === 0 ? "Program name, e.g. Career Guidance Awareness Program" : "Supporting line"}
                  className={index === 0 ? "text-base font-semibold" : undefined}
                  onChange={(e) =>
                    patch({
                      titles: value.titles.map((item) =>
                        item.key === title.key ? { ...item, text: e.target.value } : item,
                      ),
                    })
                  }
                />
                <IconButton
                  label="Remove title line"
                  disabled={value.titles.length === 1}
                  onClick={() => patch({ titles: value.titles.filter((item) => item.key !== title.key) })}
                >
                  <Trash2 className="h-4 w-4" />
                </IconButton>
              </div>
            ))}
          </div>
        </div>
        <div className="border-t border-foreground px-4 py-5">
          <div className="mb-3 flex items-center justify-between gap-2">
            <div>
              <Label>Header details</Label>
              <p className="text-xs text-muted-foreground">Shown as a two-column grid at the top of the report.</p>
            </div>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() =>
                patch({
                  headerMeta: [...value.headerMeta, { key: newKey(), label: "", value: "" }],
                })
              }
            >
              <Plus className="h-3.5 w-3.5" />
              Add detail
            </Button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {value.headerMeta.map((entry) => (
              <MetaFields
                key={entry.key}
                entry={entry}
                onChange={(next) =>
                  patch({
                    headerMeta: value.headerMeta.map((item) => (item.key === entry.key ? next : item)),
                  })
                }
                onRemove={() => patch({ headerMeta: value.headerMeta.filter((item) => item.key !== entry.key) })}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {value.sections.map((section, index) => (
          <SectionEditor
            key={section.key}
            section={section}
            index={index}
            total={value.sections.length}
            onChange={(next) => updateSection(index, next)}
            onMove={(direction) => patch({ sections: moveItem(value.sections, index, direction) })}
            onRemove={() => patch({ sections: value.sections.filter((item) => item.key !== section.key) })}
            onAddSubsection={() => {
              const created: EditorSection = {
                key: newKey(),
                number: nextSubsectionNumber(value.sections, index),
                title: "",
                level: 2,
                blocks: [emptyParagraph()],
              };
              const next = [...value.sections];
              next.splice(index + 1, 0, created);
              patch({ sections: next });
            }}
          />
        ))}
        <Button
          type="button"
          variant="outline"
          onClick={() =>
            patch({
              sections: [
                ...value.sections,
                {
                  key: newKey(),
                  number: nextSectionNumber(value.sections),
                  title: "",
                  level: 1,
                  blocks: [emptyParagraph()],
                },
              ],
            })
          }
        >
          <Plus className="h-4 w-4" />
          Add section
        </Button>
      </div>
    </div>
  );
}

function SectionEditor({
  section,
  index,
  total,
  onChange,
  onMove,
  onRemove,
  onAddSubsection,
}: {
  section: EditorSection;
  index: number;
  total: number;
  onChange: (next: EditorSection) => void;
  onMove: (direction: -1 | 1) => void;
  onRemove: () => void;
  onAddSubsection: () => void;
}) {
  function updateBlock(blockIndex: number, next: EditorBlock) {
    onChange({
      ...section,
      blocks: section.blocks.map((block, i) => (i === blockIndex ? next : block)),
    });
  }

  function addBlock(block: EditorBlock) {
    onChange({ ...section, blocks: [...section.blocks, block] });
  }

  return (
    <section className={section.level === 1 ? "border border-foreground/25 p-4" : "border border-dashed border-foreground/30 p-4 md:ml-10"}>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div className="flex min-w-0 flex-1 flex-wrap items-end gap-2">
          <div className="w-24 space-y-1">
            <Label htmlFor={`section-number-${section.key}`}>No.</Label>
            <Input
              id={`section-number-${section.key}`}
              value={section.number}
              placeholder={section.level === 2 ? "5.1" : "1"}
              onChange={(e) => onChange({ ...section, number: e.target.value })}
            />
          </div>
          <div className="min-w-[160px] flex-1 space-y-1">
            <Label htmlFor={`section-title-${section.key}`}>Section title</Label>
            <Input
              id={`section-title-${section.key}`}
              value={section.title}
              placeholder={section.level === 2 ? "Awareness Talk" : "Introduction"}
              onChange={(e) => onChange({ ...section, title: e.target.value })}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor={`section-level-${section.key}`}>Level</Label>
            <select
              id={`section-level-${section.key}`}
              className={selectClassName}
              value={section.level}
              onChange={(e) => onChange({ ...section, level: Number(e.target.value) as 1 | 2 })}
            >
              <option value={1}>Section</option>
              <option value={2}>Subsection</option>
            </select>
          </div>
        </div>
        <div className="flex flex-wrap gap-1">
          <IconButton label="Move section up" disabled={index === 0} onClick={() => onMove(-1)}>
            <ChevronUp className="h-4 w-4" />
          </IconButton>
          <IconButton label="Move section down" disabled={index === total - 1} onClick={() => onMove(1)}>
            <ChevronDown className="h-4 w-4" />
          </IconButton>
          <IconButton label="Remove section" disabled={total === 1} onClick={onRemove}>
            <Trash2 className="h-4 w-4" />
          </IconButton>
        </div>
      </div>

      <div className="space-y-4">
        {section.blocks.map((block, blockIndex) => (
          <BlockEditor
            key={block.key}
            block={block}
            index={blockIndex}
            total={section.blocks.length}
            onChange={(next) => updateBlock(blockIndex, next)}
            onMove={(direction) =>
              onChange({ ...section, blocks: moveItem(section.blocks, blockIndex, direction) })
            }
            onRemove={() =>
              onChange({
                ...section,
                blocks: section.blocks.length === 1 ? [emptyParagraph()] : section.blocks.filter((item) => item.key !== block.key),
              })
            }
          />
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button type="button" size="sm" variant="outline" onClick={() => addBlock(emptyParagraph())}>
          Add paragraph
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={() => addBlock(emptyList())}>
          Add bullet list
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={() => addBlock(emptyMeta())}>
          Add details grid
        </Button>
        {section.level === 1 ? (
          <Button type="button" size="sm" variant="outline" onClick={onAddSubsection}>
            Add subsection
          </Button>
        ) : null}
        {section.title.toLowerCase().includes("organizing") ? (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => addBlock(emptyMeta(DEFAULT_ORGANIZING_META.map((entry) => ({ key: newKey(), ...entry }))))}
          >
            Insert organizing details
          </Button>
        ) : null}
      </div>
    </section>
  );
}

function BlockEditor({
  block,
  index,
  total,
  onChange,
  onMove,
  onRemove,
}: {
  block: EditorBlock;
  index: number;
  total: number;
  onChange: (next: EditorBlock) => void;
  onMove: (direction: -1 | 1) => void;
  onRemove: () => void;
}) {
  return (
    <div className="space-y-2 border border-foreground/15 bg-muted/40 p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          {block.type === "paragraph" ? "Paragraph" : block.type === "list" ? "Bullet list" : "Details grid"}
        </p>
        <div className="flex gap-1">
          <IconButton label="Move block up" disabled={index === 0} onClick={() => onMove(-1)}>
            <ChevronUp className="h-4 w-4" />
          </IconButton>
          <IconButton label="Move block down" disabled={index === total - 1} onClick={() => onMove(1)}>
            <ChevronDown className="h-4 w-4" />
          </IconButton>
          <IconButton label="Remove block" onClick={onRemove}>
            <Trash2 className="h-4 w-4" />
          </IconButton>
        </div>
      </div>

      {block.type === "paragraph" ? (
        <Textarea
          rows={4}
          value={block.text}
          placeholder="Write this section as it should appear on the website."
          onChange={(e) => onChange({ ...block, text: e.target.value })}
        />
      ) : null}

      {block.type === "list" ? (
        <Textarea
          rows={Math.max(4, block.items.length + 1)}
          value={block.items.join("\n")}
          placeholder={"One point per line\nTo create awareness among participants\nTo encourage early action"}
          onChange={(e) => onChange({ ...block, items: e.target.value.split("\n") })}
        />
      ) : null}

      {block.type === "meta" ? (
        <div className="space-y-2">
          <div className="grid gap-2 sm:grid-cols-2">
            {block.entries.map((entry) => (
              <MetaFields
                key={entry.key}
                entry={entry}
                onChange={(next) =>
                  onChange({
                    ...block,
                    entries: block.entries.map((item) => (item.key === entry.key ? next : item)),
                  })
                }
                onRemove={() =>
                  onChange({
                    ...block,
                    entries:
                      block.entries.length === 1
                        ? [{ key: newKey(), label: "", value: "" }]
                        : block.entries.filter((item) => item.key !== entry.key),
                  })
                }
              />
            ))}
          </div>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() =>
              onChange({
                ...block,
                entries: [...block.entries, { key: newKey(), label: "", value: "" }],
              })
            }
          >
            <Plus className="h-3.5 w-3.5" />
            Add row
          </Button>
        </div>
      ) : null}
    </div>
  );
}

function MetaFields({
  entry,
  onChange,
  onRemove,
}: {
  entry: EditorMetaEntry;
  onChange: (next: EditorMetaEntry) => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex gap-2 border border-foreground/15 bg-background p-3">
      <div className="min-w-0 flex-1 space-y-2">
        <Input
          value={entry.label}
          placeholder="Label, e.g. Program Title"
          onChange={(e) => onChange({ ...entry, label: e.target.value })}
        />
        <Input
          value={entry.value}
          placeholder="Value"
          onChange={(e) => onChange({ ...entry, value: e.target.value })}
        />
      </div>
      <IconButton label="Remove detail" onClick={onRemove}>
        <Trash2 className="h-4 w-4" />
      </IconButton>
    </div>
  );
}
