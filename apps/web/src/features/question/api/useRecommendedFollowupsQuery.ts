import { useQuery } from "@tanstack/react-query";
import { getRecommendedFollowupsRequest } from "../../../shared/api/questionApi";
import { queryKeys } from "../../../shared/api/queryKeys";
import { toArray } from "../../../shared/lib/collection";
import type { RecommendedFollowUpDto } from "../../../shared/types/question";

export function useRecommendedFollowupsQuery(questionId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.questions.recommendedFollowups(questionId ?? ""),
    queryFn: async ({ signal }) =>
      toArray<RecommendedFollowUpDto>(await getRecommendedFollowupsRequest(questionId ?? "", signal)),
    enabled: Boolean(questionId),
  });
}
