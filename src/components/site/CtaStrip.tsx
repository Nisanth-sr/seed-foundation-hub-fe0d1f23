import Link from "next/link";
import { Button } from "@/components/ui/button";

export function CtaStrip() {
  return (
    <section className="bg-foreground py-20 text-background">
      <div className="container-x text-center">
        <h2 className="text-3xl font-bold leading-tight md:text-4xl lg:text-5xl">
          Ready to support communities across Tamil Nadu?
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-lg">
          Join students, educators, volunteers, and institutions strengthening communities together.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Button asChild variant="primary" size="lg">
            <Link href="/get-involved#volunteer">Get Involved</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
