import { QueryClient } from "@tanstack/react-query";
import { ApiClientError } from "./errors";

function shouldRetry(failureCount: number, error: unknown) {
  if (error instanceof ApiClientError && error.status >= 400 && error.status < 500) {
    return false;
  }

  return failureCount < 1;
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: shouldRetry,
      refetchOnWindowFocus: false,
      staleTime: 30_000,
    },
    mutations: {
      retry: false,
    },
  },
});
