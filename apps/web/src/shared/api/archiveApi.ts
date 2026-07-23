import { apiEndpoints } from "./endpoints";
import { httpClient } from "./httpClient";
import type { ArchiveQueryParams, ArchiveResponseDto } from "../types/archive";

export function getArchiveRequest(_params: ArchiveQueryParams, signal?: AbortSignal) {
  return httpClient.get<ArchiveResponseDto>(apiEndpoints.archive.root, {
    signal,
  });
}
