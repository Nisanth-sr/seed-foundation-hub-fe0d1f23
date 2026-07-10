import { BIG_FIVE_QUESTIONS, RIASEC_QUESTIONS, type BigFiveTrait, type RiasecType } from "./career-questions";

export type BigFiveScores = Record<BigFiveTrait, number>; // 0-100
export type RiasecScores = Record<RiasecType, number>; // 0-100

export function scoreBigFive(answers: Record<string, number>): BigFiveScores {
  const traits: BigFiveTrait[] = ["O", "C", "E", "A", "N"];
  const result = { O: 0, C: 0, E: 0, A: 0, N: 0 } as BigFiveScores;
  const counts = { O: 0, C: 0, E: 0, A: 0, N: 0 } as Record<BigFiveTrait, number>;
  for (const q of BIG_FIVE_QUESTIONS) {
    const raw = answers[q.id];
    if (typeof raw !== "number") continue;
    const val = q.reverse ? 6 - raw : raw;
    result[q.trait] += val;
    counts[q.trait] += 1;
  }
  for (const t of traits) {
    const c = counts[t];
    // Scale mean (1-5) to 0-100
    result[t] = c > 0 ? Math.round(((result[t] / c - 1) / 4) * 100) : 0;
  }
  return result;
}

export function scoreRiasec(answers: Record<string, number>): RiasecScores {
  const types: RiasecType[] = ["R", "I", "A", "S", "E", "C"];
  const result = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 } as RiasecScores;
  const counts = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 } as Record<RiasecType, number>;
  for (const q of RIASEC_QUESTIONS) {
    const raw = answers[q.id];
    if (typeof raw !== "number") continue;
    result[q.type] += raw;
    counts[q.type] += 1;
  }
  for (const t of types) {
    const c = counts[t];
    result[t] = c > 0 ? Math.round(((result[t] / c - 1) / 4) * 100) : 0;
  }
  return result;
}

export function hollandCode(scores: RiasecScores): string {
  const types: RiasecType[] = ["R", "I", "A", "S", "E", "C"];
  return types
    .map((t) => [t, scores[t]] as const)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([t]) => t)
    .join("");
}

export function level(score: number): "low" | "moderate" | "high" | "veryhigh" {
  if (score < 35) return "low";
  if (score < 60) return "moderate";
  if (score < 80) return "high";
  return "veryhigh";
}

export type CareerRecord = {
  key: string;
  title_en: string;
  title_ta: string;
  riasec: RiasecType[]; // ideal fit types
  bigfive: Partial<Record<BigFiveTrait, number>>; // ideal trait weights 0-100
  industry: string;
  salary_en: string;
  salary_ta: string;
  growth_en: string;
  growth_ta: string;
  skills_en: string[];
  skills_ta: string[];
  education_en: string;
  education_ta: string;
};

