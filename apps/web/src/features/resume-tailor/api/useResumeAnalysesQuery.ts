import { useQuery } from "@tanstack/react-query";
import { mapResumeAnalysisListDtoToModel } from "../../../entities/resume-tailor/model";
import { getResumeAnalysesRequest } from "../../../shared/api/resumeTailorApi";
import { queryKeys } from "../../../shared/api/queryKeys";

export function useResumeAnalysesQuery(versionId: string | null, enabled = true) {
  return useQuery({
    queryKey: versionId
      ? queryKeys.resumes.analyses(versionId)
      : [...queryKeys.resumes.root, "analyses", "inactive"],
    queryFn: async ({ signal }) =>
      mapResumeAnalysisListDtoToModel(await getResumeAnalysesRequest(versionId ?? "", signal)),
    enabled: Boolean(versionId) && enabled,
  });
}
