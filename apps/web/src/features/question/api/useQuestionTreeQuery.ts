import { useQuery } from "@tanstack/react-query";
import { mapQuestionTreeResponseDtoToModel } from "../../../entities/question-tree/model";
import { getQuestionTreeRequest } from "../../../shared/api/questionApi";
import { queryKeys } from "../../../shared/api/queryKeys";

export function useQuestionTreeQuery(questionId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.questions.tree(questionId ?? ""),
    queryFn: async ({ signal }) =>
      mapQuestionTreeResponseDtoToModel(await getQuestionTreeRequest(questionId ?? "", signal)),
    enabled: Boolean(questionId),
  });
}
