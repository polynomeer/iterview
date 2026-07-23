import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createResumeRequest } from "../../../shared/api/resumeApi";
import { queryKeys } from "../../../shared/api/queryKeys";

export function useCreateResumeMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createResumeRequest,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.resumes.root }),
        queryClient.invalidateQueries({ queryKey: queryKeys.auth.currentUser }),
      ]);
    },
  });
}
