import { apiEndpoints } from "./endpoints";
import { httpClient } from "./httpClient";
import type {
  CreateResumeRequestDto,
  CreateResumeVersionRequestDto,
  ResumeDto,
  ResumeAchievementItemDto,
  ResumeAchievementItemResponseDto,
  UpdateResumeAchievementEvidenceRequestDto,
  ResumeAwardItemResponseDto,
  ResumeCertificationItemResponseDto,
  ResumeCompetencyItemResponseDto,
  ResumeContactPointResponseDto,
  ResumeEducationItemResponseDto,
  ResumeExperienceSnapshotResponseDto,
  ResumeListResponseDto,
  ResumeProfileSnapshotResponseDto,
  ResumeProjectSnapshotResponseDto,
  ResumeRiskItemResponseDto,
  ResumeSkillSnapshotResponseDto,
  ResumeVersionDto,
  ResumeVersionExtractionDto,
  UploadResumeVersionRequestDto,
} from "../types/resume";

export function getResumesRequest(signal?: AbortSignal) {
  return httpClient.get<ResumeListResponseDto>(apiEndpoints.resumes.root, { signal });
}

export function getLatestResumeRequest(signal?: AbortSignal) {
  return httpClient.get<ResumeDto>(apiEndpoints.resumes.latest, { signal });
}

export function createResumeRequest(payload: CreateResumeRequestDto) {
  return httpClient.post<ResumeDto, CreateResumeRequestDto>(apiEndpoints.resumes.root, {
    body: payload,
  });
}

export function createResumeVersionRequest(
  resumeId: string,
  payload: CreateResumeVersionRequestDto,
) {
  return httpClient.post<void, CreateResumeVersionRequestDto>(
    apiEndpoints.resumes.versions(resumeId),
    {
      body: payload,
    },
  );
}

export function uploadResumeVersionRequest(resumeId: string, payload: UploadResumeVersionRequestDto) {
  const body = new FormData();
  body.append("file", payload.file);

  if (payload.summaryText) {
    body.append("summaryText", payload.summaryText);
  }

  return httpClient.post<ResumeVersionDto, FormData>(apiEndpoints.resumes.uploadVersion(resumeId), {
    body,
  });
}

export function getResumeVersionDetailRequest(versionId: string, signal?: AbortSignal) {
  return httpClient.get<ResumeVersionDto>(apiEndpoints.resumeVersions.detail(versionId), {
    signal,
  });
}

export function getResumeVersionExtractionRequest(versionId: string, signal?: AbortSignal) {
  return httpClient.get<ResumeVersionExtractionDto>(apiEndpoints.resumeVersions.extraction(versionId), {
    signal,
  });
}

export function downloadResumeVersionFileRequest(versionId: string, signal?: AbortSignal) {
  return httpClient.getBlob(apiEndpoints.resumeVersions.file(versionId), {
    signal,
  });
}

export function getResumeVersionProfileRequest(versionId: string, signal?: AbortSignal) {
  return httpClient.get<ResumeProfileSnapshotResponseDto>(apiEndpoints.resumeVersions.profile(versionId), {
    signal,
  });
}

export function getResumeVersionContactsRequest(versionId: string, signal?: AbortSignal) {
  return httpClient.get<ResumeContactPointResponseDto>(apiEndpoints.resumeVersions.contacts(versionId), {
    signal,
  });
}

export function getResumeVersionCompetenciesRequest(versionId: string, signal?: AbortSignal) {
  return httpClient.get<ResumeCompetencyItemResponseDto>(apiEndpoints.resumeVersions.competencies(versionId), {
    signal,
  });
}

export function activateResumeVersionRequest(versionId: string) {
  return httpClient.post<void>(apiEndpoints.resumeVersions.activate(versionId));
}

export function reExtractResumeVersionRequest(versionId: string) {
  return httpClient.post<ResumeVersionExtractionDto>(apiEndpoints.resumeVersions.reExtract(versionId));
}

export function getResumeVersionSkillsRequest(versionId: string, signal?: AbortSignal) {
  return httpClient.get<ResumeSkillSnapshotResponseDto>(apiEndpoints.resumeVersions.skills(versionId), {
    signal,
  });
}

export function getResumeVersionExperiencesRequest(versionId: string, signal?: AbortSignal) {
  return httpClient.get<ResumeExperienceSnapshotResponseDto>(
    apiEndpoints.resumeVersions.experiences(versionId),
    { signal },
  );
}

export function getResumeVersionProjectsRequest(versionId: string, signal?: AbortSignal) {
  return httpClient.get<ResumeProjectSnapshotResponseDto>(apiEndpoints.resumeVersions.projects(versionId), {
    signal,
  });
}

export function getResumeVersionAchievementsRequest(versionId: string, signal?: AbortSignal) {
  return httpClient.get<ResumeAchievementItemResponseDto>(
    apiEndpoints.resumeVersions.achievements(versionId),
    { signal },
  );
}

export function updateResumeAchievementEvidenceRequest(
  versionId: string,
  achievementId: string,
  body: UpdateResumeAchievementEvidenceRequestDto,
) {
  return httpClient.put<ResumeAchievementItemDto, UpdateResumeAchievementEvidenceRequestDto>(
    apiEndpoints.resumeVersions.achievementEvidence(versionId, achievementId),
    { body },
  );
}

export function getResumeVersionEducationRequest(versionId: string, signal?: AbortSignal) {
  return httpClient.get<ResumeEducationItemResponseDto>(apiEndpoints.resumeVersions.education(versionId), {
    signal,
  });
}

export function getResumeVersionCertificationsRequest(versionId: string, signal?: AbortSignal) {
  return httpClient.get<ResumeCertificationItemResponseDto>(
    apiEndpoints.resumeVersions.certifications(versionId),
    { signal },
  );
}

export function getResumeVersionAwardsRequest(versionId: string, signal?: AbortSignal) {
  return httpClient.get<ResumeAwardItemResponseDto>(apiEndpoints.resumeVersions.awards(versionId), {
    signal,
  });
}

export function getResumeVersionRisksRequest(versionId: string, signal?: AbortSignal) {
  return httpClient.get<ResumeRiskItemResponseDto>(apiEndpoints.resumeVersions.risks(versionId), {
    signal,
  });
}