export const CAREERS: CareerRecord[] = [
  { key: "software_engineer", title_en: "Software Engineer", title_ta: "மென்பொருள் பொறியாளர்", riasec: ["I", "R", "C"], bigfive: { O: 75, C: 75, N: 65 }, industry: "Technology", salary_en: "₹6–35 LPA", salary_ta: "₹6–35 லட்சம்/ஆண்டு", growth_en: "Very high", growth_ta: "மிக அதிக", skills_en: ["Programming", "Problem solving", "System design"], skills_ta: ["நிரலாக்கம்", "பிரச்சினை தீர்த்தல்", "அமைப்பு வடிவமைப்பு"], education_en: "BE/BTech CS or equivalent bootcamp", education_ta: "BE/BTech CS அல்லது இணையான பயிற்சி" },
  { key: "data_scientist", title_en: "Data Scientist", title_ta: "தரவு விஞ்ஞானி", riasec: ["I", "C"], bigfive: { O: 80, C: 75, N: 60 }, industry: "Analytics", salary_en: "₹8–40 LPA", salary_ta: "₹8–40 லட்சம்/ஆண்டு", growth_en: "Very high", growth_ta: "மிக அதிக", skills_en: ["Statistics", "Python", "Machine learning"], skills_ta: ["புள்ளியியல்", "Python", "இயந்திர கற்றல்"], education_en: "Bachelor's + specialization in ML/stats", education_ta: "இளங்கலை + ML/புள்ளியியல் சிறப்பு" },
  { key: "product_designer", title_en: "Product Designer", title_ta: "தயாரிப்பு வடிவமைப்பாளர்", riasec: ["A", "I", "E"], bigfive: { O: 85, A: 65, E: 60 }, industry: "Design/Tech", salary_en: "₹6–30 LPA", salary_ta: "₹6–30 லட்சம்/ஆண்டு", growth_en: "High", growth_ta: "அதிக", skills_en: ["UX research", "Figma", "Interaction design"], skills_ta: ["UX ஆராய்ச்சி", "Figma", "இடைவினை வடிவமைப்பு"], education_en: "Design degree or portfolio-driven path", education_ta: "வடிவமைப்பு பட்டம் அல்லது portfolio பாதை" },
  { key: "civil_engineer", title_en: "Civil Engineer", title_ta: "பொது பொறியாளர்", riasec: ["R", "I", "C"], bigfive: { C: 75, O: 55 }, industry: "Construction", salary_en: "₹4–18 LPA", salary_ta: "₹4–18 லட்சம்/ஆண்டு", growth_en: "Moderate", growth_ta: "மிதமான", skills_en: ["AutoCAD", "Structural analysis", "Project management"], skills_ta: ["AutoCAD", "கட்டமைப்பு பகுப்பாய்வு", "திட்ட மேலாண்மை"], education_en: "BE/BTech Civil Engineering", education_ta: "BE/BTech பொது பொறியியல்" },
  { key: "doctor", title_en: "Physician", title_ta: "மருத்துவர்", riasec: ["I", "S"], bigfive: { C: 80, A: 75, N: 70 }, industry: "Healthcare", salary_en: "₹8–50 LPA", salary_ta: "₹8–50 லட்சம்/ஆண்டு", growth_en: "High", growth_ta: "அதிக", skills_en: ["Diagnostics", "Empathy", "Clinical judgment"], skills_ta: ["நோய் கண்டறிதல்", "பரிவு", "மருத்துவ முடிவு"], education_en: "MBBS + specialization", education_ta: "MBBS + சிறப்பு" },
  { key: "psychologist", title_en: "Psychologist / Counselor", title_ta: "உளவியலாளர் / ஆலோசகர்", riasec: ["S", "I", "A"], bigfive: { A: 80, O: 70, N: 65 }, industry: "Mental health", salary_en: "₹4–20 LPA", salary_ta: "₹4–20 லட்சம்/ஆண்டு", growth_en: "High", growth_ta: "அதிக", skills_en: ["Active listening", "Assessment", "Therapy"], skills_ta: ["கூர்ந்து கேட்டல்", "மதிப்பீடு", "சிகிச்சை"], education_en: "MA/MSc Psychology + license", education_ta: "MA/MSc உளவியல் + உரிமம்" },
  { key: "teacher", title_en: "Teacher / Educator", title_ta: "ஆசிரியர் / கல்வியாளர்", riasec: ["S", "A", "C"], bigfive: { A: 75, C: 70, E: 60 }, industry: "Education", salary_en: "₹3–12 LPA", salary_ta: "₹3–12 லட்சம்/ஆண்டு", growth_en: "Steady", growth_ta: "நிலையான", skills_en: ["Communication", "Curriculum design", "Classroom management"], skills_ta: ["தொடர்பு", "பாடத்திட்ட வடிவமைப்பு", "வகுப்பறை மேலாண்மை"], education_en: "B.Ed or subject Master's", education_ta: "B.Ed அல்லது பாடத் தேர்ச்சி முதுகலை" },
  { key: "entrepreneur", title_en: "Entrepreneur / Founder", title_ta: "தொழில்முனைவோர் / நிறுவனர்", riasec: ["E", "I", "A"], bigfive: { O: 80, E: 70, N: 65, C: 65 }, industry: "Business", salary_en: "Variable", salary_ta: "மாறக்கூடியது", growth_en: "Very high (risk)", growth_ta: "மிக அதிக (ஆபத்து)", skills_en: ["Vision", "Sales", "Execution"], skills_ta: ["தொலைநோக்கு", "விற்பனை", "செயலாக்கம்"], education_en: "Any degree; MBA optional", education_ta: "எந்தப் பட்டமும்; MBA விருப்பம்" },
  { key: "financial_analyst", title_en: "Financial Analyst", title_ta: "நிதிப் பகுப்பாய்வாளர்", riasec: ["C", "I", "E"], bigfive: { C: 80, O: 60 }, industry: "Finance", salary_en: "₹5–25 LPA", salary_ta: "₹5–25 லட்சம்/ஆண்டு", growth_en: "High", growth_ta: "அதிக", skills_en: ["Excel/SQL", "Valuation", "Reporting"], skills_ta: ["Excel/SQL", "மதிப்பீடு", "அறிக்கை"], education_en: "BCom/BBA + CFA optional", education_ta: "BCom/BBA + CFA விருப்பம்" },
  { key: "graphic_designer", title_en: "Graphic Designer", title_ta: "வரைகலை வடிவமைப்பாளர்", riasec: ["A", "E"], bigfive: { O: 85, A: 60 }, industry: "Media", salary_en: "₹3–15 LPA", salary_ta: "₹3–15 லட்சம்/ஆண்டு", growth_en: "Moderate", growth_ta: "மிதமான", skills_en: ["Typography", "Adobe Suite", "Branding"], skills_ta: ["எழுத்தமைப்பு", "Adobe Suite", "பிராண்டிங்"], education_en: "Design diploma or self-taught portfolio", education_ta: "வடிவமைப்பு டிப்ளோமா அல்லது சுய கற்ற portfolio" },
  { key: "marketing_manager", title_en: "Marketing Manager", title_ta: "சந்தைப்படுத்தல் மேலாளர்", riasec: ["E", "A", "S"], bigfive: { E: 75, O: 65, C: 65 }, industry: "Marketing", salary_en: "₹6–28 LPA", salary_ta: "₹6–28 லட்சம்/ஆண்டு", growth_en: "High", growth_ta: "அதிக", skills_en: ["Storytelling", "Analytics", "Campaigns"], skills_ta: ["கதைசொல்லல்", "பகுப்பாய்வு", "பிரச்சாரங்கள்"], education_en: "BBA/MBA Marketing", education_ta: "BBA/MBA சந்தைப்படுத்தல்" },
  { key: "research_scientist", title_en: "Research Scientist", title_ta: "ஆராய்ச்சி விஞ்ஞானி", riasec: ["I", "A"], bigfive: { O: 85, C: 75 }, industry: "R&D", salary_en: "₹6–30 LPA", salary_ta: "₹6–30 லட்சம்/ஆண்டு", growth_en: "Moderate", growth_ta: "மிதமான", skills_en: ["Research methods", "Writing", "Domain expertise"], skills_ta: ["ஆராய்ச்சி முறைகள்", "எழுத்து", "துறை நிபுணத்துவம்"], education_en: "MSc/PhD in field", education_ta: "MSc/PhD துறையில்" },
  { key: "nurse", title_en: "Registered Nurse", title_ta: "பதிவு செய்யப்பட்ட செவிலியர்", riasec: ["S", "R", "I"], bigfive: { A: 80, C: 75, N: 70 }, industry: "Healthcare", salary_en: "₹3–10 LPA", salary_ta: "₹3–10 லட்சம்/ஆண்டு", growth_en: "High", growth_ta: "அதிக", skills_en: ["Patient care", "Clinical procedures", "Compassion"], skills_ta: ["நோயாளர் பராமரிப்பு", "மருத்துவ நடைமுறைகள்", "இரக்கம்"], education_en: "BSc Nursing", education_ta: "BSc செவிலியம்" },
  { key: "accountant", title_en: "Accountant / CA", title_ta: "கணக்காளர் / CA", riasec: ["C", "E"], bigfive: { C: 85 }, industry: "Finance", salary_en: "₹4–20 LPA", salary_ta: "₹4–20 லட்சம்/ஆண்டு", growth_en: "Steady", growth_ta: "நிலையான", skills_en: ["Bookkeeping", "Tax", "Audit"], skills_ta: ["கணக்கு பராமரிப்பு", "வரி", "தணிக்கை"], education_en: "BCom + CA/CMA", education_ta: "BCom + CA/CMA" },
  { key: "content_writer", title_en: "Content Writer / Journalist", title_ta: "உள்ளடக்க எழுத்தாளர் / பத்திரிகையாளர்", riasec: ["A", "I", "S"], bigfive: { O: 80, C: 60 }, industry: "Media", salary_en: "₹3–15 LPA", salary_ta: "₹3–15 லட்சம்/ஆண்டு", growth_en: "Moderate", growth_ta: "மிதமான", skills_en: ["Writing", "Research", "Editing"], skills_ta: ["எழுத்து", "ஆராய்ச்சி", "திருத்தம்"], education_en: "BA Communications/English", education_ta: "BA தொடர்பாடல்/ஆங்கிலம்" },
];

