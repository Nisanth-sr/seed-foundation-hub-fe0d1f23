import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Locale = "en" | "ta";

type Dict = Record<string, string>;

const en: Dict = {
  "brand": "Career Intelligence",
  "brand.tagline": "Discover careers that fit your personality and interests",
  "nav.signin": "Sign In",
  "nav.signup": "Sign Up",
  "nav.signout": "Sign Out",
  "nav.dashboard": "Dashboard",
  "nav.home": "Home",
  "lang.english": "English",
  "lang.tamil": "தமிழ்",
  "theme.toggle": "Toggle theme",
  "landing.hero.title": "Find the career you were built for",
  "landing.hero.subtitle": "Complete two science-backed assessments — Big Five personality and RIASEC interests — and unlock personalized career recommendations.",
  "landing.hero.cta": "Sign in to get started",
  "landing.hero.cta.explore": "Learn more",
  "landing.feature.1.title": "Big Five Personality",
  "landing.feature.1.desc": "Measure Openness, Conscientiousness, Extraversion, Agreeableness, and Emotional Stability.",
  "landing.feature.2.title": "RIASEC Interests",
  "landing.feature.2.desc": "Discover your Holland Code across Realistic, Investigative, Artistic, Social, Enterprising, and Conventional interests.",
  "landing.feature.3.title": "Career Match Report",
  "landing.feature.3.desc": "Get top matched careers with match scores, learning paths, and salary outlook.",
  "landing.privacy": "For career exploration and guidance only — not a psychological diagnosis.",
  "auth.title": "Welcome",
  "auth.subtitle": "Sign in or create an account to start your assessments",
  "auth.tab.signin": "Sign In",
  "auth.tab.signup": "Sign Up",
  "auth.email": "Email",
  "auth.password": "Password",
  "auth.name": "Full name",
  "auth.google": "Continue with Google",
  "auth.or": "or",
  "auth.forgot": "Forgot password?",
  "auth.reset.title": "Reset password",
  "auth.reset.send": "Send reset link",
  "auth.reset.sent": "Check your email for a reset link.",
  "auth.submit.signin": "Sign In",
  "auth.submit.signup": "Create Account",
  "auth.error.generic": "Something went wrong. Please try again.",
  "auth.success.signup": "Account created. You're signed in!",
  "auth.back": "Back to sign in",
  "dash.welcome": "Welcome back",
  "dash.progress": "Your progress",
  "dash.bigfive": "Big Five Personality",
  "dash.riasec": "RIASEC Interests",
  "dash.match": "Career Match Report",
  "dash.status.notstarted": "Not started",
  "dash.status.inprogress": "In progress",
  "dash.status.completed": "Completed",
  "dash.start": "Start",
  "dash.resume": "Resume",
  "dash.review": "View results",
  "dash.match.locked": "Complete both assessments to unlock",
  "dash.match.unlock": "View match report",
  "assess.progress": "Question {current} of {total}",
  "assess.prev": "Previous",
  "assess.next": "Next",
  "assess.finish": "Finish",
  "assess.restart": "Restart",
  "assess.restart.confirm": "Restart from question 1? Your answers will be cleared.",
  "assess.saving": "Saving…",
  "assess.saved": "Auto-saved",
  "assess.scale.1": "Strongly disagree",
  "assess.scale.2": "Disagree",
  "assess.scale.3": "Neutral",
  "assess.scale.4": "Agree",
  "assess.scale.5": "Strongly agree",
  "assess.bigfive.title": "Big Five Personality Assessment",
  "assess.bigfive.intro": "Rate how much you agree with each statement. There are no right or wrong answers.",
  "assess.riasec.title": "RIASEC Interest Assessment",
  "assess.riasec.intro": "Rate how much you would enjoy each activity.",
  "results.bigfive.title": "Your Big Five Results",
  "results.riasec.title": "Your RIASEC Results",
  "results.trait.O": "Openness",
  "results.trait.C": "Conscientiousness",
  "results.trait.E": "Extraversion",
  "results.trait.A": "Agreeableness",
  "results.trait.N": "Emotional Stability",
  "results.riasec.R": "Realistic",
  "results.riasec.I": "Investigative",
  "results.riasec.A": "Artistic",
  "results.riasec.S": "Social",
  "results.riasec.E": "Enterprising",
  "results.riasec.C": "Conventional",
  "results.hollandcode": "Your Holland Code",
  "results.strengths": "Strengths",
  "results.growth": "Growth areas",
  "results.workstyle": "Work style",
  "results.environments": "Preferred environments",
  "results.industries": "Recommended industries",
  "results.careers": "Suggested careers",
  "results.back": "Back to dashboard",
  "results.retake": "Retake assessment",
  "match.title": "Your Career Matches",
  "match.subtitle": "Top careers based on your personality and interests",
  "match.compat": "Overall compatibility",
  "match.reason": "Why this fits you",
  "match.skills": "Key skills",
  "match.salary": "Salary range",
  "match.growth": "Growth outlook",
  "match.education": "Education path",
  "match.locked.title": "Match report locked",
  "match.locked.desc": "Complete both the Big Five and RIASEC assessments to see personalized career recommendations.",
  "level.low": "Low",
  "level.moderate": "Moderate",
  "level.high": "High",
  "level.veryhigh": "Very high",
};

