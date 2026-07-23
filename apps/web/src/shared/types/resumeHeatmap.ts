export type ResumeQuestionHeatmapScopeDto = "all" | "main" | "follow_up";
export type ResumeQuestionHeatmapTargetTypeDto =
  | "block"
  | "sentence"
  | "phrase"
  | "keyword";

export type ResumeQuestionHeatmapFiltersDto = {
  scope?: ResumeQuestionHeatmapScopeDto;
  weakOnly?: boolean;
  companyName?: string;
  interviewDateFrom?: string;
  interviewDateTo?: string;
  targetType?: ResumeQuestionHeatmapTargetTypeDto;
};

export type ResumeQuestionHeatmapAppliedFiltersDto = {
  scope?: string | null;
  weakOnly?: boolean | null;
  companyName?: string | null;
  interviewDateFrom?: string | null;
  interviewDateTo?: string | null;
  targetType?: string | null;
};

export type ResumeQuestionHeatmapFilterSummaryDto = {
  totalQuestions?: number | null;
  weakQuestionCount?: number | null;
  pressureQuestionCount?: number | null;
  followUpQuestionCount?: number | null;
  distinctInterviewCount?: number | null;
  distinctCompanyCount?: number | null;
  companyNames?: string[] | null;
  availableTargetTypes?: string[] | null;
  targetTypeCounts?: Record<string, number> | null;
  earliestInterviewDate?: string | null;
  latestInterviewDate?: string | null;
};

export type ResumeQuestionHeatmapSummaryDto = {
  totalAnchors?: number | null;
  totalLinkedQuestions?: number | null;
  hottestAnchorLabel?: string | null;
  mostFollowedUpAnchorLabel?: string | null;
  weakestAnchorLabel?: string | null;
};

export type ResumeQuestionHeatmapQuestionDto = {
  interviewRecordQuestionId?: string | number | null;
  sourceInterviewRecordId?: string | number | null;
  linkedQuestionId?: string | number | null;
  text?: string | null;
  questionType?: string | null;
  isFollowUp?: boolean | null;
  followUpCount?: number | null;
  pressureQuestion?: boolean | null;
  weakAnswer?: boolean | null;
  weaknessTags?: string[] | null;
  interviewDate?: string | null;
  linkSource?: string | null;
  confidenceScore?: number | null;
};

export type ResumeQuestionHeatmapOverlayTargetDto = {
  id?: string | number | null;
  anchorType?: string | null;
  anchorRecordId?: string | number | null;
  anchorKey?: string | null;
  targetType?: string | null;
  targetKey?: string | null;
  fieldPath?: string | null;
  textSnippet?: string | null;
  textStartOffset?: number | null;
  textEndOffset?: number | null;
  sentenceIndex?: number | null;
  paragraphIndex?: number | null;
  heatScore?: number | null;
  normalizedHeatLevel?: string | null;
  questionCount?: number | null;
  followUpCount?: number | null;
  pressureQuestionCount?: number | null;
  weaknessCount?: number | null;
  linkedQuestions?: ResumeQuestionHeatmapQuestionDto[] | null;
};

export type ResumeQuestionHeatmapItemDto = {
  anchorType?: string | null;
  anchorRecordId?: string | number | null;
  anchorKey?: string | null;
  label?: string | null;
  snippet?: string | null;
  heatScore?: number | null;
  normalizedHeatLevel?: string | null;
  directQuestionCount?: number | null;
  followUpCount?: number | null;
  distinctInterviewCount?: number | null;
  pressureQuestionCount?: number | null;
  weaknessCount?: number | null;
  recentQuestionAt?: string | null;
  overlayTargets?: ResumeQuestionHeatmapOverlayTargetDto[] | null;
  linkedQuestions?: ResumeQuestionHeatmapQuestionDto[] | null;
};

export type ResumeQuestionHeatmapDto = {
  resumeVersionId?: string | number | null;
  scope?: string | null;
  appliedFilters?: ResumeQuestionHeatmapAppliedFiltersDto | null;
  filterSummary?: ResumeQuestionHeatmapFilterSummaryDto | null;
  summary?: ResumeQuestionHeatmapSummaryDto | null;
  items?: ResumeQuestionHeatmapItemDto[] | null;
};

export type ResumeQuestionHeatmapOverlayTargetListDto = {
  resumeVersionId?: string | number | null;
  scope?: string | null;
  appliedFilters?: ResumeQuestionHeatmapAppliedFiltersDto | null;
  filterSummary?: ResumeQuestionHeatmapFilterSummaryDto | null;
  items?: ResumeQuestionHeatmapOverlayTargetDto[] | null;
};

export type ResumeQuestionHeatmapLinkDto = {
  id?: string | number | null;
  resumeVersionId?: string | number | null;
  interviewRecordQuestionId?: string | number | null;
  anchorType?: string | null;
  anchorRecordId?: string | number | null;
  anchorKey?: string | null;
  overlayTargetType?: string | null;
  overlayFieldPath?: string | null;
  overlaySentenceIndex?: number | null;
  overlayTextSnippet?: string | null;
  linkSource?: string | null;
  confidenceScore?: number | null;
  active?: boolean | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type CreateResumeQuestionHeatmapLinkRequestDto = {
  interviewRecordQuestionId: string | number;
  anchorType: string;
  anchorRecordId?: string | number | null;
  anchorKey?: string | null;
  overlayTargetType?: string | null;
  overlayFieldPath?: string | null;
  overlaySentenceIndex?: number | null;
  overlayTextSnippet?: string | null;
  confidenceScore?: number | null;
};

export type UpdateResumeQuestionHeatmapLinkRequestDto = {
  anchorType?: string | null;
  anchorRecordId?: string | number | null;
  anchorKey?: string | null;
  overlayTargetType?: string | null;
  overlayFieldPath?: string | null;
  overlaySentenceIndex?: number | null;
  overlayTextSnippet?: string | null;
  confidenceScore?: number | null;
  active?: boolean | null;
};
