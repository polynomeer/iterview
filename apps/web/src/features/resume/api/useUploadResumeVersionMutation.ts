import { useMutation, useQueryClient } from "@tanstack/react-query";
import { uploadResumeVersionRequest } from "../../../shared/api/resumeApi";
import { queryKeys } from "../../../shared/api/queryKeys";

type UploadResumeVersionInput = {
  resumeId: string;
  file: File;
  summaryText?: string;
};

export function useUploadResumeVersionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ resumeId, file, summaryText }: UploadResumeVersionInput) =>
      uploadResumeVersionRequest(resumeId, { file, summaryText }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.resumes.root }),
        queryClient.invalidateQueries({ queryKey: queryKeys.resumes.latest }),
        queryClient.invalidateQueries({ queryKey: queryKeys.auth.currentUser }),
      ]);
    },
  });
}
