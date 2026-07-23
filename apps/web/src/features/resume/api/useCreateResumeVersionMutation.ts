import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createResumeVersionRequest } from "../../../shared/api/resumeApi";
import { queryKeys } from "../../../shared/api/queryKeys";

type CreateResumeVersionInput = {
  resumeId: string;
  fileName: string;
};

export function useCreateResumeVersionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ resumeId, fileName }: CreateResumeVersionInput) =>
      createResumeVersionRequest(resumeId, { fileName }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.resumes.root }),
        queryClient.invalidateQueries({ queryKey: queryKeys.auth.currentUser }),
      ]);
    },
  });
}
