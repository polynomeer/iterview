import { apiEndpoints } from "./endpoints";
import { httpClient } from "./httpClient";
import type {
  CreateJobPostingRequestDto,
  CreateResumeAnalysisExportRequestDto,
  CreateResumeAnalysisRequestDto,
  JobPostingDto,
  ResumeAnalysisDto,
  ResumeAnalysisExportDto,
  ResumeAnalysisListItemDto,
  UpdateResumeAnalysisSuggestionRequestDto,
} from "../types/resumeTailor";

export function getJobPostingsRequest(signal?: AbortSignal) {
  return httpClient.get<JobPostingDto[]>(apiEndpoints.jobPostings.root, { signal });
}

export function createJobPostingRequest(payload: CreateJobPostingRequestDto) {
  return httpClient.post<JobPostingDto, CreateJobPostingRequestDto>(apiEndpoints.jobPostings.root, {
    body: payload,
  });
}

export function getJobPostingDetailRequest(jobPostingId: string, signal?: AbortSignal) {
  return httpClient.get<JobPostingDto>(apiEndpoints.jobPostings.detail(jobPostingId), {
    signal,
  });
}

export function getResumeAnalysesRequest(versionId: string, signal?: AbortSignal) {
  return httpClient.get<ResumeAnalysisListItemDto[]>(
    apiEndpoints.resumeVersions.analyses(versionId),
    { signal },
  );
}

export function createResumeAnalysisRequest(
  versionId: string,
  payload: CreateResumeAnalysisRequestDto,
) {
  return httpClient.post<ResumeAnalysisDto, CreateResumeAnalysisRequestDto>(
    apiEndpoints.resumeVersions.analyses(versionId),
    { body: payload },
  );
}

export function getResumeAnalysisDetailRequest(
  versionId: string,
  analysisId: string,
  signal?: AbortSignal,
) {
  return httpClient.get<ResumeAnalysisDto>(
    apiEndpoints.resumeVersions.analysisDetail(versionId, analysisId),
    { signal },
  );
}

export function updateResumeAnalysisSuggestionRequest(
  versionId: string,
  analysisId: string,
  suggestionId: string,
  payload: UpdateResumeAnalysisSuggestionRequestDto,
) {
  return httpClient.patch<ResumeAnalysisDto, UpdateResumeAnalysisSuggestionRequestDto>(
    apiEndpoints.resumeVersions.analysisSuggestion(versionId, analysisId, suggestionId),
    { body: payload },
  );
}

export function getResumeAnalysisExportsRequest(
  versionId: string,
  analysisId: string,
  signal?: AbortSignal,
) {
  return httpClient.get<ResumeAnalysisExportDto[]>(
    apiEndpoints.resumeVersions.analysisExports(versionId, analysisId),
    { signal },
  );
}

export function createResumeAnalysisExportRequest(
  versionId: string,
  analysisId: string,
  payload: CreateResumeAnalysisExportRequestDto,
) {
  return httpClient.post<ResumeAnalysisExportDto, CreateResumeAnalysisExportRequestDto>(
    apiEndpoints.resumeVersions.analysisExports(versionId, analysisId),
    { body: payload },
  );
}

export function downloadResumeAnalysisExportFileRequest(
  versionId: string,
  analysisId: string,
  exportId: string,
  signal?: AbortSignal,
) {
  return httpClient.getBlob(
    apiEndpoints.resumeVersions.analysisExportFile(versionId, analysisId, exportId),
    { signal },
  );
}
