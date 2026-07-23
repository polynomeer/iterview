import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createInterviewSessionRequest } from "../../../shared/api/interviewApi";
import { queryKeys } from "../../../shared/api/queryKeys";
import type { CreateInterviewSessionRequestDto } from "../../../shared/types/interview";

export function useCreateInterviewSessionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateInterviewSessionRequestDto) =>
      createInterviewSessionRequest(payload),
    onSuccess: async (session) => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.interviewSessions.list,
      });

      if (session.id !== null && session.id !== undefined) {
        await queryClient.invalidateQueries({
          queryKey: queryKeys.interviewSessions.detail(String(session.id)),
        });
      }
    },
  });
}
