import { useMutation, useQueryClient } from "@tanstack/react-query";
import { skipInterviewSessionQuestionRequest } from "../../../shared/api/interviewApi";
import { queryKeys } from "../../../shared/api/queryKeys";
import type { SkipInterviewSessionQuestionRequestDto } from "../../../shared/types/interview";

type SkipSessionQuestionInput = {
  sessionId: string;
  payload: SkipInterviewSessionQuestionRequestDto;
};

export function useSkipInterviewSessionQuestionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ sessionId, payload }: SkipSessionQuestionInput) =>
      skipInterviewSessionQuestionRequest(sessionId, payload),
    onSuccess: async (_, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: queryKeys.interviewSessions.detail(variables.sessionId),
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.interviewSessions.list,
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.interviewSessions.coverage(variables.sessionId),
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.interviewSessions.resumeMap(variables.sessionId),
        }),
        queryClient.invalidateQueries({ queryKey: queryKeys.archive.root }),
      ]);
    },
  });
}
