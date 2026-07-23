import { useQuery } from "@tanstack/react-query";
import { mapQuestionAnswerHistoryResponseDtoToModel } from "../../../entities/answer-history/model";
import { getQuestionAnswerHistoryRequest } from "../../../shared/api/questionApi";
import { queryKeys } from "../../../shared/api/queryKeys";
import { useAuth } from "../../../shared/auth/useAuth";

export function useQuestionAnswerHistoryQuery(questionId: string | undefined) {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: queryKeys.questions.answerHistory(questionId ?? ""),
    queryFn: async ({ signal }) =>
      mapQuestionAnswerHistoryResponseDtoToModel(
        await getQuestionAnswerHistoryRequest(questionId ?? "", signal),
      ),
    enabled: Boolean(questionId) && isAuthenticated,
  });
}
