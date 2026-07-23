import { apiEndpoints } from "./endpoints";
import { httpClient } from "./httpClient";
import type { FeedResponseDto } from "../types/feed";

export function getFeedRequest(signal?: AbortSignal) {
  return httpClient.get<FeedResponseDto>(apiEndpoints.feed.root, { signal });
}
