import { useMutation, useQueryClient } from "@tanstack/react-query";
import { reExtractResumeVersionRequest } from "../../../shared/api/resumeApi";
import { queryKeys } from "../../../shared/api/queryKeys";

export function useReExtractResumeVersionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: reExtractResumeVersionRequest,
    onSuccess: async (_, versionId) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.resumes.versionDetail(versionId) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.resumes.extraction(versionId) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.resumes.analysis(versionId) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.resumes.snapshots(versionId) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.resumes.root }),
      ]);
    },
  });
}
