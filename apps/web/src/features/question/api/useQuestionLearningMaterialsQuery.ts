import { useQuery } from "@tanstack/react-query";
import { getQuestionLearningMaterialsRequest } from "../../../shared/api/questionApi";
import { queryKeys } from "../../../shared/api/queryKeys";
import { toArray } from "../../../shared/lib/collection";
import type { LearningMaterialDto } from "../../../shared/types/question";

export function useQuestionLearningMaterialsQuery(questionId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: queryKeys.questions.learningMaterials(questionId ?? ""),
    queryFn: async ({ signal }) =>
      toArray<LearningMaterialDto>(await getQuestionLearningMaterialsRequest(questionId ?? "", signal)),
    enabled: Boolean(questionId) && enabled,
  });
}
