import { useQuery } from "@tanstack/react-query";
import { mapReviewQueueResponseDtoToModel } from "../../../entities/review-queue/model";
import { getReviewQueueRequest } from "../../../shared/api/reviewQueueApi";
import { queryKeys } from "../../../shared/api/queryKeys";

export function useReviewQueueQuery({ enabled = true }: { enabled?: boolean } = {}) {
  return useQuery({
    enabled,
    queryKey: queryKeys.reviewQueue.list,
    queryFn: async ({ signal }) => mapReviewQueueResponseDtoToModel(await getReviewQueueRequest(signal)),
  });
}
