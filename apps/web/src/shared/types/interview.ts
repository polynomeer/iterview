export type InterviewSessionListItemDto = {
  id?: string | number | null;
  sessionType?: string | null;
  interviewMode?: string | null;
  replayMode?: string | null;
  status?: string | null;
  resumeVersionId?: string | number | null;
  startedAt?: string | null;
  endedAt?: string | null;
  questionCount?: number | null;
  answeredCount?: number | null;
  averageScore?: number | null;
};

export type InterviewSessionQuestionDto = {
  id?: string | number | null;
  questionId?: string | number | null;
  title?: string | null;
  promptText?: string | null;
  bodyText?: string | null;
  contentLocale?: "ko" | "en" | string | null;
  difficulty?: string | null;
  orderIndex?: number | null;
  status?: string | null;
  sourceType?: string | null;
  parentSessionQuestionId?: string | number | null;
  isFollowUp?: boolean | null;
  depth?: number | null;
  categoryName?: string | null;
  tags?: string[] | null;
  focusSkillNames?: string[] | null;
  resumeContextSummary?: string | null;
  resumeEvidence?: InterviewResumeEvidenceDto[] | null;
  generationRationale?: string | null;
  generationStatus?: string | null;
  llmModel?: string | null;
  llmPromptVersion?: string | null;
  answerAttemptId?: string | number | null;
};

export type InterviewResumeEvidenceDto = {
  type?: string | null;
  section?: string | null;
  label?: string | null;
  snippet?: string | null;
  sourceRecordType?: string | null;
  sourceRecordId?: string | number | null;
  confidence?: number | null;
  startOffset?: number | null;
  endOffset?: number | null;
};

export type InterviewSessionSummaryDto = {
  totalQuestions?: number | null;
  answeredQuestions?: number | null;
  skippedQuestions?: number | null;
  remainingQuestions?: number | null;
  averageScore?: number | null;
  weakFacetSummaries?: InterviewSessionCoverageFacetSummaryDto[] | null;
  skippedFacetSummaries?: InterviewSessionCoverageFacetSummaryDto[] | null;
  facetSummaries?: InterviewSessionCoverageFacetSummaryDto[] | null;
};

export type InterviewSessionDetailResponseDto = {
  id?: string | number | null;
  sessionType?: string | null;
  interviewMode?: string | null;
  status?: string | null;
  resumeVersionId?: string | number | null;
  startedAt?: string | null;
  endedAt?: string | null;
  currentQuestion?: InterviewSessionQuestionDto | null;
  questions?: InterviewSessionQuestionDto[] | null;
  summary?: InterviewSessionSummaryDto | null;
};

export type CreateInterviewSessionRequestDto = {
  sessionType: "resume_mock" | "review_mock" | "topic_mock" | "replay_mock";
  interviewMode?: "quick_screen" | "mock_30" | "mock_60" | "free_interview" | "full_coverage";
  questionCount?: number;
  resumeVersionId?: string | number | null;
  sourceInterviewRecordId?: string | number | null;
  replayMode?: "original_replay" | "pattern_similar" | "pressure_variant" | string | null;
  seedQuestionIds?: Array<string | number>;
};

export type SubmitInterviewSessionAnswerRequestDto = {
  sessionQuestionId: string | number;
  answerMode: "text";
  contentText: string;
  resumeVersionId?: string | number | null;
};

export type InterviewSessionAnswerResponseDto = {
  sessionId?: string | number | null;
  sessionQuestionId?: string | number | null;
  status?: string | null;
  answer?: {
    answerAttemptId?: string | number | null;
    progressStatus?: string | null;
  } | null;
  nextQuestion?: InterviewSessionQuestionDto | null;
  summary?: InterviewSessionSummaryDto | null;
};

export type InterviewSessionAdvanceResponseDto = {
  sessionId?: string | number | null;
  status?: string | null;
  currentQuestion?: InterviewSessionQuestionDto | null;
  summary?: InterviewSessionSummaryDto | null;
};

export type SkipInterviewSessionQuestionRequestDto = {
  sessionQuestionId: string | number;
};

export type InterviewSessionCoverageEvidenceItemDto = {
  id?: string | number | null;
  section?: string | null;
  label?: string | null;
  snippet?: string | null;
  facet?: string | null;
  sourceRecordType?: string | null;
  sourceRecordId?: string | number | null;
  displayOrder?: number | null;
  coverageStatus?: string | null;
  linkedQuestionIds?: Array<string | number> | null;
};

export type InterviewSessionCoverageFacetSummaryDto = {
  section?: string | null;
  label?: string | null;
  sourceRecordType?: string | null;
  sourceRecordId?: string | number | null;
  defendedFacets?: string[] | null;
  weakFacets?: string[] | null;
  skippedFacets?: string[] | null;
  unaskedFacets?: string[] | null;
};

export type InterviewSessionCoverageResponseDto = {
  sessionId?: string | number | null;
  interviewMode?: string | null;
  overallCoveragePercent?: number | null;
  defendedCoveragePercent?: number | null;
  weakFacetSummaries?: InterviewSessionCoverageFacetSummaryDto[] | null;
  skippedFacetSummaries?: InterviewSessionCoverageFacetSummaryDto[] | null;
  facetSummaries?: InterviewSessionCoverageFacetSummaryDto[] | null;
  evidenceItems?: InterviewSessionCoverageEvidenceItemDto[] | null;
};

export type InterviewSessionResumeMapQuestionDto = {
  sessionQuestionId?: string | number | null;
  title?: string | null;
  sourceType?: string | null;
  orderIndex?: number | null;
  status?: string | null;
  isFollowUp?: boolean | null;
};

export type InterviewSessionResumeMapEvidenceItemDto = {
  section?: string | null;
  label?: string | null;
  snippet?: string | null;
  facet?: string | null;
  sourceRecordType?: string | null;
  sourceRecordId?: string | number | null;
  displayOrder?: number | null;
  coverageStatus?: string | null;
  primaryQuestionCount?: number | null;
  followUpQuestionCount?: number | null;
  relatedQuestions?: InterviewSessionResumeMapQuestionDto[] | null;
};

export type InterviewSessionResumeMapResponseDto = {
  sessionId?: string | number | null;
  resumeVersionId?: string | number | null;
  weakFacetSummaries?: InterviewSessionCoverageFacetSummaryDto[] | null;
  skippedFacetSummaries?: InterviewSessionCoverageFacetSummaryDto[] | null;
  facetSummaries?: InterviewSessionCoverageFacetSummaryDto[] | null;
  evidenceItems?: InterviewSessionResumeMapEvidenceItemDto[] | null;
};
