import { apiEndpoints } from "./endpoints";
import { httpClient } from "./httpClient";
import type {
  ReviewQueueActionResponseDto,
  ReviewQueueResponseDto,
} from "../types/review-queue";

export function getReviewQueueRequest(signal?: AbortSignal) {
  return httpClient.get<ReviewQueueResponseDto>(apiEndpoints.reviewQueue.root, { signal });
}

export function skipReviewQueueItemRequest(queueItemId: string) {
  return httpClient.post<ReviewQueueActionResponseDto>(apiEndpoints.reviewQueue.skip(queueItemId));
}

export function doneReviewQueueItemRequest(queueItemId: string) {
  return httpClient.post<ReviewQueueActionResponseDto>(apiEndpoints.reviewQueue.done(queueItemId));
}
