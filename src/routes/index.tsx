import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  Brain, Sprout, GraduationCap, FlaskConical, Users, Leaf,
  ArrowRight, FileText, BookOpen, Shield, Cloud, Mail,
  CheckCircle2, Menu, X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import logoShort from "@/assets/seed-logo-short.asset.json";
import logoFull from "@/assets/seed-logo-full.asset.json";
import heroCover from "@/assets/hero-cover.asset.json";

export const Route = createFileRoute("/")({ component: Landing });

// ---------- Unsplash imagery ----------
const IMG = {
  hero: heroCover.url,
  aiEdu: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&w=1200&q=80",
  research: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1200&q=80",
  climate: "https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?auto=format&fit=crop&w=1200&q=80",
  story1: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80",
  story2: "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=800&q=80",
  story3: "https://images.unsplash.com/photo-1544027993-37dbfe43562a?auto=format&fit=crop&w=800&q=80",
  story4: "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=800&q=80",
};


// ---------- Reveal-on-scroll ----------
function useReveal<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add("in-view")),
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return ref;
}

// ---------- Header ----------
function Header() {
  const [open, setOpen] = useState(false);
  const links = [
    { href: "#impact", label: "Impact" },
    { href: "#work", label: "Our Work" },
    { href: "#pillars", label: "Pillars" },
    { href: "#stories", label: "Stories" },
    { href: "#resources", label: "Resources" },
  ];
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background backdrop-blur">
      <div className="container-x flex h-16 items-center justify-between gap-4">
        <a href="#top" className="flex items-center gap-2" aria-label="SEED Foundation home">
          <img src={logoShort.url} alt="SEED Foundation logo" className="h-10 w-auto object-contain" />
        </a>
        <nav className="hidden items-center gap-7 md:flex" aria-label="Primary">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              {l.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <a href="/career" className="hidden sm:inline-flex">
            <Button variant="outline" className="border-border">Sign In</Button>
          </a>
          <a href="#get-involved" className="hidden md:inline-flex">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">Get Involved</Button>
          </a>
          <button
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-border md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      {open && (
        <div className="border-t border-border bg-background md:hidden">
          <nav className="container-x flex flex-col gap-1 py-3" aria-label="Mobile">
            {links.map((l) => (
              <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="rounded-md px-2 py-2 text-sm font-medium hover:bg-muted">
                {l.label}
              </a>
            ))}
            <a href="#get-involved" onClick={() => setOpen(false)}>
              <Button className="mt-2 w-full bg-primary text-primary-foreground hover:bg-primary/90">Get Involved</Button>
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}

// ---------- Hero (parallax) ----------
function Hero() {
  const [y, setY] = useState(0);
  useEffect(() => {
    const onScroll = () => setY(window.scrollY);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <section id="top" className="relative isolate overflow-hidden">
      <div
        className="absolute inset-0 -z-10"
        style={{
          backgroundImage: `linear-gradient(180deg, rgba(255,255,255,0.35), rgba(255,255,255,0.85)), url(${IMG.hero})`,
          backgroundSize: "cover",
          backgroundPosition: `center ${50 + y * 0.05}%`,
        }}
        aria-hidden="true"
      />
      <div className="container-x flex flex-col items-start gap-8 py-24 md:py-36">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">
          <Sprout className="h-3.5 w-3.5" /> A public charitable trust
        </div>
        <h1 className="max-w-4xl text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
          Education <span className="text-primary">+</span> AI{" "}
          <span className="text-primary">+</span> Climate Action{" "}
          <span className="block text-primary">for a Sustainable Future.</span>
        </h1>
        <p className="max-w-2xl text-lg text-muted-foreground md:text-xl">
          SEED Foundation partners with schools, researchers, and communities to build learning
          systems and climate solutions that reach every student, everywhere.
        </p>
        <div className="flex flex-wrap gap-3">
          <a href="#get-involved">
            <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
              Get Involved <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </a>
          <a href="#work">
            <Button size="lg" variant="outline" className="border-foreground/20">
              Explore Our Work
            </Button>
          </a>
        </div>
      </div>
    </section>
  );
}

// ---------- Animated counters ----------
function Counter({ target, suffix = "", label }: { target: number; suffix?: string; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [n, setN] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          const start = performance.now();
          const dur = 1600;
          const tick = (t: number) => {
            const p = Math.min(1, (t - start) / dur);
            setN(Math.floor(target * (1 - Math.pow(1 - p, 3))));
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
          io.disconnect();
        }
      });
    });
    io.observe(el);
    return () => io.disconnect();
  }, [target]);
  const display = target >= 1000 ? `${(n / 1000).toFixed(n >= 1000 ? 1 : 0)}K` : `${n}`;
  return (
    <div ref={ref} className="flex flex-col items-start">
      <div className="font-display text-4xl font-bold text-foreground md:text-5xl">
        {display}
        {suffix}
      </div>
      <div className="mt-2 text-sm text-muted-foreground md:text-base">{label}</div>
    </div>
  );
}

