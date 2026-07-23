import { useQuery } from "@tanstack/react-query";
import { mapInterviewRecordReviewDtoToModel } from "../../../entities/practical-interview/model";
import { getInterviewRecordReviewRequest } from "../../../shared/api/practicalInterviewApi";
import { queryKeys } from "../../../shared/api/queryKeys";

export function useInterviewRecordReviewQuery(recordId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: queryKeys.interviewRecords.review(recordId ?? ""),
    queryFn: async ({ signal }) =>
      mapInterviewRecordReviewDtoToModel(await getInterviewRecordReviewRequest(recordId ?? "", signal)),
    enabled: Boolean(recordId) && enabled,
  });
}
