function parseApiDate(value: string) {
  // Date-only payloads should be interpreted as local calendar dates, not UTC-midnight shifts.
  const normalizedValue = /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00:00` : value;
  const parsed = new Date(normalizedValue);

  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function getAppDateLocale() {
  if (typeof document !== "undefined" && document.documentElement.lang) {
    return document.documentElement.lang;
  }

  if (typeof navigator !== "undefined" && navigator.language) {
    return navigator.language;
  }

  return "en-US";
}

export function formatApiDate(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const parsed = parseApiDate(value);

  if (!parsed) {
    return value;
  }

  return new Intl.DateTimeFormat(getAppDateLocale(), {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(parsed);
}

export function formatApiDateTime(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const parsed = parseApiDate(value);

  if (!parsed) {
    return value;
  }

  return new Intl.DateTimeFormat(getAppDateLocale(), {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(parsed);
}
