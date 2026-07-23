export type ApiMethod = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

export type ApiErrorResponseDto = {
  code?: string;
  message?: unknown;
  error?: unknown;
  title?: unknown;
  detail?: unknown;
  status?: number;
  details?: Record<string, string[] | string> | string[] | string;
  errors?: Record<string, string[] | string> | string[] | string;
};

export type ApiRequestOptions<TBody = unknown> = {
  body?: TBody;
  headers?: HeadersInit;
  signal?: AbortSignal;
};

export type ApiRequestBody = BodyInit | Record<string, unknown> | unknown[] | null;
