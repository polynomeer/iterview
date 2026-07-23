import { useQuery } from "@tanstack/react-query";
import { mapResumeAnalysisExportsDtoToModel } from "../../../entities/resume-tailor/model";
import { getResumeAnalysisExportsRequest } from "../../../shared/api/resumeTailorApi";
import { queryKeys } from "../../../shared/api/queryKeys";

export function useResumeAnalysisExportsQuery(
  versionId: string | null,
  analysisId: string | null,
  enabled = true,
) {
  return useQuery({
    queryKey:
      versionId && analysisId
        ? queryKeys.resumes.analysisExports(versionId, analysisId)
        : [...queryKeys.resumes.root, "analysis-exports", "inactive"],
    queryFn: async ({ signal }) =>
      mapResumeAnalysisExportsDtoToModel(
        await getResumeAnalysisExportsRequest(versionId ?? "", analysisId ?? "", signal),
      ),
    enabled: Boolean(versionId && analysisId) && enabled,
  });
}
