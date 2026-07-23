import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  doneReviewQueueItemRequest,
  skipReviewQueueItemRequest,
} from "../../../shared/api/reviewQueueApi";
import { queryKeys } from "../../../shared/api/queryKeys";

type ReviewQueueAction = "skip" | "done";

export function useReviewQueueActionMutation(action: ReviewQueueAction) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (queueItemId: string) =>
      action === "skip"
        ? skipReviewQueueItemRequest(queueItemId)
        : doneReviewQueueItemRequest(queueItemId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.reviewQueue.list }),
        queryClient.invalidateQueries({ queryKey: queryKeys.home.detail }),
        queryClient.invalidateQueries({ queryKey: queryKeys.questions.root }),
        queryClient.invalidateQueries({ queryKey: queryKeys.archive.root }),
        queryClient.invalidateQueries({ queryKey: queryKeys.feed.root }),
      ]);
    },
  });
}
