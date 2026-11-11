"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { FileDown, Plus, Trash2 } from "lucide-react";
import { BudgetInputPanel, selectClassName } from "@/components/budget/budget-input-panel";
import { AllocationSummary } from "@/components/budget/allocation-summary";
import { PerBeneficiaryCard } from "@/components/budget/per-beneficiary-card";
import { ComplianceDashboard } from "@/components/budget/compliance-dashboard";
import { FunderBreakdown } from "@/components/budget/funder-breakdown";
import { DocumentPreview } from "@/components/budget/document-preview";
import { AuditTrail } from "@/components/budget/audit-trail";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { computeBudget } from "@/lib/budget/calc";
import { evaluateCompliance, overallSeverity } from "@/lib/budget/compliance";
import { generateDocument } from "@/lib/budget/documents";
import { SAMPLE_PROJECTS } from "@/lib/budget/sample-data";
import { appendAudit, diffProject, loadAudit, loadProjects, saveProjects } from "@/lib/budget/storage";
import {
  DOCUMENT_KIND_LABELS,
  createEmptyProject,
  type AuditEntry,
  type BudgetProject,
  type DocumentKind,
} from "@/lib/budget/types";

const DOCUMENT_KINDS = Object.keys(DOCUMENT_KIND_LABELS) as DocumentKind[];

