import { useQuery } from "@tanstack/react-query";
import { mapResumeSnapshotsToModel } from "../../../entities/resume/model";
import {
  getResumeVersionAchievementsRequest,
  getResumeVersionAwardsRequest,
  getResumeVersionCertificationsRequest,
  getResumeVersionCompetenciesRequest,
  getResumeVersionContactsRequest,
  getResumeVersionEducationRequest,
  getResumeVersionExperiencesRequest,
  getResumeVersionProfileRequest,
  getResumeVersionProjectsRequest,
  getResumeVersionRisksRequest,
  getResumeVersionSkillsRequest,
} from "../../../shared/api/resumeApi";
import { queryKeys } from "../../../shared/api/queryKeys";

export function useResumeVersionSnapshotsQuery(versionId: string | null, enabled = true) {
  return useQuery({
    queryKey: versionId
      ? queryKeys.resumes.snapshots(versionId)
      : [...queryKeys.resumes.root, "snapshots", "inactive"],
    queryFn: async ({ signal }) => {
      const [
        profileResponse,
        contactsResponse,
        competenciesResponse,
        skillsResponse,
        experiencesResponse,
        projectsResponse,
        achievementsResponse,
        educationResponse,
        certificationsResponse,
        awardsResponse,
        risksResponse,
      ] = await Promise.all([
        getResumeVersionProfileRequest(versionId ?? "", signal),
        getResumeVersionContactsRequest(versionId ?? "", signal),
        getResumeVersionCompetenciesRequest(versionId ?? "", signal),
        getResumeVersionSkillsRequest(versionId ?? "", signal),
        getResumeVersionExperiencesRequest(versionId ?? "", signal),
        getResumeVersionProjectsRequest(versionId ?? "", signal),
        getResumeVersionAchievementsRequest(versionId ?? "", signal),
        getResumeVersionEducationRequest(versionId ?? "", signal),
        getResumeVersionCertificationsRequest(versionId ?? "", signal),
        getResumeVersionAwardsRequest(versionId ?? "", signal),
        getResumeVersionRisksRequest(versionId ?? "", signal),
      ]);

      return mapResumeSnapshotsToModel({
        profileResponse,
        contactsResponse,
        competenciesResponse,
        skillsResponse,
        experiencesResponse,
        projectsResponse,
        achievementsResponse,
        educationResponse,
        certificationsResponse,
        awardsResponse,
        risksResponse,
      });
    },
    enabled: Boolean(versionId) && enabled,
  });
}
