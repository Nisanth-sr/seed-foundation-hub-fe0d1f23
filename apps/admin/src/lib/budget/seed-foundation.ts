import type { DeedObject } from "./types";

export const SEED = {
  name: "SEED Foundation",
  legalName: "SEED FOUNDATION",
  tagline: "Every community deserves the opportunity to thrive.",
  trustReg: "R/Idalagudi/Book-4/23/2018",
  darpan: "TN/2026/1130617",
  pan: "[To be provided]",
  registration12A: "[To be provided]",
  registration80G: "[To be provided]",
  fcraNumber: "[To be provided]",
  email: "contact@seedfound.org",
  url: "https://seedfound.org",
  registeredOffice: "[To be provided]",
  designatedFcraBank: "State Bank of India, New Delhi Main Branch (as designated under FCRA s.17)",
} as const;

export const DEED_OBJECT_DETAILS: Record<
  DeedObject,
  { label: string; description: string; scheduleVii: string }
> = {
  education: {
    label: "Education",
    description:
      "Promoting education, including special education and career guidance, so that students and communities can make informed decisions about their future.",
    scheduleVii: "Schedule VII (ii) — promoting education, including special education",
  },
  "ai-research": {
    label: "AI Research",
    description:
      "Research and applied learning in artificial intelligence in furtherance of educational and skill-development objects of the Trust Deed.",
    scheduleVii:
      "Schedule VII (ii) / (ix) — education and contributions or funds provided to technology incubators and research",
  },
  ict: {
    label: "ICT",
    description:
      "Information and communication technology programmes, including digital literacy, that expand access to education and livelihoods.",
    scheduleVii: "Schedule VII (ii) — promoting education, including digital literacy and ICT skills",
  },
  "skill-development": {
    label: "Skill Development",
    description:
      "Employment-enhancing vocational skills and livelihood training aligned with the Trust Deed objects.",
    scheduleVii: "Schedule VII (ii) — employment enhancing vocational skills",
  },
};
