export type CreateJobPostingRequestDto = {
  inputType: string;
  sourceUrl?: string | null;
  rawText?: string | null;
  companyName?: string | null;
  roleName?: string | null;
};

export type JobPostingDto = {
  id?: string | number | null;
  inputType?: string | null;
  sourceUrl?: string | null;
  rawText?: string | null;
  fetchStatus?: string | null;
  fetchedTitle?: string | null;
  fetchErrorMessage?: string | null;
  fetchedAt?: string | null;
  companyName?: string | null;
  roleName?: string | null;
  parsedRequirements?: string[] | null;
  parsedNiceToHave?: string[] | null;
  parsedKeywords?: string[] | null;
  parsedResponsibilities?: string[] | null;
  parsedSummary?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type CreateResumeAnalysisRequestDto = {
  jobPostingId?: string | number | null;
  preferredFormatType?: string | null;
};

export type UpdateResumeAnalysisSuggestionRequestDto = {
  accepted: boolean;
};

export type ResumeAnalysisListItemDto = {
  id?: string | number | null;
  resumeVersionId?: string | number | null;
  jobPostingId?: string | number | null;
  status?: string | null;
  overallScore?: number | null;
  matchSummary?: string | null;
  suggestedHeadline?: string | null;
  recommendedFormatType?: string | null;
  generationSource?: string | null;
  llmModel?: string | null;
  createdAt?: string | null;
};

export type ResumeAnalysisSuggestionDto = {
  id?: string | number | null;
  sectionKey?: string | null;
  originalText?: string | null;
  suggestedText?: string | null;
  reason?: string | null;
  suggestionType?: string | null;
  accepted?: boolean | null;
  displayOrder?: number | null;
  createdAt?: string | null;
};

export type ResumeTailoredDocumentSectionDto = {
  sectionKey?: string | null;
  title?: string | null;
  lines?: string[] | null;
};

export type ResumeTailoredDocumentDto = {
  title?: string | null;
  targetCompany?: string | null;
  targetRole?: string | null;
  formatType?: string | null;
  sectionOrder?: string[] | null;
  summary?: string | null;
  diffSummary?: string | null;
  analysisNotes?: string[] | null;
  sections?: ResumeTailoredDocumentSectionDto[] | null;
  plainText?: string | null;
};

export type CreateResumeAnalysisExportRequestDto = {
  exportType: string;
};

export type ResumeAnalysisExportDto = {
  id?: string | number | null;
  resumeAnalysisId?: string | number | null;
  exportType?: string | null;
  formatType?: string | null;
  fileName?: string | null;
  fileUrl?: string | null;
  fileSizeBytes?: number | null;
  checksumSha256?: string | null;
  pageCount?: number | null;
  createdAt?: string | null;
};

export type ResumeAnalysisDto = {
  id?: string | number | null;
  resumeVersionId?: string | number | null;
  jobPostingId?: string | number | null;
  status?: string | null;
  overallScore?: number | null;
  matchSummary?: string | null;
  strongMatches?: string[] | null;
  missingKeywords?: string[] | null;
  weakSignals?: string[] | null;
  recommendedFocusAreas?: string[] | null;
  suggestedHeadline?: string | null;
  suggestedSummary?: string | null;
  recommendedFormatType?: string | null;
  generationSource?: string | null;
  llmModel?: string | null;
  analysisNotes?: string[] | null;
  tailoredDocument?: ResumeTailoredDocumentDto | null;
  suggestions?: ResumeAnalysisSuggestionDto[] | null;
  exports?: ResumeAnalysisExportDto[] | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};