function Impact() {
  const stats = [
    { target: 15000, suffix: "", label: "Students reached" },
    { target: 45, suffix: "", label: "Partner schools" },
    { target: 800, suffix: "", label: "Teachers trained" },
    { target: 25, suffix: "+", label: "Research publications" },
    { target: 10, suffix: "+", label: "AI projects deployed" },
  ];
  return (
    <section id="impact" className="border-y border-border bg-muted/40 py-20 md:py-24">
      <div className="container-x">
        <div className="mb-12 flex flex-col gap-3">
          <span className="text-xs font-semibold uppercase tracking-widest text-primary">Impact at a glance</span>
          <h2 className="max-w-2xl text-3xl font-bold md:text-4xl">Numbers that grow with every classroom we serve.</h2>
        </div>
        <div className="grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-5">
          {stats.map((s) => (
            <Counter key={s.label} {...s} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ---------- Featured work ----------
function FeatureCard({
  icon: Icon, title, body,
}: { icon: typeof Brain; title: string; body: string }) {
  const ref = useReveal<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className="reveal card-hover group relative flex flex-col rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]"
    >
      <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary-soft text-primary transition-transform group-hover:scale-110">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
    </div>
  );
}

function FeaturedWork() {
  const items = [
    { icon: Brain, title: "AI-Powered Learning Systems", body: "Personalized education paths that adapt to each learner's pace, language, and context." },
    { icon: GraduationCap, title: "Digital Skills & Entrepreneurship", body: "Practical tech training that unlocks careers and small-business opportunities for youth." },
    { icon: Leaf, title: "Climate Education Programs", body: "Curriculum and campaigns aligned to SDG 13 — turning awareness into local action." },
    { icon: FlaskConical, title: "AI Research Labs", body: "Applied research on AI for education and sustainability in the Indian context." },
    { icon: Users, title: "Teacher AI Integration", body: "Training educators to use AI responsibly, ethically, and creatively in the classroom." },
    { icon: Sprout, title: "Community Climate Initiatives", body: "Grassroots projects — from tree cover to waste systems — co-designed with communities." },
  ];
  return (
    <section id="work" className="py-24 md:py-28">
      <div className="container-x">
        <div className="mb-12 flex flex-col gap-3">
          <span className="text-xs font-semibold uppercase tracking-widest text-primary">Featured work</span>
          <h2 className="max-w-3xl text-3xl font-bold md:text-4xl">
            Six programs. One mission — resilient learners and resilient communities.
          </h2>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((it) => <FeatureCard key={it.title} {...it} />)}
        </div>
      </div>
    </section>
  );
}

// ---------- Pillar sections ----------
function Pillar({
  eyebrow, title, body, image, reverse,
}: { eyebrow: string; title: string; body: string; image: string; reverse?: boolean }) {
  const ref = useReveal<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={`reveal grid items-center gap-10 md:grid-cols-2 md:gap-16 ${reverse ? "md:[&>div:first-child]:order-2" : ""}`}
    >
      <div className="overflow-hidden rounded-3xl border border-border">
        <img src={image} alt="" className="aspect-[5/4] w-full object-cover transition-transform duration-700 hover:scale-105" loading="lazy" />
      </div>
      <div>
        <span className="text-xs font-semibold uppercase tracking-widest text-primary">{eyebrow}</span>
        <h3 className="mt-3 text-2xl font-bold md:text-4xl">{title}</h3>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground md:text-lg">{body}</p>
      </div>
    </div>
  );
}

function Pillars() {
  return (
    <section id="pillars" className="bg-muted/40 py-24 md:py-28">
      <div className="container-x flex flex-col gap-24">
        <Pillar
          eyebrow="Pillar 01"
          title="AI Transforms Education"
          body="We build machine-learning systems that meet learners where they are — recommending the next lesson, translating content into local languages, and giving teachers real-time insight into what's working. The goal isn't more tech; it's more equity."
          image={IMG.aiEdu}
        />
        <Pillar
          reverse
          eyebrow="Pillar 02"
          title="Research Driving Change"
          body="Our labs publish peer-reviewed papers on AI for education in the Indian context — datasets, evaluations, and methods that others can build on. Open research is the fastest route to trustworthy impact at scale."
          image={IMG.research}
        />
        <Pillar
          eyebrow="Pillar 03"
          title="Scaling Climate Action"
          body="We partner with local governments, schools, and NGOs to design climate programs that survive beyond the pilot. A shared playbook, shared data, and shared ownership turn one initiative into a hundred."
          image={IMG.climate}
        />
      </div>
    </section>
  );
}

// ---------- Impact stories ----------
function Stories() {
  const stories = [
    { img: IMG.story1, tag: "AI Learning", title: "Priya's leap in math", body: "An adaptive tutor helped a Class 8 student in Odisha jump two grade levels in a single year." },
    { img: IMG.story2, tag: "Community", title: "A greener Guntur", body: "Students and residents planted 4,000 saplings and mapped every one using a lightweight app we built." },
    { img: IMG.story3, tag: "AI Learning", title: "Rahul teaches Rahul", body: "A first-generation learner became the classroom's AI ambassador — training peers on prompting and ethics." },
    { img: IMG.story4, tag: "Community", title: "Waste that pays", body: "A women-led collective in Pune turned a segregation pilot into a self-sustaining micro-enterprise." },
  ];
  return (
    <section id="stories" className="py-24 md:py-28">
      <div className="container-x">
        <div className="mb-12 flex flex-col gap-3">
          <span className="text-xs font-semibold uppercase tracking-widest text-primary">Impact stories</span>
          <h2 className="max-w-3xl text-3xl font-bold md:text-4xl">Real transformations, told by the people who lived them.</h2>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stories.map((s) => <StoryCard key={s.title} {...s} />)}
        </div>
      </div>
    </section>
  );
}

function StoryCard({ img, tag, title, body }: { img: string; tag: string; title: string; body: string }) {
  const ref = useReveal<HTMLElement>();
  return (
    <article ref={ref} className="reveal card-hover group flex flex-col overflow-hidden rounded-2xl border border-border bg-card">
      <div className="aspect-[4/3] overflow-hidden">
        <img src={img} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
      </div>
      <div className="flex flex-col gap-2 p-5">
        <span className="text-xs font-semibold uppercase tracking-widest text-primary">{tag}</span>
        <h4 className="text-lg font-semibold">{title}</h4>
        <p className="text-sm leading-relaxed text-muted-foreground">{body}</p>
      </div>
    </article>
  );
}


// ---------- Resources ----------
function Resources() {
  const items = [
    { icon: FileText, title: "Research Papers", body: "Peer-reviewed studies on AI in Indian classrooms." },
    { icon: BookOpen, title: "Curriculum Guides", body: "Ready-to-use lesson plans for teachers and coaches." },
    { icon: Cloud, title: "Climate Toolkits", body: "Playbooks for school and community climate action." },
    { icon: Shield, title: "AI Ethics Frameworks", body: "Guardrails and principles for responsible AI use." },
  ];
  return (
    <section id="resources" className="border-y border-border bg-muted/40 py-24 md:py-28">
      <div className="container-x">
        <div className="mb-12 flex flex-col gap-3">
          <span className="text-xs font-semibold uppercase tracking-widest text-primary">Resources</span>
          <h2 className="max-w-2xl text-3xl font-bold md:text-4xl">Free, open, and made to be shared.</h2>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map(({ icon: Icon, title, body }) => (
            <a key={title} href="#get-involved" className="card-hover group flex flex-col gap-3 rounded-2xl border border-border bg-card p-6">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary-soft text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold">{title}</h3>
              <p className="text-sm text-muted-foreground">{body}</p>
              <span className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-primary">
                Request access <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

// ---------- Forms ----------
function VolunteerForm() {
  const [submitting, setSubmitting] = useState(false);
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    if (!fd.get("name") || !fd.get("email")) return toast.error("Please add your name and email.");
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      (e.target as HTMLFormElement).reset();
      toast.success("Thanks for volunteering! We'll be in touch shortly.", {
        icon: <CheckCircle2 className="h-4 w-4" />,
      });
    }, 700);
  };
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 md:p-8">
      <h3 className="text-xl font-semibold">Volunteer with SEED</h3>
      <p className="-mt-2 text-sm text-muted-foreground">Share a few hours a week. We'll match you to a program.</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="v-name">Full name</Label>
          <Input id="v-name" name="name" required maxLength={80} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="v-email">Email</Label>
          <Input id="v-email" name="email" type="email" required maxLength={120} />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="v-skills">Skills</Label>
        <Input id="v-skills" name="skills" placeholder="e.g. teaching, ML, design, community outreach" maxLength={200} />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="v-interests">Program interests</Label>
        <Textarea id="v-interests" name="interests" rows={3} placeholder="Which programs excite you?" maxLength={500} />
      </div>
      <Button type="submit" disabled={submitting} className="bg-primary text-primary-foreground hover:bg-primary/90">
        {submitting ? "Sending…" : "Submit application"}
      </Button>
    </form>
  );
}

function PartnerForm() {
  const [submitting, setSubmitting] = useState(false);
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    if (!fd.get("org") || !fd.get("email")) return toast.error("Please add your organization and email.");
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      (e.target as HTMLFormElement).reset();
      toast.success("Inquiry received — our partnerships team will reach out.", {
        icon: <CheckCircle2 className="h-4 w-4" />,
      });
    }, 700);
  };
  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6 md:p-8">
      <h3 className="text-xl font-semibold">Partner with SEED</h3>
      <p className="-mt-2 text-sm text-muted-foreground">Foundations, schools, and companies — let's build together.</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="p-org">Organization</Label>
          <Input id="p-org" name="org" required maxLength={120} />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="p-email">Work email</Label>
          <Input id="p-email" name="email" type="email" required maxLength={120} />
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="p-interest">Interest area</Label>
        <Input id="p-interest" name="interest" placeholder="Education / AI research / Climate" maxLength={120} />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="p-message">Message</Label>
        <Textarea id="p-message" name="message" rows={4} placeholder="Tell us what you'd like to explore." maxLength={800} />
      </div>
      <Button type="submit" disabled={submitting} className="bg-primary text-primary-foreground hover:bg-primary/90">
        {submitting ? "Sending…" : "Send inquiry"}
      </Button>
    </form>
  );
}

