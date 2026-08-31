export const themeOptions = [
  { id: "light", label: "Light", description: "Bright surfaces with the current default look." },
  { id: "dark", label: "Dark", description: "Muted dark surfaces for lower-glare browsing." },
  { id: "workspace", label: "Workspace", description: "Reference-driven navy surfaces with cobalt focus accents." },
  { id: "dracula", label: "Dracula", description: "A saturated violet-night palette with strong contrast." },
] as const;

export type AppTheme = (typeof themeOptions)[number]["id"];

export const defaultTheme: AppTheme = "light";

export const themeStorageKey = "iterview-theme";

export function isAppTheme(value: string | null | undefined): value is AppTheme {
  return themeOptions.some((option) => option.id === value);
}

export function getStoredTheme(storage: Pick<Storage, "getItem"> | null | undefined) {
  if (!storage) {
    return defaultTheme;
  }

  const storedTheme = storage.getItem(themeStorageKey);

  return isAppTheme(storedTheme) ? storedTheme : defaultTheme;
}
