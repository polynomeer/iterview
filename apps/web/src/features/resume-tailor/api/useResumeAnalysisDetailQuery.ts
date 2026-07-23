import { useQuery } from "@tanstack/react-query";
import { mapResumeAnalysisDtoToModel } from "../../../entities/resume-tailor/model";
import { getResumeAnalysisDetailRequest } from "../../../shared/api/resumeTailorApi";
import { queryKeys } from "../../../shared/api/queryKeys";

export function useResumeAnalysisDetailQuery(
  versionId: string | null,
  analysisId: string | null,
  enabled = true,
) {
  return useQuery({
    queryKey:
      versionId && analysisId
        ? queryKeys.resumes.analysisDetail(versionId, analysisId)
        : [...queryKeys.resumes.root, "analysis-detail", "inactive"],
    queryFn: async ({ signal }) =>
      mapResumeAnalysisDtoToModel(
        await getResumeAnalysisDetailRequest(versionId ?? "", analysisId ?? "", signal),
      ),
    enabled: Boolean(versionId && analysisId) && enabled,
  });
}
