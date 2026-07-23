import { apiEndpoints } from "./endpoints";
import { httpClient } from "./httpClient";
import type { HomeResponseDto } from "../types/home";

export function getHomeRequest(signal?: AbortSignal) {
  return httpClient.get<HomeResponseDto>(apiEndpoints.home.root, { signal });
}
