import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type Theme = "light" | "dark";
type Ctx = { theme: Theme; toggle: () => void; set: (t: Theme) => void };
const ThemeContext = createContext<Ctx | null>(null);

export function CareerThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const saved = (typeof window !== "undefined" ? localStorage.getItem("career.theme") : null) as Theme | null;
    const initial: Theme = saved === "dark" || saved === "light" ? saved : (typeof window !== "undefined" && window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    setTheme(initial);
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.classList.toggle("dark", theme === "dark");
    if (typeof window !== "undefined") localStorage.setItem("career.theme", theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, set: setTheme, toggle: () => setTheme((t) => (t === "dark" ? "light" : "dark")) }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useCareerTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useCareerTheme must be used within CareerThemeProvider");
  return ctx;
}
