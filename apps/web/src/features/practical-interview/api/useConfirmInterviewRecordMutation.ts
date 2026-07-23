import { useMutation, useQueryClient } from "@tanstack/react-query";
import { mapInterviewRecordDetailDtoToModel } from "../../../entities/practical-interview/model";
import { confirmInterviewRecordRequest } from "../../../shared/api/practicalInterviewApi";
import { queryKeys } from "../../../shared/api/queryKeys";

export function useConfirmInterviewRecordMutation(recordId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () =>
      mapInterviewRecordDetailDtoToModel(await confirmInterviewRecordRequest(recordId ?? "")),
    onSuccess: async () => {
      if (!recordId) {
        return;
      }

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.interviewRecords.detail(recordId) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.interviewRecords.review(recordId) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.interviewRecords.list }),
      ]);
    },
  });
}
