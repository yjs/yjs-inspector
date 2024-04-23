import { createContext, useContext, useEffect, useState } from "react";

type ResolvedTheme = "dark" | "light";
type Theme = ResolvedTheme | "system";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
};

const initialState: ThemeProviderState = {
  theme: "system",
  resolvedTheme: "light",
  setTheme: () => null,
};

export const ThemeProviderContext =
  createContext<ThemeProviderState>(initialState);

const query = "(prefers-color-scheme: dark)";

export function useSystemPreferenceDark() {
  const [isDark, setIsDark] = useState<boolean>(false);
  useEffect(() => {
    const listener = (e: MediaQueryListEvent) => setIsDark(e.matches);
    setIsDark(window.matchMedia(query).matches);
    const queryMedia = window.matchMedia(query);
    queryMedia.addEventListener("change", listener);
    return () => queryMedia.removeEventListener("change", listener);
  }, []);
  return isDark;
}

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "ui-theme",
  ...props
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme,
  );
  const systemPreferenceTheme = useSystemPreferenceDark() ? "dark" : "light";
  const resolvedTheme: ResolvedTheme =
    theme === "system" ? systemPreferenceTheme : theme;
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(resolvedTheme);
  }, [resolvedTheme, theme]);

  const value = {
    theme,
    resolvedTheme: resolvedTheme,
    setTheme: (theme: Theme) => {
      localStorage.setItem(storageKey, theme);
      setTheme(theme);
    },
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");

  return context;
};
