import { useMutation, useQueryClient } from "@tanstack/react-query";
import { mapInterviewRecordReviewDtoToModel } from "../../../entities/practical-interview/model";
import { updateInterviewRecordReviewRequest } from "../../../shared/api/practicalInterviewApi";
import { queryKeys } from "../../../shared/api/queryKeys";
import type { BulkUpdateInterviewTranscriptSegmentsRequestDto } from "../../../shared/types/practicalInterview";

export function useUpdateInterviewReviewMutation(recordId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: BulkUpdateInterviewTranscriptSegmentsRequestDto) =>
      mapInterviewRecordReviewDtoToModel(
        await updateInterviewRecordReviewRequest(recordId ?? "", payload),
      ),
    onSuccess: async () => {
      if (!recordId) {
        return;
      }

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.interviewRecords.review(recordId) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.interviewRecords.transcript(recordId) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.interviewRecords.detail(recordId) }),
      ]);
    },
  });
}
