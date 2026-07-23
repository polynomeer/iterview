import { useQuery } from "@tanstack/react-query";
import { mapQuestionDetailResponseDtoToModel } from "../../../entities/question/model";
import { getQuestionDetailRequest } from "../../../shared/api/questionApi";
import { queryKeys } from "../../../shared/api/queryKeys";

export function useQuestionDetailQuery(questionId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.questions.detail(questionId ?? ""),
    queryFn: async ({ signal }) =>
      mapQuestionDetailResponseDtoToModel(await getQuestionDetailRequest(questionId ?? "", signal)),
    enabled: Boolean(questionId),
  });
}
