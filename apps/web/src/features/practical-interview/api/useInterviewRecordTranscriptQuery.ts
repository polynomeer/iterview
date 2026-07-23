import { useQuery } from "@tanstack/react-query";
import { mapInterviewRecordTranscriptDtoToModel } from "../../../entities/practical-interview/model";
import { getInterviewRecordTranscriptRequest } from "../../../shared/api/practicalInterviewApi";
import { queryKeys } from "../../../shared/api/queryKeys";

export function useInterviewRecordTranscriptQuery(recordId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: queryKeys.interviewRecords.transcript(recordId ?? ""),
    queryFn: async ({ signal }) =>
      mapInterviewRecordTranscriptDtoToModel(
        await getInterviewRecordTranscriptRequest(recordId ?? "", signal),
      ),
    enabled: Boolean(recordId) && enabled,
  });
}
