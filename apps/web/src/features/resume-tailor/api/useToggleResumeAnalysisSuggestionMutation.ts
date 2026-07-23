import { useMutation, useQueryClient } from "@tanstack/react-query";
import { mapResumeAnalysisDtoToModel } from "../../../entities/resume-tailor/model";
import { queryKeys } from "../../../shared/api/queryKeys";
import { updateResumeAnalysisSuggestionRequest } from "../../../shared/api/resumeTailorApi";

type Params = {
  suggestionId: string;
  accepted: boolean;
};

export function useToggleResumeAnalysisSuggestionMutation(
  versionId: string | null,
  analysisId: string | null,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ suggestionId, accepted }: Params) =>
      mapResumeAnalysisDtoToModel(
        await updateResumeAnalysisSuggestionRequest(
          versionId ?? "",
          analysisId ?? "",
          suggestionId,
          { accepted },
        ),
      ),
    onSuccess: async (analysis) => {
      if (!versionId || !analysisId) {
        return;
      }

      queryClient.setQueryData(queryKeys.resumes.analysisDetail(versionId, analysisId), analysis);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.resumes.analyses(versionId) }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.resumes.analysisExports(versionId, analysisId),
        }),
      ]);
    },
  });
}
