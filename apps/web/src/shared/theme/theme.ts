// Themes are two token palettes (ADR 0082): `system` follows the OS, `light` and `dark` pin one.
export const themeOptions = [
  { id: "system", label: "System" },
  { id: "light", label: "Light" },
  { id: "dark", label: "Dark" },
] as const;

export type AppTheme = (typeof themeOptions)[number]["id"];

export const defaultTheme: AppTheme = "system";

export const themeStorageKey = "iterview-theme";

// Retired themes resolved to the dark palette, so they keep it.
const RETIRED_THEMES: Record<string, AppTheme> = { workspace: "dark", dracula: "dark" };

export function isAppTheme(value: string | null | undefined): value is AppTheme {
  return themeOptions.some((option) => option.id === value);
}

export function resolveStoredTheme(value: string | null | undefined): AppTheme {
  if (isAppTheme(value)) {
    return value;
  }

  return (value && RETIRED_THEMES[value]) || defaultTheme;
}

export function getStoredTheme(storage: Pick<Storage, "getItem"> | null | undefined) {
  return storage ? resolveStoredTheme(storage.getItem(themeStorageKey)) : defaultTheme;
}

// Palettes pick the colors; the theme above picks brightness (ADR 0093). Ink & Signal is the default
// design; classic keeps the earlier look for anyone who picks it (ADR 0094).
export const paletteOptions = [
  { id: "ink", label: "Ink & Signal" },
  { id: "classic", label: "Classic" },
] as const;

export type AppPalette = (typeof paletteOptions)[number]["id"];

export const defaultPalette: AppPalette = "ink";

export const paletteStorageKey = "iterview-palette";

export function isAppPalette(value: string | null | undefined): value is AppPalette {
  return paletteOptions.some((option) => option.id === value);
}

export function getStoredPalette(storage: Pick<Storage, "getItem"> | null | undefined) {
  const value = storage?.getItem(paletteStorageKey);
  return isAppPalette(value) ? value : defaultPalette;
}
