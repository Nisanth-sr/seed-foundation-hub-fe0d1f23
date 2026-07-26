"use client";

import { type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { track } from "@/lib/analytics";

export function ContactForm() {
  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    track("Contact Submit");
    toast.success("Message received (demo mode). We’ll connect this to our form provider soon.");
    e.currentTarget.reset();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 border border-foreground p-6 md:p-8">
      <h2 className="text-2xl font-semibold">Send a message</h2>
      <div>
        <label htmlFor="name" className="mb-1 block text-sm font-semibold">
          Name
        </label>
        <input id="name" name="name" required className="h-11 w-full border border-foreground bg-background px-3" />
      </div>
      <div>
        <label htmlFor="email" className="mb-1 block text-sm font-semibold">
          Email
        </label>
        <input id="email" name="email" type="email" required className="h-11 w-full border border-foreground bg-background px-3" />
      </div>
      <div>
        <label htmlFor="subject" className="mb-1 block text-sm font-semibold">
          Subject
        </label>
        <select id="subject" name="subject" required className="h-11 w-full border border-foreground bg-background px-3">
          <option value="">Select…</option>
          <option>General inquiry</option>
          <option>Volunteer</option>
          <option>Partnership</option>
          <option>Donation</option>
          <option>Press</option>
        </select>
      </div>
      <div>
        <label htmlFor="message" className="mb-1 block text-sm font-semibold">
          Message
        </label>
        <textarea id="message" name="message" required rows={5} className="w-full border border-foreground bg-background px-3 py-2" />
      </div>
      <input type="text" name="website" className="hidden" tabIndex={-1} autoComplete="off" aria-hidden />
      <Button type="submit" variant="primary" size="lg">
        Send message
      </Button>
    </form>
  );
}
