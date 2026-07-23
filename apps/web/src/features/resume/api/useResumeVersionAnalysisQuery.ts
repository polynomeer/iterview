import { useQuery } from "@tanstack/react-query";
import { mapResumeAnalysisResponsesToModel } from "../../../entities/resume/model";
import {
  getResumeVersionExperiencesRequest,
  getResumeVersionRisksRequest,
  getResumeVersionSkillsRequest,
} from "../../../shared/api/resumeApi";
import { queryKeys } from "../../../shared/api/queryKeys";

export function useResumeVersionAnalysisQuery(versionId: string | null, enabled = true) {
  return useQuery({
    queryKey: versionId ? queryKeys.resumes.analysis(versionId) : [...queryKeys.resumes.root, "analysis", "inactive"],
    queryFn: async ({ signal }) => {
      const [skills, experiences, risks] = await Promise.all([
        getResumeVersionSkillsRequest(versionId ?? "", signal),
        getResumeVersionExperiencesRequest(versionId ?? "", signal),
        getResumeVersionRisksRequest(versionId ?? "", signal),
      ]);

      return mapResumeAnalysisResponsesToModel(skills, experiences, risks);
    },
    enabled: Boolean(versionId) && enabled,
  });
}
