import { useQuery } from "@tanstack/react-query";
import { mapInterviewRecordQuestionsDtoToModel } from "../../../entities/practical-interview/model";
import { getInterviewRecordQuestionsRequest } from "../../../shared/api/practicalInterviewApi";
import { queryKeys } from "../../../shared/api/queryKeys";

export function useInterviewRecordQuestionsQuery(recordId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: queryKeys.interviewRecords.questions(recordId ?? ""),
    queryFn: async ({ signal }) =>
      mapInterviewRecordQuestionsDtoToModel(
        await getInterviewRecordQuestionsRequest(recordId ?? "", signal),
      ),
    enabled: Boolean(recordId) && enabled,
  });
}
