import { Button } from "@/components/ui/button";

type Props = {
  onLogout: () => void;
  children: React.ReactNode;
};

export function AdminShell({ onLogout, children }: Props) {
  return (
    <div className="min-h-dvh bg-background text-foreground">
      <header className="border-b border-border bg-muted/30">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div>
            <p className="text-sm font-semibold">SEED Assessment Admin</p>
            <p className="text-xs text-muted-foreground">Career Intelligence Console</p>
          </div>
          <Button variant="outline" size="sm" onClick={onLogout}>
            Sign out
          </Button>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
