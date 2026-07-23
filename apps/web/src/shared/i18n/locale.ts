export type AppLocale = "ko" | "en";

export const appLocaleStorageKey = "iterview-locale";

export function isAppLocale(value: unknown): value is AppLocale {
  return value === "ko" || value === "en";
}

export function normalizeAppLocale(value: unknown): AppLocale | null {
  if (isAppLocale(value)) {
    return value;
  }

  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim().toLowerCase();

  if (normalized.startsWith("ko")) {
    return "ko";
  }

  if (normalized.startsWith("en")) {
    return "en";
  }

  return null;
}

export function getStoredAppLocale(storage?: Storage | null): AppLocale | null {
  if (!storage) {
    return null;
  }

  return normalizeAppLocale(storage.getItem(appLocaleStorageKey));
}