function GetInvolved() {
  return (
    <section id="get-involved" className="py-24 md:py-28">
      <div className="container-x">
        <div className="mb-12 flex flex-col gap-3">
          <span className="text-xs font-semibold uppercase tracking-widest text-primary">Get involved</span>
          <h2 className="max-w-2xl text-3xl font-bold md:text-4xl">Two ways to grow the movement.</h2>
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <VolunteerForm />
          <PartnerForm />
        </div>
      </div>
    </section>
  );
}

// ---------- Footer ----------
function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="container-x grid gap-10 py-14 md:grid-cols-4">
        <div className="md:col-span-2">
          <img src={logoFull.url} alt="SEED Foundation" className="h-14 w-auto object-contain" />
          <p className="mt-4 max-w-md text-sm text-muted-foreground">
            SEED Foundation is a registered public charitable trust in India, committed to
            transparency, open research, and community-first program design.
          </p>
        </div>
        <div>
          <h4 className="text-sm font-semibold">Explore</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li><a href="#work" className="hover:text-foreground">Our Work</a></li>
            <li><a href="#pillars" className="hover:text-foreground">Pillars</a></li>
            <li><a href="#stories" className="hover:text-foreground">Stories</a></li>
            <li><a href="#resources" className="hover:text-foreground">Resources</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold">Contact</h4>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2"><Mail className="h-4 w-4" /> contact@seedfound.org</li>
            <li><a href="#get-involved" className="hover:text-foreground">Volunteer</a></li>
            <li><a href="#get-involved" className="hover:text-foreground">Partner with us</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="container-x flex flex-col items-start justify-between gap-3 py-5 text-xs text-muted-foreground md:flex-row md:items-center">
          <p>© {new Date().getFullYear()} SEED Foundation. A public charitable trust. All rights reserved.</p>
          <p>Committed to full financial and programmatic transparency. Annual reports available on request.</p>
        </div>
      </div>
    </footer>
  );
}

function Landing() {
  return (
    <main className="min-h-dvh bg-background text-foreground">
      <Header />
      <Hero />
      <Impact />
      <FeaturedWork />
      <Pillars />
      <Stories />
      <Resources />
      <GetInvolved />
      <Footer />
    </main>
  );
}
