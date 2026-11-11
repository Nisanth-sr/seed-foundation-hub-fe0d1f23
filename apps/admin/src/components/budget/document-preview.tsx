"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { documentFilename, documentToMarkdown } from "@/lib/budget/documents";
import type { GeneratedDocument } from "@/lib/budget/types";
import { Printer, Download, X } from "lucide-react";

export function DocumentPreview({
  document,
  onClose,
  onExported,
}: {
  document: GeneratedDocument;
  onClose: () => void;
  onExported: (mode: "print" | "markdown") => void;
}) {
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  function downloadMarkdown() {
    const markdown = documentToMarkdown(document);
    const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = window.document.createElement("a");
    anchor.href = url;
    anchor.download = documentFilename(document.kind, document.title);
    window.document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    onExported("markdown");
  }

  function printDocument() {
    onExported("print");
    window.setTimeout(() => window.print(), 50);
  }

  return (
    <div className="print-overlay fixed inset-0 z-50 overflow-y-auto bg-foreground/40 p-4">
      <div className="mx-auto max-w-3xl space-y-3">
        <div className="no-print flex flex-wrap items-center justify-end gap-2">
          <Button type="button" variant="outline" onClick={printDocument}>
            <Printer className="h-4 w-4" /> Print / PDF
          </Button>
          <Button type="button" variant="outline" onClick={downloadMarkdown}>
            <Download className="h-4 w-4" /> Download .md
          </Button>
          <Button type="button" variant="secondary" onClick={onClose}>
            <X className="h-4 w-4" /> Close
          </Button>
        </div>
        <article className="print-doc space-y-6 rounded border border-foreground bg-background p-6 md:p-10">
          <header className="space-y-1 border-b border-foreground pb-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">SEED Foundation</p>
            <h2 className="text-2xl font-semibold">{document.title}</h2>
            <p className="text-sm text-muted-foreground">{document.subtitle}</p>
          </header>
          {document.sections.map((section) => (
            <section key={section.heading} className="space-y-3">
              <h3 className="text-lg font-semibold">{section.heading}</h3>
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph.slice(0, 80)} className="whitespace-pre-wrap text-sm leading-relaxed">
                  {paragraph}
                </p>
              ))}
              {section.table && (
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-sm">
                    <thead>
                      <tr>
                        {section.table.headers.map((header) => (
                          <th key={header} className="border border-foreground bg-muted px-2 py-1 text-left font-medium">
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {section.table.rows.map((row, rowIndex) => (
                        <tr key={`${section.heading}-${rowIndex}`}>
                          {row.map((cell, cellIndex) => (
                            <td key={`${rowIndex}-${cellIndex}`} className="border border-foreground px-2 py-1">
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          ))}
        </article>
      </div>
    </div>
  );
}
