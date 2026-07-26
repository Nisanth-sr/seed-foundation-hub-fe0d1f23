"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { track } from "@/lib/analytics";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [success, setSuccess] = useState(false);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    track("Newsletter Signup", { email });
    setSuccess(true);
    setEmail("");
  }

  return (
    <div className="mx-auto max-w-xl text-center">
      <h2 className="text-3xl font-bold md:text-4xl">Join our community</h2>
      <p className="mt-4 text-lg">Stay informed about programs, stories, and ways to get involved.</p>
      {success ? (
        <p className="mt-8 text-lg font-semibold text-primary" role="status">
          Thank you — you&apos;re on the list. (Signup will go live with our email provider.)
        </p>
      ) : (
        <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-3 sm:flex-row">
          <label htmlFor="newsletter-email" className="sr-only">
            Email
          </label>
          <input
            id="newsletter-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email"
            className="h-12 flex-1 border border-foreground bg-background px-4 text-foreground placeholder:text-foreground/50"
          />
          <Button type="submit" variant="primary" size="md">
            Subscribe
          </Button>
        </form>
      )}
    </div>
  );
}
