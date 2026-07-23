import { useMutation, useQueryClient } from "@tanstack/react-query";
import { mapResumeAnalysisDtoToModel } from "../../../entities/resume-tailor/model";
import { queryKeys } from "../../../shared/api/queryKeys";
import { createResumeAnalysisRequest } from "../../../shared/api/resumeTailorApi";
import type { CreateResumeAnalysisRequestDto } from "../../../shared/types/resumeTailor";

export function useCreateResumeAnalysisMutation(versionId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateResumeAnalysisRequestDto) =>
      mapResumeAnalysisDtoToModel(await createResumeAnalysisRequest(versionId ?? "", payload)),
    onSuccess: async (analysis) => {
      if (!versionId) {
        return;
      }

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.resumes.analyses(versionId) }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.resumes.analysisDetail(versionId, analysis.id),
        }),
      ]);
    },
  });
}
