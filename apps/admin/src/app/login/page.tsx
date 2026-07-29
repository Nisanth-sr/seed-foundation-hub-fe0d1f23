import { Suspense } from "react";
import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-[linear-gradient(160deg,#fff_0%,#f4f4f4_45%,#e8f8c8_100%)] px-4">
      <Suspense fallback={<div className="text-sm text-muted-foreground">Loading…</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
