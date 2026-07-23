import { useMutation, useQueryClient } from "@tanstack/react-query";
import { submitInterviewSessionAnswerRequest } from "../../../shared/api/interviewApi";
import { queryKeys } from "../../../shared/api/queryKeys";
import type { SubmitInterviewSessionAnswerRequestDto } from "../../../shared/types/interview";

type SubmitSessionAnswerInput = {
  sessionId: string;
  payload: SubmitInterviewSessionAnswerRequestDto;
};

export function useSubmitInterviewSessionAnswerMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ sessionId, payload }: SubmitSessionAnswerInput) =>
      submitInterviewSessionAnswerRequest(sessionId, payload),
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
        queryClient.invalidateQueries({ queryKey: queryKeys.questions.root }),
        queryClient.invalidateQueries({ queryKey: queryKeys.answerAttempts.root }),
        queryClient.invalidateQueries({ queryKey: queryKeys.home.detail }),
        queryClient.invalidateQueries({ queryKey: queryKeys.reviewQueue.root }),
        queryClient.invalidateQueries({ queryKey: queryKeys.skills.root }),
      ]);
    },
  });
}
