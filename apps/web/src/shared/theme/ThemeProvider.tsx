import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from "react";
import { defaultTheme, getStoredTheme, type AppTheme, themeStorageKey } from "./theme";

type ThemeContextValue = {
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function applyTheme(theme: AppTheme) {
  if (typeof document === "undefined") {
    return;
  }

  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme === "light" ? "light" : "dark";
}

function readInitialTheme() {
  if (typeof document !== "undefined") {
    const domTheme = document.documentElement.dataset.theme;

    if (domTheme === "light" || domTheme === "dark" || domTheme === "dracula") {
      return domTheme;
    }
  }

  if (typeof window !== "undefined") {
    return getStoredTheme(window.localStorage);
  }

  return defaultTheme;
}

export function ThemeProvider({ children }: PropsWithChildren) {
  const [theme, setThemeState] = useState<AppTheme>(() => readInitialTheme());

  useEffect(() => {
    applyTheme(theme);
    window.localStorage.setItem(themeStorageKey, theme);
  }, [theme]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      setTheme: setThemeState,
    }),
    [theme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider.");
  }

  return context;
}
