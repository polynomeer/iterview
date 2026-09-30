// The previous "light" theme paired dark workspace surfaces with light-theme text colors, which left
// page titles and labels unreadable. It stays retired until a token-based light theme exists
// (docs/09-ux-audit-and-redesign-proposal.md, Phase 1). Stored "light" values fall back to the default.
export const themeOptions = [
  { id: "dark", label: "Dark", description: "Muted dark surfaces for lower-glare browsing." },
  { id: "workspace", label: "Workspace", description: "Reference-driven navy surfaces with cobalt focus accents." },
  { id: "dracula", label: "Dracula", description: "A saturated violet-night palette with strong contrast." },
] as const;

export type AppTheme = (typeof themeOptions)[number]["id"];

export const defaultTheme: AppTheme = "workspace";

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
