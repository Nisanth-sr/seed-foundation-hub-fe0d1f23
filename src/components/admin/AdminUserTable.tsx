import { useMemo, useState } from "react";
import { Search, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { CompletedUserSummary } from "@/lib/admin.server";

type Props = {
  users: CompletedUserSummary[];
  onSelectUser: (userId: string) => void;
};

function fmtDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export function AdminUserTable({ users, onSelectUser }: Props) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.displayName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.hollandCode.toLowerCase().includes(q),
    );
  }, [users, query]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Completed Assessments</h1>
          <p className="text-sm text-muted-foreground">
            {users.length} user{users.length !== 1 ? "s" : ""} with both Big Five and RIASEC completed
          </p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search name, email, Holland code…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Users</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Holland</TableHead>
                <TableHead>Top traits</TableHead>
                <TableHead>Completed</TableHead>
                <TableHead>AI</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                    No matching users found
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((u) => (
                  <TableRow
                    key={u.userId}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => onSelectUser(u.userId)}
                  >
                    <TableCell className="font-medium">{u.displayName}</TableCell>
                    <TableCell className="text-muted-foreground">{u.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono">
                        {u.hollandCode}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{u.topTraits.join(", ") || "—"}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {fmtDate(u.riasecCompletedAt ?? u.bigFiveCompletedAt)}
                    </TableCell>
                    <TableCell>
                      {u.hasAnalysis ? (
                        <Badge className="gap-1 bg-primary/10 text-primary hover:bg-primary/10">
                          <Sparkles className="h-3 w-3" /> Done
                        </Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">Pending</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
