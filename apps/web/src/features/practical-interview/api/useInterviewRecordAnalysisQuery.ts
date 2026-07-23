import { useQuery } from "@tanstack/react-query";
import { mapInterviewRecordAnalysisDtoToModel } from "../../../entities/practical-interview/model";
import { getInterviewRecordAnalysisRequest } from "../../../shared/api/practicalInterviewApi";
import { queryKeys } from "../../../shared/api/queryKeys";

export function useInterviewRecordAnalysisQuery(recordId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: queryKeys.interviewRecords.analysis(recordId ?? ""),
    queryFn: async ({ signal }) =>
      mapInterviewRecordAnalysisDtoToModel(
        await getInterviewRecordAnalysisRequest(recordId ?? "", signal),
      ),
    enabled: Boolean(recordId) && enabled,
  });
}
