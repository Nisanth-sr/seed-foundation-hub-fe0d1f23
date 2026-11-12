"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

export default function AccessDeniedPage() {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function signOut() {
    setError("");
    setBusy(true);
    try {
      const supabase = await createSupabaseBrowserClient();
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) throw signOutError;
      window.location.assign("/login");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not sign out");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="login-screen">
      <section className="login-card">
        <div className="brand"><span className="brand-mark">S</span><span>SEED Assistant</span></div>
        <h1>Chat access is not enabled</h1>
        <p>Your SEED Foundation account is active, but an administrator has not enabled access to this chatbot.</p>
        <button className="login-submit" type="button" onClick={() => window.location.assign("/")} disabled={busy}>
          Check access again
        </button>
        <button className="login-submit" type="button" onClick={signOut} disabled={busy}>
          {busy ? "Signing out…" : "Sign out"}
        </button>
        {error && <p className="login-error" role="alert">{error}</p>}
      </section>
    </main>
  );
}