const ta: Dict = {
  "brand": "வாழ்க்கை நுண்ணறிவு",
  "brand.tagline": "உங்கள் ஆளுமை மற்றும் ஆர்வங்களுக்கு ஏற்ற தொழில்களைக் கண்டறியுங்கள்",
  "nav.signin": "உள்நுழை",
  "nav.signup": "பதிவு செய்",
  "nav.signout": "வெளியேறு",
  "nav.dashboard": "டாஷ்போர்டு",
  "nav.home": "முகப்பு",
  "lang.english": "English",
  "lang.tamil": "தமிழ்",
  "theme.toggle": "தீம் மாற்று",
  "landing.hero.title": "உங்களுக்குப் பொருத்தமான தொழிலைக் கண்டறியுங்கள்",
  "landing.hero.subtitle": "இரண்டு அறிவியல் அடிப்படையிலான மதிப்பீடுகளை நிறைவு செய்யுங்கள் — Big Five ஆளுமை மற்றும் RIASEC ஆர்வங்கள் — மற்றும் தனிப்பயனாக்கப்பட்ட தொழில் பரிந்துரைகளை பெறுங்கள்.",
  "landing.hero.cta": "தொடங்க உள்நுழையுங்கள்",
  "landing.hero.cta.explore": "மேலும் அறிக",
  "landing.feature.1.title": "Big Five ஆளுமை",
  "landing.feature.1.desc": "திறந்த மனநிலை, கடமையுணர்வு, வெளிவெளிப்பாடு, இணக்கம் மற்றும் உணர்ச்சி நிலைத்தன்மையை அளவிடுங்கள்.",
  "landing.feature.2.title": "RIASEC ஆர்வங்கள்",
  "landing.feature.2.desc": "நடைமுறை, ஆய்வு, கலை, சமூக, தொழில்முயற்சி மற்றும் மரபு ஆர்வங்களில் உங்கள் Holland குறியீட்டைக் கண்டறியுங்கள்.",
  "landing.feature.3.title": "தொழில் பொருத்த அறிக்கை",
  "landing.feature.3.desc": "சிறந்த பொருத்தமான தொழில்கள், கற்றல் பாதைகள் மற்றும் சம்பள வாய்ப்புகளைப் பெறுங்கள்.",
  "landing.privacy": "தொழில் ஆய்வு மற்றும் வழிகாட்டலுக்காக மட்டுமே — உளவியல் நோயறிதல் அல்ல.",
  "auth.title": "வரவேற்கிறோம்",
  "auth.subtitle": "மதிப்பீடுகளைத் தொடங்க உள்நுழையவும் அல்லது கணக்கை உருவாக்கவும்",
  "auth.tab.signin": "உள்நுழை",
  "auth.tab.signup": "பதிவு செய்",
  "auth.email": "மின்னஞ்சல்",
  "auth.password": "கடவுச்சொல்",
  "auth.name": "முழுப் பெயர்",
  "auth.google": "Google உடன் தொடரவும்",
  "auth.or": "அல்லது",
  "auth.forgot": "கடவுச்சொல் மறந்துவிட்டதா?",
  "auth.reset.title": "கடவுச்சொல்லை மீட்டமை",
  "auth.reset.send": "மீட்டமை இணைப்பை அனுப்பு",
  "auth.reset.sent": "உங்கள் மின்னஞ்சலில் மீட்டமை இணைப்பைச் சரிபார்க்கவும்.",
  "auth.submit.signin": "உள்நுழை",
  "auth.submit.signup": "கணக்கை உருவாக்கு",
  "auth.error.generic": "ஏதோ தவறு ஏற்பட்டது. மீண்டும் முயற்சிக்கவும்.",
  "auth.success.signup": "கணக்கு உருவாக்கப்பட்டது. நீங்கள் உள்நுழைந்துள்ளீர்கள்!",
  "auth.back": "உள்நுழைவுக்குத் திரும்பு",
  "dash.welcome": "மீண்டும் வரவேற்கிறோம்",
  "dash.progress": "உங்கள் முன்னேற்றம்",
  "dash.bigfive": "Big Five ஆளுமை",
  "dash.riasec": "RIASEC ஆர்வங்கள்",
  "dash.match": "தொழில் பொருத்த அறிக்கை",
  "dash.status.notstarted": "தொடங்கவில்லை",
  "dash.status.inprogress": "நடந்து கொண்டிருக்கிறது",
  "dash.status.completed": "முடிந்தது",
  "dash.start": "தொடங்கு",
  "dash.resume": "தொடர்",
  "dash.review": "முடிவுகளைக் காண்",
  "dash.match.locked": "திறக்க இரண்டு மதிப்பீடுகளையும் நிறைவு செய்யுங்கள்",
  "dash.match.unlock": "பொருத்த அறிக்கையைக் காண்",
  "assess.progress": "கேள்வி {current} / {total}",
  "assess.prev": "முந்தைய",
  "assess.next": "அடுத்து",
  "assess.finish": "நிறைவு",
  "assess.restart": "மீண்டும் தொடங்கு",
  "assess.restart.confirm": "கேள்வி 1-லிருந்து மீண்டும் தொடங்கவா? உங்கள் பதில்கள் அழிக்கப்படும்.",
  "assess.saving": "சேமிக்கிறது…",
  "assess.saved": "தானாக சேமிக்கப்பட்டது",
  "assess.scale.1": "வலுவாக ஏற்கவில்லை",
  "assess.scale.2": "ஏற்கவில்லை",
  "assess.scale.3": "நடுநிலை",
  "assess.scale.4": "ஏற்கிறேன்",
  "assess.scale.5": "வலுவாக ஏற்கிறேன்",
  "assess.bigfive.title": "Big Five ஆளுமை மதிப்பீடு",
  "assess.bigfive.intro": "ஒவ்வொரு கூற்றுடன் நீங்கள் எவ்வளவு ஒத்துக்கொள்கிறீர்கள் என மதிப்பிடுங்கள். சரி அல்லது தவறான பதில்கள் இல்லை.",
  "assess.riasec.title": "RIASEC ஆர்வ மதிப்பீடு",
  "assess.riasec.intro": "ஒவ்வொரு செயலையும் நீங்கள் எவ்வளவு விரும்புவீர்கள் என மதிப்பிடுங்கள்.",
  "results.bigfive.title": "உங்கள் Big Five முடிவுகள்",
  "results.riasec.title": "உங்கள் RIASEC முடிவுகள்",
  "results.trait.O": "திறந்த மனநிலை",
  "results.trait.C": "கடமையுணர்வு",
  "results.trait.E": "வெளிவெளிப்பாடு",
  "results.trait.A": "இணக்கம்",
  "results.trait.N": "உணர்ச்சி நிலைத்தன்மை",
  "results.riasec.R": "நடைமுறை",
  "results.riasec.I": "ஆய்வு",
  "results.riasec.A": "கலை",
  "results.riasec.S": "சமூக",
  "results.riasec.E": "தொழில்முயற்சி",
  "results.riasec.C": "மரபு",
  "results.hollandcode": "உங்கள் Holland குறியீடு",
  "results.strengths": "பலங்கள்",
  "results.growth": "வளர்ச்சிப் பகுதிகள்",
  "results.workstyle": "வேலை பாணி",
  "results.environments": "விருப்பமான சூழல்கள்",
  "results.industries": "பரிந்துரைக்கப்பட்ட தொழில்துறைகள்",
  "results.careers": "பரிந்துரைக்கப்பட்ட தொழில்கள்",
  "results.back": "டாஷ்போர்டுக்குத் திரும்பு",
  "results.retake": "மீண்டும் எடு",
  "match.title": "உங்கள் தொழில் பொருத்தங்கள்",
  "match.subtitle": "உங்கள் ஆளுமை மற்றும் ஆர்வங்களின் அடிப்படையில் சிறந்த தொழில்கள்",
  "match.compat": "ஒட்டுமொத்த பொருத்தம்",
  "match.reason": "இது ஏன் உங்களுக்கு ஏற்றது",
  "match.skills": "முக்கிய திறன்கள்",
  "match.salary": "சம்பள வரம்பு",
  "match.growth": "வளர்ச்சி வாய்ப்பு",
  "match.education": "கல்வி பாதை",
  "match.locked.title": "பொருத்த அறிக்கை பூட்டப்பட்டுள்ளது",
  "match.locked.desc": "தனிப்பயனாக்கப்பட்ட தொழில் பரிந்துரைகளைக் காண Big Five மற்றும் RIASEC மதிப்பீடுகளை நிறைவு செய்யுங்கள்.",
  "level.low": "குறைவு",
  "level.moderate": "மிதமான",
  "level.high": "அதிக",
  "level.veryhigh": "மிக அதிக",
};

const dicts: Record<Locale, Dict> = { en, ta };

type Ctx = {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
};

const LocaleContext = createContext<Ctx | null>(null);

export function CareerI18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => {
    const saved = (typeof window !== "undefined" ? localStorage.getItem("career.locale") : null) as Locale | null;
    if (saved === "en" || saved === "ta") setLocaleState(saved);
  }, []);

  const setLocale = (l: Locale) => {
    setLocaleState(l);
    if (typeof window !== "undefined") localStorage.setItem("career.locale", l);
  };

  const t = (key: string, vars?: Record<string, string | number>) => {
    let s = dicts[locale][key] ?? dicts.en[key] ?? key;
    if (vars) {
      for (const [k, v] of Object.entries(vars)) {
        s = s.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
      }
    }
    return s;
  };

  return <LocaleContext.Provider value={{ locale, setLocale, t }}>{children}</LocaleContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useI18n must be used within CareerI18nProvider");
  return ctx;
}
