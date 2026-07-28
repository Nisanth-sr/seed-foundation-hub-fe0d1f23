"use client";

import { type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { track } from "@/lib/analytics";

export function InvolveForms() {
  function stubSubmit(e: FormEvent, type: string) {
    e.preventDefault();
    track(`${type} Sign-up`);
    toast.success("Thank you — your submission was received (demo mode).");
    (e.target as HTMLFormElement).reset();
  }

  return (
    <div className="grid gap-16 lg:grid-cols-2">
      <form className="space-y-4 border border-foreground p-6" onSubmit={(e) => stubSubmit(e, "Volunteer")}>
        <h3 className="text-xl font-semibold">Volunteer</h3>
        <input name="name" required placeholder="Full name" className="h-11 w-full border border-foreground bg-background px-3" />
        <input name="email" type="email" required placeholder="Email" className="h-11 w-full border border-foreground bg-background px-3" />
        <fieldset className="space-y-2 text-sm">
          <legend className="mb-2 font-semibold">Interests</legend>
          {["Health", "Education", "Environment", "Disaster Relief"].map((i) => (
            <label key={i} className="flex items-center gap-2">
              <input type="checkbox" name="interests" value={i} className="h-4 w-4 accent-primary" />
              {i}
            </label>
          ))}
        </fieldset>
        <input name="availability" placeholder="Availability" className="h-11 w-full border border-foreground bg-background px-3" />
        <textarea name="message" rows={3} placeholder="Message" className="w-full border border-foreground bg-background px-3 py-2" />
        <input type="text" name="website" className="hidden" tabIndex={-1} autoComplete="off" aria-hidden />
        <Button type="submit" variant="secondary" className="w-full">
          Submit
        </Button>
      </form>

      <form className="space-y-4 border border-foreground p-6" onSubmit={(e) => stubSubmit(e, "Partner")}>
        <h3 className="text-xl font-semibold">Partner</h3>
        <input name="org" required placeholder="Organization name" className="h-11 w-full border border-foreground bg-background px-3" />
        <input name="contact" required placeholder="Contact person" className="h-11 w-full border border-foreground bg-background px-3" />
        <input name="email" type="email" required placeholder="Email" className="h-11 w-full border border-foreground bg-background px-3" />
        <textarea name="interest" rows={4} required placeholder="Partnership interest" className="w-full border border-foreground bg-background px-3 py-2" />
        <input type="text" name="website" className="hidden" tabIndex={-1} autoComplete="off" aria-hidden />
        <Button type="submit" variant="primary" className="w-full">
          Submit
        </Button>
      </form>
    </div>
  );
}
