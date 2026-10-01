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
