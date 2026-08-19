import { Calendar, MapPin } from "lucide-react";
import { parseReportBody, type ReportBlock, type ReportSection } from "@/lib/parse-report-body";

function BlockView({ block }: { block: ReportBlock }) {
  if (block.type === "paragraph") {
    return <p className="text-base leading-relaxed md:text-lg">{block.text}</p>;
  }

  if (block.type === "list") {
    return (
      <ul className="space-y-3">
        {block.items.map((item) => (
          <li key={item} className="flex gap-3 text-base leading-relaxed md:text-lg">
            <span className="mt-2 h-2 w-2 shrink-0 bg-primary" aria-hidden />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <dl className="grid gap-px border border-foreground bg-foreground sm:grid-cols-2">
      {block.entries.map((entry) => (
        <div key={`${entry.label}-${entry.value}`} className="bg-background px-4 py-3">
          <dt className="text-xs font-semibold uppercase tracking-wide text-primary">{entry.label}</dt>
          <dd className="mt-1 text-sm leading-relaxed md:text-base">{entry.value}</dd>
        </div>
      ))}
    </dl>
  );
}

function SectionView({ section }: { section: ReportSection }) {
  const Heading = section.level === 1 ? "h2" : "h3";
  return (
    <section className={section.level === 1 ? "mt-12 first:mt-0" : "mt-8"}>
      <div className={section.level === 1 ? "flex gap-5 md:gap-8" : "pl-0 md:pl-14"}>
        {section.level === 1 && section.number ? (
          <span className="w-10 shrink-0 pt-1 font-mono text-sm font-semibold text-primary">
            {section.number.padStart(2, "0")}
          </span>
        ) : null}
        <div className="min-w-0 flex-1">
          <Heading
            className={
              section.level === 1
                ? "border-b border-foreground pb-3 text-2xl font-bold leading-snug md:text-3xl"
                : "text-lg font-semibold leading-snug md:text-xl"
            }
          >
            {section.level === 2 && section.number ? (
              <span className="mr-2 font-mono text-sm text-primary">{section.number}</span>
            ) : null}
            {section.title}
          </Heading>
          <div className="mt-5 space-y-5">
            {section.blocks.map((block, index) => (
              <BlockView key={`${section.id}-${index}`} block={block} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function ProjectReportBody({
  body,
  category,
  eventDate,
  venue,
}: {
  body: string;
  category?: string;
  eventDate?: string | null;
  venue?: string | null;
}) {
  const parsed = parseReportBody(body);
  const formattedDate = eventDate
    ? new Date(`${eventDate}T00:00:00`).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <article className="mx-auto max-w-3xl">
      <header className="border border-foreground">
        <div className="bg-foreground px-6 py-3 md:px-8">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
            {parsed.kicker ?? "Project Report"}
          </p>
        </div>
        <div className="space-y-5 px-6 py-8 md:px-8">
          {category ? (
            <span className="inline-block bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
              {category}
            </span>
          ) : null}
          {parsed.titles.length > 0 ? (
            <div className="space-y-2">
              <p className="text-2xl font-bold leading-snug md:text-4xl">{parsed.titles[0]}</p>
              {parsed.titles.slice(1).map((line) => (
                <p key={line} className="text-base leading-relaxed md:text-lg">
                  {line}
                </p>
              ))}
            </div>
          ) : null}
          {(formattedDate || venue) && (
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
              {formattedDate ? (
                <p className="inline-flex items-center gap-2">
                  <Calendar className="h-4 w-4" aria-hidden />
                  {formattedDate}
                </p>
              ) : null}
              {venue ? (
                <p className="inline-flex items-center gap-2">
                  <MapPin className="h-4 w-4" aria-hidden />
                  {venue}
                </p>
              ) : null}
            </div>
          )}
        </div>
        {parsed.headerMeta.length > 0 ? (
          <dl className="grid gap-px border-t border-foreground bg-foreground sm:grid-cols-2">
            {parsed.headerMeta.map((entry) => (
              <div key={`${entry.label}-${entry.value}`} className="bg-background px-6 py-4 md:px-8">
                <dt className="text-xs font-semibold uppercase tracking-wide text-primary">{entry.label}</dt>
                <dd className="mt-1 text-sm leading-relaxed md:text-base">{entry.value}</dd>
              </div>
            ))}
          </dl>
        ) : null}
      </header>

      <div className="mt-12">
        {parsed.sections.length > 0
          ? parsed.sections.map((section) => <SectionView key={section.id} section={section} />)
          : parsed.fallbackParagraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 40)} className="mt-5 text-base leading-relaxed md:text-lg first:mt-0">
                {paragraph}
              </p>
            ))}
      </div>
    </article>
  );
}
