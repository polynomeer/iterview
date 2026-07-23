import { useQuery } from "@tanstack/react-query";
import { getResumeBasedQuestionsRequest } from "../../../shared/api/questionApi";
import { queryKeys } from "../../../shared/api/queryKeys";
import { toArray } from "../../../shared/lib/collection";
import type { ResumeBasedQuestionDto } from "../../../shared/types/question";

export function useResumeBasedQuestionsQuery(limit = 6) {
  return useQuery({
    queryKey: queryKeys.questions.resumeBased(limit),
    queryFn: async ({ signal }) =>
      toArray<ResumeBasedQuestionDto>(await getResumeBasedQuestionsRequest(limit, signal)),
  });
}
