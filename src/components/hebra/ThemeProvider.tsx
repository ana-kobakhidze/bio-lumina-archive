import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { DEFAULT_THEME, THEMES, themeById, type HebraTheme, type ThemeId } from "@/lib/theme";

const KEY = "hebra-theme";

interface Ctx {
  theme: HebraTheme;
  setTheme: (id: ThemeId) => void;
}

const ThemeCtx = createContext<Ctx>({ theme: themeById(DEFAULT_THEME), setTheme: () => {} });

export function useHebraTheme() {
  return useContext(ThemeCtx);
}

export function HebraThemeProvider({ children }: { children: ReactNode }) {
  const [id, setId] = useState<ThemeId>(DEFAULT_THEME);

  useEffect(() => {
    const stored = window.localStorage.getItem(KEY) as ThemeId | null;
    if (stored) setId(themeById(stored).id);
  }, []);

  const theme = useMemo(() => themeById(id), [id]);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--background", theme.css.background);
    root.style.setProperty("--foreground", theme.css.foreground);
    root.style.setProperty("--specimen", theme.css.specimen);
    root.dataset["hebraTheme"] = theme.id;
  }, [theme]);

  const setTheme = useCallback((next: ThemeId) => {
    setId(next);
    window.localStorage.setItem(KEY, next);
  }, []);

  return <ThemeCtx.Provider value={{ theme, setTheme }}>{children}</ThemeCtx.Provider>;
}

/** Small exhibition-theme selector: four swatches. */
export function ThemeSwitch({ className = "" }: { className?: string }) {
  const { theme, setTheme } = useHebraTheme();
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="label-micro">Theme</span>
      <div className="flex gap-1.5">
        {THEMES.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTheme(t.id)}
            aria-label={`${t.label} theme`}
            aria-pressed={t.id === theme.id}
            title={t.label}
            className={`hebra-transition size-4 rounded-full border ${
              t.id === theme.id
                ? "scale-125 border-specimen"
                : "border-specimen/35 hover:scale-110 hover:border-specimen/70"
            }`}

            style={{ backgroundColor: t.swatch }}
          />
        ))}
      </div>
    </div>
  );
}
