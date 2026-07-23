import { useMutation, useQueryClient } from "@tanstack/react-query";
import { mapInterviewRecordDetailDtoToModel } from "../../../entities/practical-interview/model";
import { createInterviewRecordRequest } from "../../../shared/api/practicalInterviewApi";
import { queryKeys } from "../../../shared/api/queryKeys";

export function useCreateInterviewRecordMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: FormData) =>
      mapInterviewRecordDetailDtoToModel(await createInterviewRecordRequest(payload)),
    onSuccess: async (record) => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.interviewRecords.list,
      });

      await queryClient.invalidateQueries({
        queryKey: queryKeys.interviewRecords.detail(record.id),
      });
    },
  });
}
