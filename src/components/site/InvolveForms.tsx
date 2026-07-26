"use client";

import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { track } from "@/lib/analytics";

const AMOUNTS = [500, 1000, 5000];

export function InvolveForms() {
  const [amount, setAmount] = useState<number | "custom">(1000);
  const [customAmount, setCustomAmount] = useState("");

  function stubSubmit(e: FormEvent, type: string) {
    e.preventDefault();
    track(`${type} Sign-up`);
    toast.success("Thank you — your submission was received (demo mode).");
    (e.target as HTMLFormElement).reset();
  }

  return (
    <div className="grid gap-16 lg:grid-cols-3">
      <form
        id="donate-form"
        className="space-y-4 border border-foreground p-6"
        onSubmit={(e) => {
          e.preventDefault();
          track("Donate Click", {
            amount: amount === "custom" ? customAmount : amount,
          });
          toast.success(
            "Donation flow is ready for Razorpay — payment gateway will be connected with your keys.",
          );
        }}
      >
        <h3 className="text-xl font-semibold">Donate</h3>
        <p className="text-sm">Select an amount (INR). 80G certificates will be available after payment is live.</p>
        <div className="flex flex-wrap gap-2">
          {AMOUNTS.map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => setAmount(a)}
              className={`min-h-11 px-4 py-2 text-sm font-semibold ${
                amount === a ? "bg-primary text-primary-foreground" : "border border-foreground"
              }`}
            >
              ₹{a}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setAmount("custom")}
            className={`min-h-11 px-4 py-2 text-sm font-semibold ${
              amount === "custom" ? "bg-primary text-primary-foreground" : "border border-foreground"
            }`}
          >
            Custom
          </button>
        </div>
        {amount === "custom" && (
          <input
            type="number"
            min={1}
            required
            value={customAmount}
            onChange={(e) => setCustomAmount(e.target.value)}
            placeholder="Amount in INR"
            className="h-11 w-full border border-foreground bg-background px-3"
          />
        )}
        <input name="name" required placeholder="Full name" className="h-11 w-full border border-foreground bg-background px-3" />
        <input name="email" type="email" required placeholder="Email" className="h-11 w-full border border-foreground bg-background px-3" />
        <input type="text" name="website" className="hidden" tabIndex={-1} autoComplete="off" aria-hidden />
        <Button type="submit" variant="primary" className="w-full">
          Continue to pay
        </Button>
      </form>

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
