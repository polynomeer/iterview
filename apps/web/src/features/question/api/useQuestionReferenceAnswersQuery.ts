import { useQuery } from "@tanstack/react-query";
import { getQuestionReferenceAnswersRequest } from "../../../shared/api/questionApi";
import { queryKeys } from "../../../shared/api/queryKeys";
import { toArray } from "../../../shared/lib/collection";
import type { QuestionReferenceAnswerDto } from "../../../shared/types/question";

export function useQuestionReferenceAnswersQuery(questionId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: queryKeys.questions.referenceAnswers(questionId ?? ""),
    queryFn: async ({ signal }) =>
      toArray<QuestionReferenceAnswerDto>(
        await getQuestionReferenceAnswersRequest(questionId ?? "", signal),
      ),
    enabled: Boolean(questionId) && enabled,
  });
}
