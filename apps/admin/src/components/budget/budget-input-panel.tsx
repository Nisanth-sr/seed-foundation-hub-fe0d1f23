"use client";

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";
import { formatPct } from "@/lib/budget/calc";
import type { ComputedBudget } from "@/lib/budget/types";
import {
  DEED_OBJECTS,
  DEED_OBJECT_LABELS,
  FUNDER_TYPES,
  FUNDER_TYPE_LABELS,
  createTrainerLine,
  type BudgetProject,
  type DeedObject,
  type FunderType,
} from "@/lib/budget/types";
import { SECTION_11_ACCUMULATION_CAP_PCT } from "@/lib/budget/compliance";

export const selectClassName =
  "flex h-10 w-full rounded border border-foreground bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-primary";

function num(value: string): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function BudgetInputPanel({
  project,
  computed,
  onChange,
}: {
  project: BudgetProject;
  computed: ComputedBudget;
  onChange: (next: BudgetProject, commit: boolean) => void;
}) {
  const latest = useRef(project);
  latest.current = project;
  const form10Required = computed.reservePct > SECTION_11_ACCUMULATION_CAP_PCT;

  function emit(next: BudgetProject, commit: boolean) {
    latest.current = next;
    onChange(next, commit);
  }

  function patch(partial: Partial<BudgetProject>, commit: boolean) {
    emit({ ...latest.current, ...partial }, commit);
  }

  function commitLatest() {
    onChange(latest.current, true);
  }

  function toggleObject(id: DeedObject) {
    const current = latest.current;
    const has = current.deedObjects.includes(id);
    const deedObjects = has ? current.deedObjects.filter((item) => item !== id) : [...current.deedObjects, id];
    emit({ ...current, deedObjects }, true);
  }

  function updateTrainer(id: string, partial: Partial<BudgetProject["trainers"][number]>, commit: boolean) {
    const current = latest.current;
    const trainers = current.trainers.map((line) => (line.id === id ? { ...line, ...partial } : line));
    emit({ ...current, trainers }, commit);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Project inputs</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-1.5">
          <Label htmlFor="budget-name">Project name</Label>
          <Input
            id="budget-name"
            value={project.name}
            onChange={(e) => patch({ name: e.target.value }, false)}
            onBlur={commitLatest}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="budget-funder">Funder type</Label>
          <select
            id="budget-funder"
            className={selectClassName}
            value={project.funderType}
            onChange={(e) => patch({ funderType: e.target.value as FunderType }, true)}
          >
            {FUNDER_TYPES.map((type) => (
              <option key={type} value={type}>
                {FUNDER_TYPE_LABELS[type]}
              </option>
            ))}
          </select>
        </div>

        <fieldset className="space-y-2">
          <legend className="text-sm font-medium">Trust Deed objects</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {DEED_OBJECTS.map((id) => (
              <label key={id} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-primary"
                  checked={project.deedObjects.includes(id)}
                  onChange={() => toggleObject(id)}
                />
                {DEED_OBJECT_LABELS[id]}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="budget-total">Total budget (₹)</Label>
            <Input
              id="budget-total"
              type="number"
              min={0}
              step={1}
              value={project.totalBudget}
              onChange={(e) => patch({ totalBudget: num(e.target.value) }, false)}
              onBlur={commitLatest}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="budget-beneficiaries">Number of beneficiaries</Label>
            <Input
              id="budget-beneficiaries"
              type="number"
              min={0}
              step={1}
              value={project.beneficiaries}
              onChange={(e) => patch({ beneficiaries: num(e.target.value) }, false)}
              onBlur={commitLatest}
            />
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <Label>Trainer costs</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => emit({ ...latest.current, trainers: [...latest.current.trainers, createTrainerLine()] }, true)}
            >
              <Plus className="h-4 w-4" /> Add trainer
            </Button>
          </div>
          <div className="space-y-3">
            {project.trainers.map((line, index) => (
              <div key={line.id} className="space-y-2 rounded border border-foreground/20 p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-medium text-muted-foreground">Trainer {index + 1}</p>
                  {project.trainers.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        emit(
                          { ...latest.current, trainers: latest.current.trainers.filter((item) => item.id !== line.id) },
                          true,
                        )
                      }
                    >
                      <Trash2 className="h-4 w-4" /> Remove
                    </Button>
                  )}
                </div>
                <Input
                  placeholder="Name"
                  value={line.name}
                  onChange={(e) => updateTrainer(line.id, { name: e.target.value }, false)}
                  onBlur={commitLatest}
                />
                <Input
                  type="number"
                  min={0}
                  step={1}
                  placeholder="Cost (₹)"
                  value={line.cost}
                  onChange={(e) => updateTrainer(line.id, { cost: num(e.target.value) }, false)}
                  onBlur={commitLatest}
                />
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    className="h-4 w-4 accent-primary"
                    checked={line.relatedParty}
                    onChange={(e) =>
                      updateTrainer(
                        line.id,
                        { relatedParty: e.target.checked, relationship: e.target.checked ? line.relationship : undefined },
                        true,
                      )
                    }
                  />
                  Related party (s.13 specified person)
                </label>
                {line.relatedParty && (
                  <Input
                    placeholder="Relationship, e.g. Trustee's spouse"
                    value={line.relationship ?? ""}
                    onChange={(e) => updateTrainer(line.id, { relationship: e.target.value }, false)}
                    onBlur={commitLatest}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="budget-material">Material costs (₹)</Label>
            <Input
              id="budget-material"
              type="number"
              min={0}
              step={1}
              value={project.materialCost}
              onChange={(e) => patch({ materialCost: num(e.target.value) }, false)}
              onBlur={commitLatest}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="budget-travel">Travel costs (₹)</Label>
            <Input
              id="budget-travel"
              type="number"
              min={0}
              step={1}
              value={project.travelCost}
              onChange={(e) => patch({ travelCost: num(e.target.value) }, false)}
              onBlur={commitLatest}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="budget-admin">Admin overhead (₹)</Label>
            <Input
              id="budget-admin"
              type="number"
              min={0}
              step={1}
              value={project.adminOverhead}
              onChange={(e) => patch({ adminOverhead: num(e.target.value) }, false)}
              onBlur={commitLatest}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="budget-reserve">Reserve amount (₹)</Label>
            <Input
              id="budget-reserve"
              type="number"
              min={0}
              step={1}
              value={project.reserveAmount}
              onChange={(e) => patch({ reserveAmount: num(e.target.value) }, false)}
              onBlur={commitLatest}
            />
          </div>
        </div>

        <div className={`space-y-3 rounded border p-3 ${form10Required ? "border-foreground" : "border-foreground/20"}`}>
          <div>
            <p className="text-sm font-medium">Form 10 / Section 11(2)</p>
            <p className="text-xs text-muted-foreground">
              Required when reserve exceeds {SECTION_11_ACCUMULATION_CAP_PCT}% (currently {formatPct(computed.reservePct)}
              ).
            </p>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="h-4 w-4 accent-primary"
              checked={project.form10Filed}
              onChange={(e) => patch({ form10Filed: e.target.checked }, true)}
            />
            Form 10 filed / to be filed
          </label>
          {project.form10Filed && (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="budget-form10-purpose">Specified purpose</Label>
                <Input
                  id="budget-form10-purpose"
                  value={project.form10Purpose ?? ""}
                  onChange={(e) => patch({ form10Purpose: e.target.value }, false)}
                  onBlur={commitLatest}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="budget-form10-years">Years (max 5)</Label>
                <Input
                  id="budget-form10-years"
                  type="number"
                  min={1}
                  max={5}
                  step={1}
                  value={project.form10Years ?? ""}
                  onChange={(e) => patch({ form10Years: num(e.target.value) || undefined }, false)}
                  onBlur={commitLatest}
                />
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
