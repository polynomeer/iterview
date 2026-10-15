import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from "react";
import {
  defaultPalette,
  defaultTheme,
  getStoredPalette,
  getStoredTheme,
  isAppPalette,
  isAppTheme,
  type AppPalette,
  type AppTheme,
  paletteStorageKey,
  themeStorageKey,
} from "./theme";

type ThemeContextValue = {
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
  palette: AppPalette;
  setPalette: (palette: AppPalette) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function applyTheme(theme: AppTheme) {
  if (typeof document === "undefined") {
    return;
  }

  // tokens.css picks the brightness and color-scheme from this attribute.
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.removeProperty("color-scheme");
}

function applyPalette(palette: AppPalette) {
  if (typeof document === "undefined") {
    return;
  }

  // tokens.css picks the role block for this palette (ADR 0093).
  document.documentElement.dataset.palette = palette;
}

function readInitialTheme() {
  if (typeof document !== "undefined") {
    const domTheme = document.documentElement.dataset.theme;

    if (isAppTheme(domTheme)) {
      return domTheme;
    }
  }

  if (typeof window !== "undefined") {
    return getStoredTheme(window.localStorage);
  }

  return defaultTheme;
}

function readInitialPalette() {
  if (typeof document !== "undefined") {
    const domPalette = document.documentElement.dataset.palette;

    if (isAppPalette(domPalette)) {
      return domPalette;
    }
  }

  if (typeof window !== "undefined") {
    return getStoredPalette(window.localStorage);
  }

  return defaultPalette;
}

export function ThemeProvider({ children }: PropsWithChildren) {
  const [theme, setThemeState] = useState<AppTheme>(() => readInitialTheme());
  const [palette, setPaletteState] = useState<AppPalette>(() => readInitialPalette());

  useEffect(() => {
    applyTheme(theme);
    window.localStorage.setItem(themeStorageKey, theme);
  }, [theme]);

  useEffect(() => {
    applyPalette(palette);
    window.localStorage.setItem(paletteStorageKey, palette);
  }, [palette]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      setTheme: setThemeState,
      palette,
      setPalette: setPaletteState,
    }),
    [theme, palette],
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
