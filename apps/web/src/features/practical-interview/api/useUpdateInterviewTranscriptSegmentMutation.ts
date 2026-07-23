import { useMutation, useQueryClient } from "@tanstack/react-query";
import { mapInterviewRecordTranscriptDtoToModel } from "../../../entities/practical-interview/model";
import { updateInterviewTranscriptSegmentRequest } from "../../../shared/api/practicalInterviewApi";
import { queryKeys } from "../../../shared/api/queryKeys";
import type { UpdateInterviewTranscriptSegmentRequestDto } from "../../../shared/types/practicalInterview";

export function useUpdateInterviewTranscriptSegmentMutation(recordId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      segmentId,
      payload,
    }: {
      segmentId: string;
      payload: UpdateInterviewTranscriptSegmentRequestDto;
    }) =>
      mapInterviewRecordTranscriptDtoToModel(
        await updateInterviewTranscriptSegmentRequest(recordId ?? "", segmentId, payload),
      ),
    onSuccess: async () => {
      if (!recordId) {
        return;
      }

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.interviewRecords.transcript(recordId) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.interviewRecords.review(recordId) }),
      ]);
    },
  });
}
