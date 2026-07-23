import { apiEndpoints } from "./endpoints";
import { httpClient } from "./httpClient";
import type { PracticeListQueryParams, PracticeListResponse } from "../types/practice";

function buildSearchParams(params: PracticeListQueryParams) {
  const searchParams = new URLSearchParams();

  if (params.category) {
    searchParams.set("categoryId", params.category);
  }

  if (params.company) {
    searchParams.set("companyId", params.company);
  }

  if (params.difficulty) {
    searchParams.set("difficulty", params.difficulty);
  }

  if (params.status) {
    searchParams.set("status", params.status);
  }

  if (params.search) {
    searchParams.set("search", params.search);
  }

  if (params.page && params.page > 1) {
    searchParams.set("page", String(params.page));
  }

  const queryString = searchParams.toString();

  return queryString ? `?${queryString}` : "";
}

export function getPracticeQuestionsRequest(
  params: PracticeListQueryParams,
  signal?: AbortSignal,
) {
  return httpClient.get<PracticeListResponse>(
    `${apiEndpoints.questions.list}${buildSearchParams(params)}`,
    { signal },
  );
}
