import { useQuery } from "@tanstack/react-query";
import { mapInterviewRecordDetailDtoToModel } from "../../../entities/practical-interview/model";
import { getInterviewRecordDetailRequest } from "../../../shared/api/practicalInterviewApi";
import { queryKeys } from "../../../shared/api/queryKeys";

export function useInterviewRecordDetailQuery(recordId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.interviewRecords.detail(recordId ?? ""),
    queryFn: async ({ signal }) =>
      mapInterviewRecordDetailDtoToModel(
        await getInterviewRecordDetailRequest(recordId ?? "", signal),
      ),
    enabled: Boolean(recordId),
    refetchInterval: (query) => {
      const detail = query.state.data;
      if (!detail) {
        return false;
      }

      return detail.isTranscriptPending || detail.isTranscriptProcessing ? 5000 : false;
    },
  });
}
