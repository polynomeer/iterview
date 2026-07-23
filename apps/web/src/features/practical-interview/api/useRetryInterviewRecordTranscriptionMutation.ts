import { useMutation, useQueryClient } from "@tanstack/react-query";
import { mapInterviewRecordDetailDtoToModel } from "../../../entities/practical-interview/model";
import { queryKeys } from "../../../shared/api/queryKeys";
import { retryInterviewRecordTranscriptionRequest } from "../../../shared/api/practicalInterviewApi";

export function useRetryInterviewRecordTranscriptionMutation(recordId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () =>
      mapInterviewRecordDetailDtoToModel(
        await retryInterviewRecordTranscriptionRequest(recordId ?? ""),
      ),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.interviewRecords.list }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.interviewRecords.detail(recordId ?? ""),
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.interviewRecords.transcript(recordId ?? ""),
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.interviewRecords.review(recordId ?? ""),
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.interviewRecords.questions(recordId ?? ""),
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.interviewRecords.analysis(recordId ?? ""),
        }),
      ]);
    },
  });
}
