import { useMutation, useQueryClient } from "@tanstack/react-query";
import { submitAnswerRequest } from "../../../shared/api/answerApi";
import { queryKeys } from "../../../shared/api/queryKeys";

type SubmitAnswerInput = {
  questionId: string;
  resumeVersionId: string | null;
  contentText: string;
};

export function useSubmitAnswerMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ questionId, resumeVersionId, contentText }: SubmitAnswerInput) =>
      submitAnswerRequest(questionId, {
        resumeVersionId,
        answerMode: "text",
        contentText,
      }),
    onSuccess: async (_, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.questions.root }),
        queryClient.invalidateQueries({ queryKey: queryKeys.home.detail }),
        queryClient.invalidateQueries({ queryKey: queryKeys.reviewQueue.root }),
        queryClient.invalidateQueries({ queryKey: queryKeys.feed.root }),
        queryClient.invalidateQueries({ queryKey: queryKeys.archive.root }),
        queryClient.invalidateQueries({ queryKey: queryKeys.skills.root }),
        queryClient.invalidateQueries({ queryKey: queryKeys.answerAttempts.root }),
      ]);
    },
  });
}
