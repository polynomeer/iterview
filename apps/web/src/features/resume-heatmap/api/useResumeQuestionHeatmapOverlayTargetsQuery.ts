import { useQuery } from "@tanstack/react-query";
import { mapResumeQuestionHeatmapOverlayTargetListDtoToModel } from "../../../entities/resume-heatmap/model";
import { queryKeys } from "../../../shared/api/queryKeys";
import { getResumeQuestionHeatmapOverlayTargetsRequest } from "../../../shared/api/resumeHeatmapApi";
import type { ResumeQuestionHeatmapFiltersDto } from "../../../shared/types/resumeHeatmap";

export function useResumeQuestionHeatmapOverlayTargetsQuery(
  versionId: string | null,
  filters: ResumeQuestionHeatmapFiltersDto,
) {
  return useQuery({
    queryKey: versionId
      ? queryKeys.resumes.heatmapOverlayTargets(versionId, filters)
      : [...queryKeys.resumes.root, "heatmap-overlay-targets", "inactive", filters],
    queryFn: async ({ signal }) =>
      mapResumeQuestionHeatmapOverlayTargetListDtoToModel(
        await getResumeQuestionHeatmapOverlayTargetsRequest(versionId ?? "", filters, signal),
      ),
    enabled: Boolean(versionId),
  });
}
