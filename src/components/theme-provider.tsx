import { createContext, useContext, useEffect, useState } from "react";

type SystemTheme = "dark" | "light";
type Theme = SystemTheme | "system";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  systemPreferenceTheme: SystemTheme;
  setTheme: (theme: Theme) => void;
};

const initialState: ThemeProviderState = {
  theme: "system",
  systemPreferenceTheme: "light",
  setTheme: () => null,
};

export const ThemeProviderContext =
  createContext<ThemeProviderState>(initialState);

const query = "(prefers-color-scheme: dark)";

export function useSystemPreferencePalette(): SystemTheme {
  const [isDark, setIsDark] = useState<boolean>(false);
  useEffect(() => {
    const listener = (e: MediaQueryListEvent) => setIsDark(e.matches);
    setIsDark(window.matchMedia(query).matches);
    const queryMedia = window.matchMedia(query);
    queryMedia.addEventListener("change", listener);
    return () => queryMedia.removeEventListener("change", listener);
  }, []);
  return isDark ? "dark" : "light";
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
  const systemPreferenceTheme = useSystemPreferencePalette();
  useEffect(() => {
    const root = window.document.documentElement;

    root.classList.remove("light", "dark");

    if (theme === "system") {
      const systemTheme = systemPreferenceTheme;
      root.classList.add(systemTheme);
      return;
    }

    root.classList.add(theme);
  }, [systemPreferenceTheme, theme]);

  const value = {
    theme,
    systemPreferenceTheme,
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
