import { env } from "../config/env";
import { getStoredAccessToken } from "../auth/tokenStorage";
import { getStoredAppLocale } from "../i18n";
import { mapApiError } from "./errors";
import type { ApiErrorResponseDto, ApiMethod, ApiRequestOptions } from "../types/api";

const REQUEST_TIMEOUT_MS = 12_000;

function createRequestSignal(sourceSignal?: AbortSignal) {
  const controller = new AbortController();

  if (sourceSignal?.aborted) {
    controller.abort(sourceSignal.reason);
  } else if (sourceSignal) {
    sourceSignal.addEventListener(
      "abort",
      () => {
        controller.abort(sourceSignal.reason);
      },
      { once: true },
    );
  }

  const timeoutId = window.setTimeout(() => {
    controller.abort(new DOMException("Request timed out", "TimeoutError"));
  }, REQUEST_TIMEOUT_MS);

  return {
    signal: controller.signal,
    cleanup: () => {
      window.clearTimeout(timeoutId);
    },
  };
}

/** The browser's IANA time zone, such as "Asia/Seoul"; the API dates "today" with it (ADR 0089). */
export function browserTimeZone(): string | null {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || null;
  } catch {
    return null;
  }
}

// Who is asking and where: the chosen UI language and the browser's time zone.
function applyClientContext(headers: Headers) {
  const appLocale = typeof window !== "undefined" ? getStoredAppLocale(window.localStorage) : null;
  if (appLocale) {
    headers.set("X-App-Locale", appLocale);
  }
  const timeZone = browserTimeZone();
  if (timeZone) {
    headers.set("X-Time-Zone", timeZone);
  }
}

async function parseResponseBody(response: Response) {
  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("json")) {
    return response.json();
  }

  const text = await response.text();

  return text ? text : null;
}

async function request<TResponse, TBody = unknown>(
  method: ApiMethod,
  path: string,
  options: ApiRequestOptions<TBody> = {},
) {
  const token = getStoredAccessToken();
  const headers = new Headers(options.headers);
  const { signal, cleanup } = createRequestSignal(options.signal);

  headers.set("Accept", "application/json");

  applyClientContext(headers);

  const isFormData = options.body instanceof FormData;

  if (options.body !== undefined && !isFormData) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const requestBody: BodyInit | undefined =
    options.body === undefined
      ? undefined
      : isFormData
        ? (options.body as FormData)
        : JSON.stringify(options.body);

  const response = await fetch(`${env.apiBaseUrl}${path}`, {
    method,
    headers,
    body: requestBody,
    signal,
  })
    .catch((error: unknown) => {
      if (
        signal.aborted &&
        signal.reason instanceof DOMException &&
        signal.reason.name === "TimeoutError"
      ) {
        throw new Error("The server took too long to respond. Check the API and try again.");
      }

      if (error instanceof DOMException && error.name === "AbortError") {
        throw error;
      }

      throw new Error("Unable to reach the server. Check your connection and try again.");
    })
    .finally(() => {
      cleanup();
    });

  if (!response.ok) {
    const errorPayload = (await parseResponseBody(response)) as ApiErrorResponseDto | string | null;

    if (typeof errorPayload === "string") {
      throw mapApiError(response.status, { message: errorPayload });
    }

    throw mapApiError(response.status, errorPayload);
  }

  return (await parseResponseBody(response)) as TResponse;
}

async function requestBlob(method: ApiMethod, path: string, options: ApiRequestOptions = {}) {
  const token = getStoredAccessToken();
  const headers = new Headers(options.headers);
  const { signal, cleanup } = createRequestSignal(options.signal);

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  applyClientContext(headers);

  const response = await fetch(`${env.apiBaseUrl}${path}`, {
    method,
    headers,
    signal,
  })
    .catch((error: unknown) => {
      if (
        signal.aborted &&
        signal.reason instanceof DOMException &&
        signal.reason.name === "TimeoutError"
      ) {
        throw new Error("The server took too long to respond. Check the API and try again.");
      }

      if (error instanceof DOMException && error.name === "AbortError") {
        throw error;
      }

      throw new Error("Unable to reach the server. Check your connection and try again.");
    })
    .finally(() => {
      cleanup();
    });

  if (!response.ok) {
    const errorPayload = (await parseResponseBody(response)) as ApiErrorResponseDto | string | null;

    if (typeof errorPayload === "string") {
      throw mapApiError(response.status, { message: errorPayload });
    }

    throw mapApiError(response.status, errorPayload);
  }

  return response.blob();
}

export const httpClient = {
  get: <TResponse>(path: string, options?: ApiRequestOptions) =>
    request<TResponse>("GET", path, options),
  post: <TResponse, TBody = unknown>(path: string, options?: ApiRequestOptions<TBody>) =>
    request<TResponse, TBody>("POST", path, options),
  patch: <TResponse, TBody = unknown>(path: string, options?: ApiRequestOptions<TBody>) =>
    request<TResponse, TBody>("PATCH", path, options),
  put: <TResponse, TBody = unknown>(path: string, options?: ApiRequestOptions<TBody>) =>
    request<TResponse, TBody>("PUT", path, options),
  delete: <TResponse>(path: string, options?: ApiRequestOptions) =>
    request<TResponse>("DELETE", path, options),
  getBlob: (path: string, options?: ApiRequestOptions) => requestBlob("GET", path, options),
};
