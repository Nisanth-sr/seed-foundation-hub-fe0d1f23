import Link from "next/link";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { actionLogout } from "@/app/actions/admin";
import { AdminNav } from "@/components/admin-nav";

export function AdminShell({
  children,
  displayName,
}: {
  children: React.ReactNode;
  displayName: string;
}) {
  return (
    <div className="min-h-dvh bg-background">
      <header className="border-b border-foreground">
        <div className="container-x flex h-14 items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <Link href="/" className="font-semibold tracking-tight">
              SEED <span className="text-primary">Admin</span>
            </Link>
            <AdminNav />
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-muted-foreground">{displayName}</span>
            <form action={actionLogout}>
              <Button type="submit" variant="ghost" size="sm">
                <LogOut className="h-4 w-4" /> Sign out
              </Button>
            </form>
          </div>
        </div>
      </header>
      <main className="container-x py-8">{children}</main>
    </div>
  );
}
