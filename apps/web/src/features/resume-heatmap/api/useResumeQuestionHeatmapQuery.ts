import { useQuery } from "@tanstack/react-query";
import { mapResumeQuestionHeatmapDtoToModel } from "../../../entities/resume-heatmap/model";
import { queryKeys } from "../../../shared/api/queryKeys";
import { getResumeQuestionHeatmapRequest } from "../../../shared/api/resumeHeatmapApi";
import type { ResumeQuestionHeatmapFiltersDto } from "../../../shared/types/resumeHeatmap";

export function useResumeQuestionHeatmapQuery(
  versionId: string | null,
  filters: ResumeQuestionHeatmapFiltersDto,
) {
  return useQuery({
    queryKey: versionId
      ? queryKeys.resumes.heatmap(versionId, filters)
      : [...queryKeys.resumes.root, "heatmap", "inactive", filters],
    queryFn: async ({ signal }) =>
      mapResumeQuestionHeatmapDtoToModel(
        await getResumeQuestionHeatmapRequest(versionId ?? "", filters, signal),
      ),
    enabled: Boolean(versionId),
  });
}
