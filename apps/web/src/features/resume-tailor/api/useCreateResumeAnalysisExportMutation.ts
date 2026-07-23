import { useMutation, useQueryClient } from "@tanstack/react-query";
import { mapResumeAnalysisDtoToModel, mapResumeAnalysisExportsDtoToModel } from "../../../entities/resume-tailor/model";
import { queryKeys } from "../../../shared/api/queryKeys";
import {
  createResumeAnalysisExportRequest,
  getResumeAnalysisDetailRequest,
  getResumeAnalysisExportsRequest,
} from "../../../shared/api/resumeTailorApi";

export function useCreateResumeAnalysisExportMutation(
  versionId: string | null,
  analysisId: string | null,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () =>
      createResumeAnalysisExportRequest(versionId ?? "", analysisId ?? "", {
        exportType: "pdf",
      }),
    onSuccess: async () => {
      if (!versionId || !analysisId) {
        return;
      }

      const [analysisDetail, exports] = await Promise.all([
        getResumeAnalysisDetailRequest(versionId, analysisId),
        getResumeAnalysisExportsRequest(versionId, analysisId),
      ]);

      queryClient.setQueryData(
        queryKeys.resumes.analysisDetail(versionId, analysisId),
        mapResumeAnalysisDtoToModel(analysisDetail),
      );
      queryClient.setQueryData(
        queryKeys.resumes.analysisExports(versionId, analysisId),
        mapResumeAnalysisExportsDtoToModel(exports),
      );
      await queryClient.invalidateQueries({ queryKey: queryKeys.resumes.analyses(versionId) });
    },
  });
}
