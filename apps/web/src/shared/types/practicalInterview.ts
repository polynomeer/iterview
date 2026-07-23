export type CreateInterviewRecordRequestDto = FormData;

export type InterviewRecordReplayRangeDto = {
  startMs?: number | null;
  endMs?: number | null;
  durationMs?: number | null;
  startTimestampLabel?: string | null;
  endTimestampLabel?: string | null;
};

export type InterviewRecordPlaybackDto = {
  playbackAvailable?: boolean | null;
  sourceAudioFileUrl?: string | null;
  sourceAudioFileName?: string | null;
  audioDurationMs?: number | null;
  sessionRange?: InterviewRecordReplayRangeDto | null;
};

export type InterviewRecordListItemDto = {
  id?: string | number | null;
  companyName?: string | null;
  roleName?: string | null;
  interviewDate?: string | null;
  interviewType?: string | null;
  transcriptStatus?: string | null;
  transcriptErrorCode?: string | null;
  transcriptRetryCount?: number | null;
  transcriptNextRetryAt?: string | null;
  analysisStatus?: string | null;
  linkedResumeVersionId?: string | number | null;
  interviewerProfileId?: string | number | null;
  questionCount?: number | null;
  createdAt?: string | null;
};

export type InterviewRecordDetailDto = {
  id?: string | number | null;
  companyName?: string | null;
  roleName?: string | null;
  interviewDate?: string | null;
  interviewType?: string | null;
  sourceAudioFileUrl?: string | null;
  sourceAudioFileName?: string | null;
  sourceAudioDurationMs?: number | null;
  transcriptStatus?: string | null;
  transcriptErrorCode?: string | null;
  transcriptErrorMessage?: string | null;
  transcriptRetryCount?: number | null;
  transcriptLastAttemptAt?: string | null;
  transcriptProcessingStartedAt?: string | null;
  transcriptNextRetryAt?: string | null;
  analysisStatus?: string | null;
  linkedResumeVersionId?: string | number | null;
  linkedJobPostingId?: string | number | null;
  interviewerProfileId?: string | number | null;
  deterministicSummary?: string | null;
  aiEnrichedSummary?: string | null;
  overallSummary?: string | null;
  structuringStage?: string | null;
  confirmedAt?: string | null;
  questionCount?: number | null;
  answerCount?: number | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type InterviewRecordTranscriptSegmentDto = {
  id?: string | number | null;
  startMs?: number | null;
  endMs?: number | null;
  timestampLabel?: string | null;
  speakerType?: string | null;
  rawText?: string | null;
  cleanedText?: string | null;
  confirmedText?: string | null;
  confidenceScore?: number | null;
  sequence?: number | null;
};

export type InterviewRecordTranscriptDto = {
  interviewRecordId?: string | number | null;
  playback?: InterviewRecordPlaybackDto | null;
  rawTranscript?: string | null;
  cleanedTranscript?: string | null;
  confirmedTranscript?: string | null;
  transcriptStatus?: string | null;
  transcriptErrorCode?: string | null;
  transcriptErrorMessage?: string | null;
  transcriptRetryCount?: number | null;
  transcriptLastAttemptAt?: string | null;
  transcriptNextRetryAt?: string | null;
  segments?: InterviewRecordTranscriptSegmentDto[] | null;
  updatedAt?: string | null;
};

export type UpdateInterviewTranscriptSegmentRequestDto = {
  speakerType?: string | null;
  cleanedText?: string | null;
  confirmedText?: string | null;
};

export type BulkUpdateInterviewTranscriptSegmentsRequestDto = {
  edits?: Array<{
    segmentId?: string | number | null;
    speakerType?: string | null;
    cleanedText?: string | null;
    confirmedText?: string | null;
  }>;
  confirmAfterApply?: boolean | null;
};

export type InterviewRecordQuestionAnswerDto = {
  id?: string | number | null;
  text?: string | null;
  normalizedText?: string | null;
  summary?: string | null;
  confidenceMarkers?: string[] | null;
  weaknessTags?: string[] | null;
  strengthTags?: string[] | null;
  structuringSource?: string | null;
  orderIndex?: number | null;
  replayRange?: InterviewRecordReplayRangeDto | null;
};

export type InterviewRecordQuestionDto = {
  id?: string | number | null;
  linkedQuestionId?: string | number | null;
  text?: string | null;
  normalizedText?: string | null;
  questionType?: string | null;
  topicTags?: string[] | null;
  intentTags?: string[] | null;
  derivedFromResumeSection?: string | null;
  derivedFromResumeRecordType?: string | null;
  derivedFromResumeRecordId?: string | number | null;
  derivedFromJobPostingSection?: string | null;
  parentQuestionId?: string | number | null;
  structuringSource?: string | null;
  orderIndex?: number | null;
  questionRange?: InterviewRecordReplayRangeDto | null;
  answerRange?: InterviewRecordReplayRangeDto | null;
  questionAnswerRange?: InterviewRecordReplayRangeDto | null;
  answer?: InterviewRecordQuestionAnswerDto | null;
};

export type InterviewRecordQuestionsResponseDto = {
  interviewRecordId?: string | number | null;
  playback?: InterviewRecordPlaybackDto | null;
  items?: InterviewRecordQuestionDto[] | null;
};

export type InterviewRecordAnalysisDto = {
  interviewRecordId?: string | number | null;
  totalQuestions?: number | null;
  totalAnswers?: number | null;
  followUpCount?: number | null;
  questionTypeDistribution?: Record<string, number> | null;
  weakAnswerQuestionIds?: Array<string | number> | null;
  topicTags?: string[] | null;
  structuringStage?: string | null;
  overallSummary?: string | null;
};

export type InterviewerProfileDto = {
  id?: string | number | null;
  sourceInterviewRecordId?: string | number | null;
  styleTags?: string[] | null;
  toneProfile?: string | null;
  pressureLevel?: string | null;
  depthPreference?: string | null;
  followUpPatterns?: string[] | null;
  favoriteTopics?: string[] | null;
  openingPattern?: string | null;
  closingPattern?: string | null;
  structuringSource?: string | null;
};

export type InterviewRecordReviewQuestionDeepLinkDto = {
  questionDetailQuestionId?: string | number | null;
  archiveSourceType?: string | null;
  sourceInterviewRecordId?: string | number | null;
  sourceInterviewQuestionId?: string | number | null;
  canStartReplayMock?: boolean | null;
  replaySessionType?: string | null;
};

export type InterviewRecordReplayLaunchPresetDto = {
  sessionType?: string | null;
  sourceInterviewRecordId?: string | number | null;
  replayMode?: string | null;
  recommendedReplayModeLabel?: string | null;
  recommendedQuestionCount?: number | null;
  seedQuestionIds?: Array<string | number> | null;
  availableReplayModes?: string[] | null;
  availableReplayModeLabels?: Record<string, string> | null;
  presetTitle?: string | null;
  presetDescription?: string | null;
  launchButtonLabel?: string | null;
};

export type InterviewRecordReviewQuestionSummaryDto = {
  questionId?: string | number | null;
  linkedQuestionId?: string | number | null;
  deepLink?: InterviewRecordReviewQuestionDeepLinkDto | null;
  orderIndex?: number | null;
  text?: string | null;
  questionType?: string | null;
  topicTags?: string[] | null;
  originType?: string | null;
  derivedFromResumeSection?: string | null;
  derivedFromJobPostingSection?: string | null;
  isFollowUp?: boolean | null;
  parentQuestionId?: string | number | null;
  hasWeakAnswer?: boolean | null;
  answerSummary?: string | null;
  confidenceMarkers?: string[] | null;
  weaknessTags?: string[] | null;
  strengthTags?: string[] | null;
  questionStructuringSource?: string | null;
  answerStructuringSource?: string | null;
  questionRange?: InterviewRecordReplayRangeDto | null;
  answerRange?: InterviewRecordReplayRangeDto | null;
  questionAnswerRange?: InterviewRecordReplayRangeDto | null;
};

export type InterviewRecordReviewFollowUpThreadDto = {
  rootQuestionId?: string | number | null;
  rootLinkedQuestionId?: string | number | null;
  rootOrderIndex?: number | null;
  rootText?: string | null;
  questionIds?: Array<string | number> | null;
  linkedQuestionIds?: Array<string | number> | null;
  followUpQuestionIds?: Array<string | number> | null;
  followUpCount?: number | null;
  weakQuestionCount?: number | null;
  answeredQuestionCount?: number | null;
  quantifiedQuestionCount?: number | null;
  structuredQuestionCount?: number | null;
  tradeoffAwareQuestionCount?: number | null;
  uncertainQuestionCount?: number | null;
  recommendedAction?: string | null;
  threadRange?: InterviewRecordReplayRangeDto | null;
  replayLaunchPreset?: InterviewRecordReplayLaunchPresetDto | null;
  structuringSources?: string[] | null;
};

export type InterviewRecordReplayBlockerDetailDto = {
  code?: string | null;
  label?: string | null;
  description?: string | null;
  severity?: string | null;
  priority?: string | null;
  highlightVariant?: string | null;
  sortOrder?: number | null;
  recommendedAction?: string | null;
  recommendedActionLabel?: string | null;
  recommendedActionTarget?: string | null;
  recommendedActionTargetPayload?: Record<string, string> | null;
};

export type InterviewRecordReviewLaneBlockerDetailDto = InterviewRecordReplayBlockerDetailDto;
export type InterviewRecordReviewActionBlockerDetailDto = InterviewRecordReplayBlockerDetailDto;

export type InterviewRecordReviewQuestionFilterSummaryDto = {
  allQuestions?: number | null;
  primaryQuestions?: number | null;
  followUpQuestions?: number | null;
  weakAnswerQuestions?: number | null;
  weakFollowUpQuestions?: number | null;
  confirmedQuestions?: number | null;
};

export type InterviewRecordReviewQuestionDistributionSummaryDto = {
  questionTypeCounts?: Record<string, number> | null;
  topicTagCounts?: Record<string, number> | null;
};

export type InterviewRecordReviewQuestionOriginSummaryDto = {
  resumeLinkedQuestions?: number | null;
  jobPostingLinkedQuestions?: number | null;
  hybridLinkedQuestions?: number | null;
  generalQuestions?: number | null;
};

export type InterviewRecordReplayReadinessDto = {
  ready?: boolean | null;
  replayableQuestionCount?: number | null;
  linkedQuestionCount?: number | null;
  unlinkedQuestionCount?: number | null;
  followUpThreadCount?: number | null;
  hasInterviewerProfile?: boolean | null;
  recommendedReplayMode?: string | null;
  recommendedReplayModeLabel?: string | null;
  statusBadgeText?: string | null;
  statusVariant?: string | null;
  statusSummary?: string | null;
  primaryCtaLabel?: string | null;
  blockedCtaLabel?: string | null;
  blockers?: string[] | null;
  blockerDetails?: InterviewRecordReplayBlockerDetailDto[] | null;
};

export type InterviewRecordReviewLaneItemDto = {
  sortOrder?: number | null;
  highlightVariant?: string | null;
  badgeText?: string | null;
  summaryText?: string | null;
  recommendedTab?: string | null;
  defaultExpanded?: boolean | null;
  analyticsKey?: string | null;
  trackingContext?: Record<string, string> | null;
  helpText?: string | null;
  whyItMatters?: string | null;
  accessibilityLabel?: string | null;
  screenReaderSummary?: string | null;
  emptyStateCtaAction?: string | null;
  emptyStateCtaLabel?: string | null;
  emptyStateCtaTarget?: string | null;
  emptyStateCtaTargetPayload?: Record<string, string> | null;
  totalCount?: number | null;
  readyCount?: number | null;
  needsReviewCount?: number | null;
  readiness?: string | null;
  severity?: string | null;
  highestPriority?: string | null;
  primaryAction?: string | null;
  primaryActionLabel?: string | null;
  primaryActionTarget?: string | null;
  primaryActionTargetPayload?: Record<string, string> | null;
  secondaryAction?: string | null;
  secondaryActionLabel?: string | null;
  secondaryActionTarget?: string | null;
  secondaryActionTargetPayload?: Record<string, string> | null;
  emptyStateMessage?: string | null;
  completionCtaAction?: string | null;
  completionCtaLabel?: string | null;
  completionCtaTarget?: string | null;
  completionCtaTargetPayload?: Record<string, string> | null;
  completionMessage?: string | null;
  blockingReasons?: string[] | null;
  blockingReasonDetails?: InterviewRecordReviewLaneBlockerDetailDto[] | null;
};

export type InterviewRecordReviewLaneSummaryDto = {
  transcript?: InterviewRecordReviewLaneItemDto | null;
  question?: InterviewRecordReviewLaneItemDto | null;
  thread?: InterviewRecordReviewLaneItemDto | null;
};

export type InterviewRecordTranscriptSegmentActionDto = {
  sequence?: number | null;
  issueTypes?: string[] | null;
  recommendedAction?: string | null;
  triageReason?: string | null;
  ctaLabel?: string | null;
  severity?: string | null;
  priority?: string | null;
  reviewerLane?: string | null;
  linkedQuestionId?: string | number | null;
  threadRootQuestionId?: string | number | null;
  seekRange?: InterviewRecordReplayRangeDto | null;
  deepLink?: InterviewRecordReviewQuestionDeepLinkDto | null;
  replayLaunchPreset?: InterviewRecordReplayLaunchPresetDto | null;
};

export type InterviewRecordTranscriptIssueSummaryDto = {
  lowConfidenceSegmentCount?: number | null;
  lowConfidenceSegmentSequences?: number[] | null;
  speakerOverrideSegmentCount?: number | null;
  speakerOverrideSegmentSequences?: number[] | null;
  confirmedTextOverrideCount?: number | null;
  editedSegmentSequences?: number[] | null;
  resolvedIssueCount?: number | null;
  unresolvedIssueCount?: number | null;
  confirmationReadiness?: string | null;
  reviewerLaneCounts?: Record<string, number> | null;
  topPrioritySegmentActions?: InterviewRecordTranscriptSegmentActionDto[] | null;
  segmentActions?: InterviewRecordTranscriptSegmentActionDto[] | null;
};

export type InterviewRecordAnswerQualitySummaryDto = {
  answeredQuestionCount?: number | null;
  weakAnswerCount?: number | null;
  strengthTaggedAnswerCount?: number | null;
  quantifiedAnswerCount?: number | null;
  structuredAnswerCount?: number | null;
  tradeoffAwareAnswerCount?: number | null;
  uncertainAnswerCount?: number | null;
  detailedAnswerCount?: number | null;
};

export type InterviewRecordTimelineNavigationItemDto = {
  questionId?: string | number | null;
  orderIndex?: number | null;
  parentQuestionId?: string | number | null;
  threadRootQuestionId?: string | number | null;
  questionSegmentStartSequence?: number | null;
  questionSegmentEndSequence?: number | null;
  answerSegmentStartSequence?: number | null;
  answerSegmentEndSequence?: number | null;
  questionRange?: InterviewRecordReplayRangeDto | null;
  answerRange?: InterviewRecordReplayRangeDto | null;
  questionAnswerRange?: InterviewRecordReplayRangeDto | null;
};

export type InterviewRecordTimelineNavigationDto = {
  items?: InterviewRecordTimelineNavigationItemDto[] | null;
};

export type InterviewRecordReviewActionRecommendationsDto = {
  primaryAction?: string | null;
  primaryActionLabel?: string | null;
  primaryActionTarget?: string | null;
  primaryActionTargetPayload?: Record<string, string> | null;
  availableActions?: string[] | null;
  availableActionLabels?: Record<string, string> | null;
  availableActionTargets?: Record<string, string> | null;
  availableActionTargetPayloads?: Record<string, Record<string, string>> | null;
  blockingReasons?: string[] | null;
  blockingReasonDetails?: InterviewRecordReviewActionBlockerDetailDto[] | null;
  canConfirm?: boolean | null;
  canReplay?: boolean | null;
};

export type InterviewRecordProvenanceComparisonSummaryDto = {
  aiRefinementApplied?: boolean | null;
  confirmedVersionAvailable?: boolean | null;
  summaryChangedFromDeterministic?: boolean | null;
  changedQuestionCountFromDeterministic?: number | null;
  changedAnswerCountFromDeterministic?: number | null;
  currentQuestionSource?: string | null;
  currentAnswerSource?: string | null;
  currentInterviewerProfileSource?: string | null;
};

export type InterviewRecordReviewDto = {
  interviewRecordId?: string | number | null;
  playback?: InterviewRecordPlaybackDto | null;
  structuringStage?: string | null;
  requiresConfirmation?: boolean | null;
  deterministicSummary?: string | null;
  aiEnrichedSummary?: string | null;
  overallSummary?: string | null;
  confirmedAt?: string | null;
  totalSegmentCount?: number | null;
  editedSegmentCount?: number | null;
  totalQuestionCount?: number | null;
  changedQuestionCount?: number | null;
  weakAnswerCount?: number | null;
  followUpQuestionCount?: number | null;
  questionSourceCounts?: Record<string, number> | null;
  answerSourceCounts?: Record<string, number> | null;
  interviewerProfileSource?: string | null;
  questionFilterSummary?: InterviewRecordReviewQuestionFilterSummaryDto | null;
  questionDistributionSummary?: InterviewRecordReviewQuestionDistributionSummaryDto | null;
  questionOriginSummary?: InterviewRecordReviewQuestionOriginSummaryDto | null;
  replayReadiness?: InterviewRecordReplayReadinessDto | null;
  reviewLaneSummary?: InterviewRecordReviewLaneSummaryDto | null;
  transcriptIssueSummary?: InterviewRecordTranscriptIssueSummaryDto | null;
  answerQualitySummary?: InterviewRecordAnswerQualitySummaryDto | null;
  timelineNavigation?: InterviewRecordTimelineNavigationDto | null;
  actionRecommendations?: InterviewRecordReviewActionRecommendationsDto | null;
  replayLaunchPreset?: InterviewRecordReplayLaunchPresetDto | null;
  provenanceComparisonSummary?: InterviewRecordProvenanceComparisonSummaryDto | null;
  questionSummaries?: InterviewRecordReviewQuestionSummaryDto[] | null;
  followUpThreads?: InterviewRecordReviewFollowUpThreadDto[] | null;
};