export type CareerMatch = {
  career: CareerRecord;
  score: number; // 0-100
  reasons: string[];
};

export function matchCareers(bf: BigFiveScores, ri: RiasecScores, topN = 10): CareerMatch[] {
  const results: CareerMatch[] = CAREERS.map((c) => {
    // RIASEC fit: mean of top-3-picked types' scores, weighted by rank
    const weights = [1, 0.7, 0.5];
    let rSum = 0;
    let rW = 0;
    c.riasec.forEach((t, i) => {
      const w = weights[i] ?? 0.3;
      rSum += (ri[t] ?? 0) * w;
      rW += w;
    });
    const rFit = rW > 0 ? rSum / rW : 0;

    // Big Five fit: 100 - avg |ideal - actual| across specified traits
    const traits = Object.keys(c.bigfive) as BigFiveTrait[];
    let diff = 0;
    let n = 0;
    for (const t of traits) {
      const ideal = c.bigfive[t]!;
      diff += Math.abs(ideal - (bf[t] ?? 0));
      n += 1;
    }
    const bfFit = n > 0 ? Math.max(0, 100 - diff / n) : 50;

    const score = Math.round(rFit * 0.6 + bfFit * 0.4);

    const reasons: string[] = [];
    if (c.riasec[0] && (ri[c.riasec[0]] ?? 0) >= 60) reasons.push(`Strong ${c.riasec[0]} interest match`);
    for (const t of traits) {
      if (Math.abs(c.bigfive[t]! - (bf[t] ?? 0)) <= 15) reasons.push(`${t} trait aligns well`);
    }
    if (reasons.length === 0) reasons.push("Balanced overall fit");

    return { career: c, score, reasons };
  });
  return results.sort((a, b) => b.score - a.score).slice(0, topN);
}
