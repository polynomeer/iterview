import { useMutation, useQueryClient } from "@tanstack/react-query";
import { advanceInterviewSessionRequest } from "../../../shared/api/interviewApi";
import { queryKeys } from "../../../shared/api/queryKeys";

export function useAdvanceInterviewSessionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId: string) => advanceInterviewSessionRequest(sessionId),
    onSuccess: async (_, sessionId) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: queryKeys.interviewSessions.detail(sessionId),
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.interviewSessions.list,
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.interviewSessions.coverage(sessionId),
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.interviewSessions.resumeMap(sessionId),
        }),
      ]);
    },
  });
}
