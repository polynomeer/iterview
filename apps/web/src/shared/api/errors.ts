import type { ApiErrorResponseDto } from "../types/api";

const defaultMessages: Record<number, string> = {
  400: "The request could not be processed.",
  401: "You need to sign in to continue.",
  403: "You do not have access to this resource.",
  404: "The requested resource was not found.",
  500: "Something went wrong on the server.",
};

export class ApiClientError extends Error {
  readonly code?: string;
  readonly details?: Record<string, string[]>;
  readonly status: number;

  constructor(status: number, message: string, code?: string, details?: Record<string, string[]>) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

// Statuses whose server message tells the user how to fix their input. Everything else (missing
// records, server faults, timeouts) is replaced by the screen's own localized fallback so raw
// backend text such as "Answer attempt not found: 1" never reaches the UI.
const ACTIONABLE_STATUSES = new Set([400, 409, 422]);

export function userFacingErrorMessage(error: unknown, fallback: string) {
  if (error instanceof ApiClientError && ACTIONABLE_STATUSES.has(error.status) && error.message.trim()) {
    return error.message;
  }

  return fallback;
}

/** Like userFacingErrorMessage, but returns null when there is no error to show. */
export function optionalErrorMessage(error: unknown, fallback: string) {
  return error ? userFacingErrorMessage(error, fallback) : null;
}

export function getErrorDetails(error: unknown) {
  if (!(error instanceof ApiClientError) || !error.details) {
    return [];
  }

  return Object.entries(error.details).flatMap(([key, messages]) =>
    messages.map((message) => (key === "base" ? message : `${key}: ${message}`)),
  );
}

function normalizeDetails(
  value: ApiErrorResponseDto["details"] | ApiErrorResponseDto["errors"],
) {
  if (!value) {
    return undefined;
  }

  if (Array.isArray(value)) {
    return { base: value.map(String) };
  }

  if (typeof value === "string") {
    return { base: [value] };
  }

  return Object.fromEntries(
    Object.entries(value).map(([key, detailValue]) => [
      key,
      Array.isArray(detailValue) ? detailValue.map(String) : [String(detailValue)],
    ]),
  );
}

function normalizeMessageValue(value: unknown): string | null {
  if (typeof value === "string") {
    const normalized = value.trim();

    return normalized ? normalized : null;
  }

  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  if (Array.isArray(value)) {
    const normalized = value
      .map((item) => normalizeMessageValue(item))
      .filter((item): item is string => Boolean(item));

    return normalized.length > 0 ? normalized.join(", ") : null;
  }

  if (value && typeof value === "object") {
    const candidateObject = value as Record<string, unknown>;

    for (const key of ["message", "error", "title", "detail", "reason"]) {
      const nestedValue = normalizeMessageValue(candidateObject[key]);

      if (nestedValue) {
        return nestedValue;
      }
    }

    const normalizedValues = Object.values(candidateObject)
      .map((item) => normalizeMessageValue(item))
      .filter((item): item is string => Boolean(item));

    return normalizedValues.length > 0 ? normalizedValues[0] : null;
  }

  return null;
}

export function mapApiError(status: number, payload: ApiErrorResponseDto | null) {
  const message =
    normalizeMessageValue(payload?.message) ??
    normalizeMessageValue(payload?.error) ??
    normalizeMessageValue(payload?.title) ??
    normalizeMessageValue(payload?.detail) ??
    defaultMessages[status] ??
    "Unexpected API error.";
  const details = normalizeDetails(payload?.details ?? payload?.errors);

  return new ApiClientError(status, message, payload?.code, details);
}
