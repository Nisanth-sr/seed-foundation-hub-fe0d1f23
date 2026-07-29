"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { UserListRow } from "@/lib/users";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type Filter = "all" | "completed" | "incomplete" | "ai";

export function UserTable({ users }: { users: UserListRow[] }) {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const filtered = useMemo(() => {
    const s = q.toLowerCase().trim();
    return users.filter((u) => {
      if (filter === "completed" && !(u.bigfiveStatus === "completed" && u.riasecStatus === "completed"))
        return false;
      if (filter === "incomplete" && u.bigfiveStatus === "completed" && u.riasecStatus === "completed")
        return false;
      if (filter === "ai" && !u.hasAnalysis) return false;
      if (!s) return true;
      return (
        u.email.toLowerCase().includes(s) ||
        u.displayName.toLowerCase().includes(s) ||
        (u.hollandCode ?? "").toLowerCase().includes(s)
      );
    });
  }, [users, q, filter]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Input
          placeholder="Search name, email, Holland code…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="max-w-sm"
        />
        {(
          [
            ["all", "All"],
            ["completed", "Completed both"],
            ["incomplete", "Incomplete"],
            ["ai", "Has AI report"],
          ] as const
        ).map(([id, label]) => (
          <Button
            key={id}
            size="sm"
            variant={filter === id ? "primary" : "outline"}
            onClick={() => setFilter(id)}
          >
            {label}
          </Button>
        ))}
        <span className="ml-auto text-sm text-muted-foreground">{filtered.length} users</span>
      </div>

      <div className="overflow-x-auto rounded border border-foreground">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-foreground bg-muted">
            <tr>
              <th className="px-3 py-2 font-semibold">Name</th>
              <th className="px-3 py-2 font-semibold">Email</th>
              <th className="px-3 py-2 font-semibold">Locale</th>
              <th className="px-3 py-2 font-semibold">Big Five</th>
              <th className="px-3 py-2 font-semibold">RIASEC</th>
              <th className="px-3 py-2 font-semibold">Holland</th>
              <th className="px-3 py-2 font-semibold">AI</th>
              <th className="px-3 py-2 font-semibold">Joined</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u.id} className="border-b border-foreground/15 hover:bg-muted/60">
                <td className="px-3 py-2">
                  <Link href={`/users/${u.id}`} className="font-medium underline-offset-2 hover:underline">
                    {u.displayName}
                  </Link>
                </td>
                <td className="px-3 py-2 text-muted-foreground">{u.email}</td>
                <td className="px-3 py-2">{u.locale}</td>
                <td className="px-3 py-2">
                  <StatusBadge status={u.bigfiveStatus} />
                </td>
                <td className="px-3 py-2">
                  <StatusBadge status={u.riasecStatus} />
                </td>
                <td className="px-3 py-2 font-mono text-xs">{u.hollandCode ?? "—"}</td>
                <td className="px-3 py-2">
                  <Badge variant={u.hasAnalysis ? "success" : "muted"}>
                    {u.hasAnalysis ? "Done" : "Pending"}
                  </Badge>
                </td>
                <td className="px-3 py-2 text-muted-foreground">
                  {new Date(u.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} className="px-3 py-8 text-center text-muted-foreground">
                  No users match this filter
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string | null }) {
  if (status === "completed") return <Badge variant="success">Completed</Badge>;
  if (status === "in_progress") return <Badge variant="outline">In progress</Badge>;
  return <Badge variant="muted">None</Badge>;
}
