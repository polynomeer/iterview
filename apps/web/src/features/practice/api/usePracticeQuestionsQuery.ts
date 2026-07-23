import { useQuery } from "@tanstack/react-query";
import { mapPracticeListResponseDtoToModel } from "../../../entities/practice/model";
import { getPracticeQuestionsRequest } from "../../../shared/api/practiceApi";
import { queryKeys } from "../../../shared/api/queryKeys";
import type { PracticeListQueryParams } from "../../../shared/types/practice";

export function usePracticeQuestionsQuery(params: PracticeListQueryParams) {
  return useQuery({
    queryKey: queryKeys.questions.list(params),
    queryFn: async ({ signal }) =>
      mapPracticeListResponseDtoToModel(await getPracticeQuestionsRequest(params, signal)),
  });
}
