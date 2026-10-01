import { apiEndpoints } from "./endpoints";
import { httpClient } from "./httpClient";
import type {
  CreateResumeQuestionHeatmapLinkRequestDto,
  ResumeQuestionHeatmapDto,
  ResumeQuestionHeatmapFiltersDto,
  ResumeQuestionHeatmapLinkDto,
  ResumeQuestionHeatmapOverlayTargetListDto,
  UpdateResumeQuestionHeatmapLinkRequestDto,
} from "../types/resumeHeatmap";

function buildHeatmapSearchParams(filters: ResumeQuestionHeatmapFiltersDto) {
  const searchParams = new URLSearchParams();

  if (filters.scope) {
    searchParams.set("scope", filters.scope);
  }

  if (filters.weakOnly) {
    searchParams.set("weakOnly", "true");
  }

  if (filters.companyName) {
    searchParams.set("companyName", filters.companyName);
  }

  if (filters.interviewDateFrom) {
    searchParams.set("interviewDateFrom", filters.interviewDateFrom);
  }

  if (filters.interviewDateTo) {
    searchParams.set("interviewDateTo", filters.interviewDateTo);
  }

  if (filters.targetType) {
    searchParams.set("targetType", filters.targetType);
  }

  return searchParams.toString();
}

export function getResumeQuestionHeatmapRequest(
  versionId: string,
  filters: ResumeQuestionHeatmapFiltersDto,
  signal?: AbortSignal,
) {
  const query = buildHeatmapSearchParams(filters);
  const path = query
    ? `${apiEndpoints.resumeVersions.questionHeatmap(versionId)}?${query}`
    : apiEndpoints.resumeVersions.questionHeatmap(versionId);

  return httpClient.get<ResumeQuestionHeatmapDto>(path, { signal });
}

export function getResumeQuestionHeatmapOverlayTargetsRequest(
  versionId: string,
  filters: ResumeQuestionHeatmapFiltersDto,
  signal?: AbortSignal,
) {
  const query = buildHeatmapSearchParams(filters);
  const path = query
    ? `${apiEndpoints.resumeVersions.questionHeatmapOverlayTargets(versionId)}?${query}`
    : apiEndpoints.resumeVersions.questionHeatmapOverlayTargets(versionId);

  return httpClient.get<ResumeQuestionHeatmapOverlayTargetListDto>(path, { signal });
}

export function createResumeQuestionHeatmapLinkRequest(
  versionId: string,
  payload: CreateResumeQuestionHeatmapLinkRequestDto,
) {
  return httpClient.post<ResumeQuestionHeatmapLinkDto, CreateResumeQuestionHeatmapLinkRequestDto>(
    apiEndpoints.resumeVersions.questionHeatmapLinks(versionId),
    {
      body: payload,
    },
  );
}

export function updateResumeQuestionHeatmapLinkRequest(
  versionId: string,
  linkId: string,
  payload: UpdateResumeQuestionHeatmapLinkRequestDto,
) {
  return httpClient.patch<ResumeQuestionHeatmapLinkDto, UpdateResumeQuestionHeatmapLinkRequestDto>(
    apiEndpoints.resumeVersions.questionHeatmapLink(versionId, linkId),
    {
      body: payload,
    },
  );
}

/** Narrows an interview question to one resume claim, or to none (ADR 0084). */
export function assignResumeQuestionClaimRequest(versionId: string, interviewRecordQuestionId: string, achievementId: string | null) {
  return httpClient.put<ResumeQuestionHeatmapLinkDto, { achievementId: number | null }>(
    apiEndpoints.resumeVersions.questionHeatmapClaim(versionId, interviewRecordQuestionId),
    { body: { achievementId: achievementId === null ? null : Number(achievementId) } },
  );
}
