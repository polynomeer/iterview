const DEFAULT_API_BASE_URL = import.meta.env.DEV ? "" : "http://localhost:8080";

function normalizeBaseUrl(value: string | undefined) {
  if (!value) {
    return DEFAULT_API_BASE_URL;
  }

  return value.endsWith("/") ? value.slice(0, -1) : value;
}

export const env = {
  apiBaseUrl: normalizeBaseUrl(import.meta.env.VITE_API_BASE_URL),
} as const;

export function resolveApiAssetUrl(value: string | null | undefined) {
  const normalizedValue = value?.trim();

  if (!normalizedValue) {
    return "";
  }

  if (/^https?:\/\//i.test(normalizedValue)) {
    return normalizedValue;
  }

  if (normalizedValue.startsWith("/")) {
    return `${env.apiBaseUrl}${normalizedValue}`;
  }

  return normalizedValue;
}