export function BudgetPlanner({ actor }: { actor: string }) {
  const [hydrated, setHydrated] = useState(false);
  const [projects, setProjects] = useState<BudgetProject[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [audit, setAudit] = useState<AuditEntry[]>([]);
  const [previewKind, setPreviewKind] = useState<DocumentKind | null>(null);
  const committedRef = useRef<BudgetProject | null>(null);

  useEffect(() => {
    const payload = loadProjects();
    setProjects(payload.projects);
    setActiveId(payload.activeId);
    setAudit(loadAudit());
    committedRef.current = payload.projects.find((item) => item.id === payload.activeId) ?? payload.projects[0] ?? null;
    setHydrated(true);
  }, []);

  const project = projects.find((item) => item.id === activeId) ?? null;
  const computed = useMemo(() => (project ? computeBudget(project) : null), [project]);
  const results = useMemo(
    () => (project && computed ? evaluateCompliance(project, computed) : []),
    [project, computed],
  );
  const preview =
    previewKind && project && computed ? generateDocument(previewKind, project, computed, results) : null;

  function persist(nextProjects: BudgetProject[], nextActive: string | null) {
    setProjects(nextProjects);
    setActiveId(nextActive);
    saveProjects({ projects: nextProjects, activeId: nextActive });
  }

  function log(entry: Omit<AuditEntry, "id" | "at">) {
    setAudit((prev) => appendAudit(prev, entry));
  }

  function commitIfNeeded(current: BudgetProject | null = project) {
    if (!current || !committedRef.current || committedRef.current.id !== current.id) {
      committedRef.current = current;
      return;
    }
    const changes = diffProject(committedRef.current, current);
    if (changes.length === 0) {
      committedRef.current = current;
      return;
    }
    setAudit((prev) => {
      let next = prev;
      for (const change of changes) {
        next = appendAudit(next, {
          actor,
          projectId: current.id,
          projectName: current.name,
          action: "updated",
          field: change.field,
          from: change.from,
          to: change.to,
        });
      }
      return next;
    });
    committedRef.current = current;
  }

  function apply(next: BudgetProject, commit: boolean) {
    const stamped = { ...next, updatedAt: new Date().toISOString() };
    setProjects((prev) => {
      const nextProjects = prev.map((item) => (item.id === stamped.id ? stamped : item));
      saveProjects({ projects: nextProjects, activeId: stamped.id });
      return nextProjects;
    });
    setActiveId(stamped.id);
    if (commit) commitIfNeeded(stamped);
  }

  function createProject() {
    commitIfNeeded();
    const created = createEmptyProject();
    persist([created, ...projects], created.id);
    committedRef.current = created;
    log({ actor, projectId: created.id, projectName: created.name, action: "created" });
    toast.success("New project created");
  }

  function loadSamples() {
    commitIfNeeded();
    const existingIds = new Set(projects.map((item) => item.id));
    const toAdd = SAMPLE_PROJECTS.filter((item) => !existingIds.has(item.id));
    if (toAdd.length === 0) {
      persist(projects, SAMPLE_PROJECTS[0].id);
      committedRef.current = projects.find((item) => item.id === SAMPLE_PROJECTS[0].id) ?? SAMPLE_PROJECTS[0];
      toast.success("Sample projects already loaded");
      return;
    }
    const next = [...toAdd, ...projects];
    persist(next, toAdd[0].id);
    committedRef.current = toAdd[0];
    for (const item of toAdd) {
      log({ actor, projectId: item.id, projectName: item.name, action: "created" });
    }
    toast.success(`Loaded ${toAdd.length} sample project${toAdd.length === 1 ? "" : "s"}`);
  }

  function removeProject() {
    if (!project) return;
    if (!window.confirm(`Delete “${project.name}”? This cannot be undone on this browser.`)) return;
    const next = projects.filter((item) => item.id !== project.id);
    const nextActive = next[0]?.id ?? null;
    persist(next, nextActive);
    committedRef.current = next[0] ?? null;
    log({ actor, projectId: project.id, projectName: project.name, action: "deleted" });
    toast.success("Project deleted");
  }

  function switchProject(id: string) {
    commitIfNeeded();
    persist(projects, id);
    committedRef.current = projects.find((item) => item.id === id) ?? null;
  }

  function onExported(kind: DocumentKind, mode: "print" | "markdown") {
    if (!project) return;
    log({
      actor,
      projectId: project.id,
      projectName: project.name,
      action: "exported",
      field: DOCUMENT_KIND_LABELS[kind],
      to: mode,
    });
    toast.success(mode === "print" ? "Opening print dialog" : "Markdown downloaded");
  }

  if (!hydrated) {
    return (
      <div className="space-y-4">
        <div className="h-10 w-64 animate-pulse rounded bg-muted" />
        <div className="h-72 animate-pulse rounded border border-foreground/20 bg-muted" />
      </div>
    );
  }

  const overall = overallSeverity(results);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Budget & compliance</h1>
          <p className="text-sm text-muted-foreground">
            Plan project spend against Trust Deed objects, Section 11 / 13, and CSR / FCRA / grant rules.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={loadSamples}>
            Load sample projects
          </Button>
          <Button type="button" onClick={createProject}>
            <Plus className="h-4 w-4" /> New project
          </Button>
        </div>
      </div>

      {projects.length === 0 || !project || !computed ? (
        <p className="rounded border border-foreground/20 p-6 text-sm text-muted-foreground">
          No projects yet. Create one or load the SEED sample set to see compliant and flagged budgets.
        </p>
      ) : (
        <>
          <div className="flex flex-wrap items-end gap-3">
            <label className="min-w-[16rem] flex-1 space-y-1.5">
              <span className="text-sm font-medium">Active project</span>
              <select
                className={selectClassName}
                value={project.id}
                onChange={(e) => switchProject(e.target.value)}
              >
                {projects.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>
            <Badge
              variant={overall === "pass" ? "success" : "outline"}
              className={overall === "fail" ? "bg-foreground text-background" : undefined}
            >
              {overall === "fail" ? "Compliance flags" : overall === "warn" ? "Warnings" : "Compliant"}
            </Badge>
            <Button type="button" variant="ghost" size="sm" onClick={removeProject}>
              <Trash2 className="h-4 w-4" /> Delete
            </Button>
          </div>

          <div className="grid gap-6 lg:grid-cols-[minmax(0,24rem)_1fr]">
            <BudgetInputPanel project={project} computed={computed} onChange={apply} />
            <div className="space-y-4">
              <div className="md:hidden">
                <Tabs defaultValue="allocation">
                  <TabsList>
                    <TabsTrigger value="allocation">Allocation</TabsTrigger>
                    <TabsTrigger value="per-head">Per beneficiary</TabsTrigger>
                    <TabsTrigger value="compliance">Compliance</TabsTrigger>
                    <TabsTrigger value="funder">Funder</TabsTrigger>
                  </TabsList>
                  <TabsContent value="allocation">
                    <AllocationSummary computed={computed} />
                  </TabsContent>
                  <TabsContent value="per-head">
                    <PerBeneficiaryCard computed={computed} beneficiaries={project.beneficiaries} />
                  </TabsContent>
                  <TabsContent value="compliance">
                    <ComplianceDashboard results={results} />
                  </TabsContent>
                  <TabsContent value="funder">
                    <FunderBreakdown project={project} computed={computed} />
                  </TabsContent>
                </Tabs>
              </div>
              <div className="hidden gap-4 md:grid md:grid-cols-2">
                <AllocationSummary computed={computed} />
                <PerBeneficiaryCard computed={computed} beneficiaries={project.beneficiaries} />
                <ComplianceDashboard results={results} />
                <FunderBreakdown project={project} computed={computed} />
              </div>

              <div className="flex flex-wrap gap-2">
                {DOCUMENT_KINDS.map((kind) => (
                  <Button key={kind} type="button" variant="outline" onClick={() => setPreviewKind(kind)}>
                    <FileDown className="h-4 w-4" /> {DOCUMENT_KIND_LABELS[kind]}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      <AuditTrail entries={audit} />

      {preview && previewKind && (
        <DocumentPreview
          document={preview}
          onClose={() => setPreviewKind(null)}
          onExported={(mode) => onExported(previewKind, mode)}
        />
      )}
    </div>
  );
}
