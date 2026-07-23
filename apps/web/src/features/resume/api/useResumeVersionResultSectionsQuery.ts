import { useQuery } from "@tanstack/react-query";
import {
  mapResumeExperiencesResponseToModel,
  mapResumeProjectsResponseToModel,
} from "../../../entities/resume/model";
import {
  getResumeVersionExperiencesRequest,
  getResumeVersionProjectsRequest,
} from "../../../shared/api/resumeApi";
import { queryKeys } from "../../../shared/api/queryKeys";

export function useResumeVersionResultSectionsQuery(versionId: string | undefined, enabled = true) {
  return useQuery({
    queryKey: queryKeys.resumes.resultSections(versionId ?? ""),
    queryFn: async ({ signal }) => {
      const [experiencesResponse, projectsResponse] = await Promise.all([
        getResumeVersionExperiencesRequest(versionId ?? "", signal),
        getResumeVersionProjectsRequest(versionId ?? "", signal),
      ]);

      return {
        experiences: mapResumeExperiencesResponseToModel(experiencesResponse),
        projects: mapResumeProjectsResponseToModel(projectsResponse),
      };
    },
    enabled: Boolean(versionId) && enabled,
  });
}
