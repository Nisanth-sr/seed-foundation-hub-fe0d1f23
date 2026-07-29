import Link from "next/link";
import { Button } from "@/components/ui/button";
import { actionLogout } from "@/app/actions/admin";

export default function UnauthorizedPage() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-lg flex-col items-center justify-center px-4 text-center">
      <h1 className="text-2xl font-semibold">Admin access required</h1>
      <p className="mt-2 text-muted-foreground">
        Your account is signed in but does not have <code>is_admin</code> privileges. Ask a
        database admin to promote your profile.
      </p>
      <div className="mt-6 flex gap-3">
        <Button asChild variant="outline">
          <Link href="/login">Back to login</Link>
        </Button>
        <form action={actionLogout}>
          <Button type="submit" variant="secondary">
            Sign out
          </Button>
        </form>
      </div>
    </div>
  );
}
