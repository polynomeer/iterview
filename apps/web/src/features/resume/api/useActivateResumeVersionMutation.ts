import { useMutation, useQueryClient } from "@tanstack/react-query";
import { activateResumeVersionRequest } from "../../../shared/api/resumeApi";
import { queryKeys } from "../../../shared/api/queryKeys";

export function useActivateResumeVersionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: activateResumeVersionRequest,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.resumes.root }),
        queryClient.invalidateQueries({ queryKey: queryKeys.auth.currentUser }),
        queryClient.invalidateQueries({ queryKey: queryKeys.home.root }),
        queryClient.invalidateQueries({ queryKey: queryKeys.feed.root }),
        queryClient.invalidateQueries({ queryKey: queryKeys.questions.root }),
        queryClient.invalidateQueries({ queryKey: queryKeys.skills.root }),
      ]);
    },
  });
}
