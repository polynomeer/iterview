import { toArray } from "../../shared/lib/collection";
import { formatApiDate, formatApiDateTime } from "../../shared/lib/date";
import type {
  InterviewRecordAnalysisDto,
  InterviewRecordDetailDto,
  InterviewRecordListItemDto,
  InterviewRecordPlaybackDto,
  InterviewRecordProvenanceComparisonSummaryDto,
  InterviewRecordQuestionsResponseDto,
  InterviewRecordReplayRangeDto,
  InterviewRecordReplayLaunchPresetDto,
  InterviewRecordReviewActionRecommendationsDto,
  InterviewRecordReviewDto,
  InterviewRecordReviewFollowUpThreadDto,
  InterviewRecordReviewLaneItemDto,
  InterviewRecordReviewQuestionSummaryDto,
  InterviewRecordTranscriptDto,
  InterviewRecordTranscriptSegmentActionDto,
  InterviewRecordTranscriptSegmentDto,
  InterviewRecordTranscriptIssueSummaryDto,
  InterviewRecordTimelineNavigationDto,
  InterviewerProfileDto,
} from "../../shared/types/practicalInterview";

function toId(value: string | number | null | undefined, fallback: string) {
  return value === null || value === undefined ? fallback : String(value);
}

function formatLabel(value?: string | null) {
  if (!value) {
    return "Unknown";
  }

  return value
    .split(/[_-\s]+/)
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ");
}

function sortBySortOrder<T extends { sortOrder?: number | null }>(items: T[]) {
  return [...items].sort((left, right) => (left.sortOrder ?? 999) - (right.sortOrder ?? 999));
}

function mapTargetPayload(payload?: Record<string, string> | null) {
  return payload ?? {};
}

function mapReplayLaunchPreset(
  preset?: InterviewRecordReplayLaunchPresetDto | null,
) {
  if (!preset) {
    return null;
  }

  return {
    sessionType: preset.sessionType ?? "replay_mock",
    sourceInterviewRecordId:
      preset.sourceInterviewRecordId === null || preset.sourceInterviewRecordId === undefined
        ? null
        : String(preset.sourceInterviewRecordId),
    replayMode: preset.replayMode ?? null,
    recommendedReplayModeLabel: preset.recommendedReplayModeLabel ?? null,
    recommendedQuestionCount: preset.recommendedQuestionCount ?? 0,
    seedQuestionIds: toArray(preset.seedQuestionIds).map((id) => String(id)),
    availableReplayModes: toArray(preset.availableReplayModes),
    availableReplayModeLabels: preset.availableReplayModeLabels ?? {},
    presetTitle: preset.presetTitle ?? "Replay interview",
    presetDescription: preset.presetDescription ?? "",
    launchButtonLabel: preset.launchButtonLabel ?? "Start replay",
  };
}

function mapReplayRange(range?: InterviewRecordReplayRangeDto | null) {
  if (!range) {
    return null;
  }

  return {
    startMs: range.startMs ?? 0,
    endMs: range.endMs ?? 0,
    durationMs: range.durationMs ?? Math.max(0, (range.endMs ?? 0) - (range.startMs ?? 0)),
    startTimestampLabel: range.startTimestampLabel ?? null,
    endTimestampLabel: range.endTimestampLabel ?? null,
  };
}

function mapPlayback(playback?: InterviewRecordPlaybackDto | null) {
  if (!playback) {
    return null;
  }

  return {
    playbackAvailable: playback.playbackAvailable ?? false,
    sourceAudioFileUrl: playback.sourceAudioFileUrl ?? null,
    sourceAudioFileName: playback.sourceAudioFileName ?? null,
    audioDurationMs: playback.audioDurationMs ?? null,
    sessionRange: mapReplayRange(playback.sessionRange),
  };
}

function mapBlockerDetail(
  detail:
    | {
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
      }
    | null
    | undefined,
  index: number,
) {
  return {
    id: detail?.code ?? `blocker-${index}`,
    code: detail?.code ?? "unknown",
    label: detail?.label ?? "Review blocker",
    description: detail?.description ?? "",
    severity: detail?.severity ?? "info",
    priority: detail?.priority ?? "normal",
    highlightVariant: detail?.highlightVariant ?? "neutral",
    sortOrder: detail?.sortOrder ?? index,
    recommendedAction: detail?.recommendedAction ?? null,
    recommendedActionLabel: detail?.recommendedActionLabel ?? null,
    recommendedActionTarget: detail?.recommendedActionTarget ?? null,
    recommendedActionTargetPayload: mapTargetPayload(detail?.recommendedActionTargetPayload),
  };
}

function mapLaneItem(
  key: "transcript" | "question" | "thread",
  item?: InterviewRecordReviewLaneItemDto | null,
) {
  return {
    key,
    sortOrder: item?.sortOrder ?? 999,
    highlightVariant: item?.highlightVariant ?? "neutral",
    badgeText: item?.badgeText ?? formatLabel(key),
    summaryText: item?.summaryText ?? "",
    recommendedTab: item?.recommendedTab ?? key,
    defaultExpanded: item?.defaultExpanded ?? false,
    analyticsKey: item?.analyticsKey ?? key,
    trackingContext: item?.trackingContext ?? {},
    helpText: item?.helpText ?? "",
    whyItMatters: item?.whyItMatters ?? "",
    accessibilityLabel: item?.accessibilityLabel ?? formatLabel(key),
    screenReaderSummary: item?.screenReaderSummary ?? "",
    totalCount: item?.totalCount ?? 0,
    readyCount: item?.readyCount ?? 0,
    needsReviewCount: item?.needsReviewCount ?? 0,
    readiness: item?.readiness ?? "unknown",
    severity: item?.severity ?? "info",
    highestPriority: item?.highestPriority ?? "normal",
    primaryAction: item?.primaryAction ?? null,
    primaryActionLabel: item?.primaryActionLabel ?? null,
    primaryActionTarget: item?.primaryActionTarget ?? null,
    primaryActionTargetPayload: mapTargetPayload(item?.primaryActionTargetPayload),
    secondaryAction: item?.secondaryAction ?? null,
    secondaryActionLabel: item?.secondaryActionLabel ?? null,
    secondaryActionTarget: item?.secondaryActionTarget ?? null,
    secondaryActionTargetPayload: mapTargetPayload(item?.secondaryActionTargetPayload),
    emptyStateMessage: item?.emptyStateMessage ?? null,
    emptyStateCtaAction: item?.emptyStateCtaAction ?? null,
    emptyStateCtaLabel: item?.emptyStateCtaLabel ?? null,
    emptyStateCtaTarget: item?.emptyStateCtaTarget ?? null,
    emptyStateCtaTargetPayload: mapTargetPayload(item?.emptyStateCtaTargetPayload),
    completionMessage: item?.completionMessage ?? null,
    completionCtaAction: item?.completionCtaAction ?? null,
    completionCtaLabel: item?.completionCtaLabel ?? null,
    completionCtaTarget: item?.completionCtaTarget ?? null,
    completionCtaTargetPayload: mapTargetPayload(item?.completionCtaTargetPayload),
    blockingReasons: toArray(item?.blockingReasons),
    blockerDetails: sortBySortOrder(
      toArray(item?.blockingReasonDetails).map(mapBlockerDetail),
    ),
  };
}

function mapTranscriptSegment(segment: InterviewRecordTranscriptSegmentDto, index: number) {
  const rawText = segment.rawText ?? "";
  const cleanedText = segment.cleanedText ?? "";
  const confirmedText = segment.confirmedText ?? "";

  return {
    id: toId(segment.id, `segment-${index}`),
    sequence: segment.sequence ?? index + 1,
    speakerType: segment.speakerType ?? "unknown",
    speakerLabel: formatLabel(segment.speakerType),
    startMs: segment.startMs ?? 0,
    endMs: segment.endMs ?? 0,
    timestampLabel: segment.timestampLabel ?? null,
    rawText,
    cleanedText,
    confirmedText,
    confidenceScore: segment.confidenceScore ?? null,
    confidenceLabel:
      segment.confidenceScore === null || segment.confidenceScore === undefined
        ? null
        : `${Math.round(segment.confidenceScore * 100)}%`,
    hasSpeakerOverride:
      Boolean(segment.speakerType) && segment.speakerType !== "unknown",
    hasTextOverride: Boolean(confirmedText) || (Boolean(cleanedText) && cleanedText !== rawText),
  };
}

function mapTranscriptAction(
  action: InterviewRecordTranscriptSegmentActionDto,
  index: number,
) {
  return {
    id: `segment-action-${action.sequence ?? index}`,
    sequence: action.sequence ?? index + 1,
    issueTypes: toArray(action.issueTypes),
    recommendedAction: action.recommendedAction ?? "",
    triageReason: action.triageReason ?? "",
    ctaLabel: action.ctaLabel ?? "Review",
    severity: action.severity ?? "info",
    priority: action.priority ?? "normal",
    reviewerLane: action.reviewerLane ?? "transcript",
    linkedQuestionId:
      action.linkedQuestionId === null || action.linkedQuestionId === undefined
        ? null
        : String(action.linkedQuestionId),
    threadRootQuestionId:
      action.threadRootQuestionId === null || action.threadRootQuestionId === undefined
        ? null
        : String(action.threadRootQuestionId),
    seekRange: mapReplayRange(action.seekRange),
    deepLink: action.deepLink
      ? {
          questionDetailQuestionId:
            action.deepLink.questionDetailQuestionId === null ||
            action.deepLink.questionDetailQuestionId === undefined
              ? null
              : String(action.deepLink.questionDetailQuestionId),
          archiveSourceType: action.deepLink.archiveSourceType ?? null,
          sourceInterviewRecordId:
            action.deepLink.sourceInterviewRecordId === null ||
            action.deepLink.sourceInterviewRecordId === undefined
              ? null
              : String(action.deepLink.sourceInterviewRecordId),
          sourceInterviewQuestionId:
            action.deepLink.sourceInterviewQuestionId === null ||
            action.deepLink.sourceInterviewQuestionId === undefined
              ? null
              : String(action.deepLink.sourceInterviewQuestionId),
          canStartReplayMock: action.deepLink.canStartReplayMock ?? false,
          replaySessionType: action.deepLink.replaySessionType ?? null,
        }
      : null,
    replayLaunchPreset: mapReplayLaunchPreset(action.replayLaunchPreset),
  };
}

function mapQuestionSummary(question: InterviewRecordReviewQuestionSummaryDto, index: number) {
  return {
    id: toId(question.questionId, `review-question-${index}`),
    linkedQuestionId:
      question.linkedQuestionId === null || question.linkedQuestionId === undefined
        ? null
        : String(question.linkedQuestionId),
    orderIndex: question.orderIndex ?? index,
    text: question.text ?? "Interview question",
    questionType: question.questionType ?? "general",
    questionTypeLabel: formatLabel(question.questionType),
    topicTags: toArray(question.topicTags),
    originType: question.originType ?? "general",
    originLabel: formatLabel(question.originType),
    derivedFromResumeSection: question.derivedFromResumeSection ?? null,
    derivedFromJobPostingSection: question.derivedFromJobPostingSection ?? null,
    isFollowUp: question.isFollowUp ?? false,
    parentQuestionId:
      question.parentQuestionId === null || question.parentQuestionId === undefined
        ? null
        : String(question.parentQuestionId),
    hasWeakAnswer: question.hasWeakAnswer ?? false,
    answerSummary: question.answerSummary ?? null,
    confidenceMarkers: toArray(question.confidenceMarkers),
    weaknessTags: toArray(question.weaknessTags),
    strengthTags: toArray(question.strengthTags),
    questionStructuringSource: question.questionStructuringSource ?? "deterministic",
    answerStructuringSource: question.answerStructuringSource ?? null,
    questionRange: mapReplayRange(question.questionRange),
    answerRange: mapReplayRange(question.answerRange),
    questionAnswerRange: mapReplayRange(question.questionAnswerRange),
    deepLink: question.deepLink
      ? {
          questionDetailQuestionId:
            question.deepLink.questionDetailQuestionId === null ||
            question.deepLink.questionDetailQuestionId === undefined
              ? null
              : String(question.deepLink.questionDetailQuestionId),
          archiveSourceType: question.deepLink.archiveSourceType ?? null,
          sourceInterviewRecordId:
            question.deepLink.sourceInterviewRecordId === null ||
            question.deepLink.sourceInterviewRecordId === undefined
              ? null
              : String(question.deepLink.sourceInterviewRecordId),
          sourceInterviewQuestionId:
            question.deepLink.sourceInterviewQuestionId === null ||
            question.deepLink.sourceInterviewQuestionId === undefined
              ? null
              : String(question.deepLink.sourceInterviewQuestionId),
          canStartReplayMock: question.deepLink.canStartReplayMock ?? false,
          replaySessionType: question.deepLink.replaySessionType ?? null,
        }
      : null,
  };
}

function mapFollowUpThread(thread: InterviewRecordReviewFollowUpThreadDto, index: number) {
  return {
    id: toId(thread.rootQuestionId, `thread-${index}`),
    rootLinkedQuestionId:
      thread.rootLinkedQuestionId === null || thread.rootLinkedQuestionId === undefined
        ? null
        : String(thread.rootLinkedQuestionId),
    rootOrderIndex: thread.rootOrderIndex ?? index,
    rootText: thread.rootText ?? "Question thread",
    questionIds: toArray(thread.questionIds).map((id) => String(id)),
    linkedQuestionIds: toArray(thread.linkedQuestionIds).map((id) => String(id)),
    followUpQuestionIds: toArray(thread.followUpQuestionIds).map((id) => String(id)),
    followUpCount: thread.followUpCount ?? 0,
    weakQuestionCount: thread.weakQuestionCount ?? 0,
    answeredQuestionCount: thread.answeredQuestionCount ?? 0,
    quantifiedQuestionCount: thread.quantifiedQuestionCount ?? 0,
    structuredQuestionCount: thread.structuredQuestionCount ?? 0,
    tradeoffAwareQuestionCount: thread.tradeoffAwareQuestionCount ?? 0,
    uncertainQuestionCount: thread.uncertainQuestionCount ?? 0,
    recommendedAction: thread.recommendedAction ?? "",
    threadRange: mapReplayRange(thread.threadRange),
    replayLaunchPreset: mapReplayLaunchPreset(thread.replayLaunchPreset),
    structuringSources: toArray(thread.structuringSources),
  };
}

function mapQuestionTypeCounts(summary?: Record<string, number> | null) {
  return Object.entries(summary ?? {}).map(([key, count]) => ({
    key,
    label: formatLabel(key),
    count,
  }));
}

function mapTimelineNavigation(summary?: InterviewRecordTimelineNavigationDto | null) {
  return toArray(summary?.items).map((item, index) => ({
    id: `timeline-${index}`,
    questionId:
      item.questionId === null || item.questionId === undefined ? null : String(item.questionId),
    orderIndex: item.orderIndex ?? index,
    parentQuestionId:
      item.parentQuestionId === null || item.parentQuestionId === undefined
        ? null
        : String(item.parentQuestionId),
    threadRootQuestionId:
      item.threadRootQuestionId === null || item.threadRootQuestionId === undefined
        ? null
        : String(item.threadRootQuestionId),
    questionSegmentStartSequence: item.questionSegmentStartSequence ?? null,
    questionSegmentEndSequence: item.questionSegmentEndSequence ?? null,
    answerSegmentStartSequence: item.answerSegmentStartSequence ?? null,
    answerSegmentEndSequence: item.answerSegmentEndSequence ?? null,
    questionRange: mapReplayRange(item.questionRange),
    answerRange: mapReplayRange(item.answerRange),
    questionAnswerRange: mapReplayRange(item.questionAnswerRange),
  }));
}

function mapProvenanceComparisonSummary(
  summary?: InterviewRecordProvenanceComparisonSummaryDto | null,
) {
  return {
    aiRefinementApplied: summary?.aiRefinementApplied ?? false,
    confirmedVersionAvailable: summary?.confirmedVersionAvailable ?? false,
    summaryChangedFromDeterministic: summary?.summaryChangedFromDeterministic ?? false,
    changedQuestionCountFromDeterministic: summary?.changedQuestionCountFromDeterministic ?? 0,
    changedAnswerCountFromDeterministic: summary?.changedAnswerCountFromDeterministic ?? 0,
    currentQuestionSource: summary?.currentQuestionSource ?? "deterministic",
    currentAnswerSource: summary?.currentAnswerSource ?? "deterministic",
    currentInterviewerProfileSource: summary?.currentInterviewerProfileSource ?? null,
  };
}

function mapActionRecommendations(
  recommendations?: InterviewRecordReviewActionRecommendationsDto | null,
) {
  return {
    primaryAction: recommendations?.primaryAction ?? null,
    primaryActionLabel: recommendations?.primaryActionLabel ?? null,
    primaryActionTarget: recommendations?.primaryActionTarget ?? null,
    primaryActionTargetPayload: mapTargetPayload(recommendations?.primaryActionTargetPayload),
    availableActions: toArray(recommendations?.availableActions),
    availableActionLabels: recommendations?.availableActionLabels ?? {},
    availableActionTargets: recommendations?.availableActionTargets ?? {},
    availableActionTargetPayloads: recommendations?.availableActionTargetPayloads ?? {},
    blockingReasons: toArray(recommendations?.blockingReasons),
    blockingReasonDetails: sortBySortOrder(
      toArray(recommendations?.blockingReasonDetails).map(mapBlockerDetail),
    ),
    canConfirm: recommendations?.canConfirm ?? false,
    canReplay: recommendations?.canReplay ?? false,
  };
}

function formatTranscriptErrorCode(value?: string | null) {
  switch (value) {
    case "transcription_not_configured":
      return "Automatic transcription is not configured";
    case "transcription_failed":
      return "Automatic transcription failed";
    case "empty_transcript":
      return "No transcript could be extracted";
    case "processing_timeout":
      return "Transcription timed out";
    default:
      return value ? formatLabel(value) : null;
  }
}

function getTranscriptStatusTone(status?: string | null) {
  switch (status) {
    case "confirmed":
      return "positive";
    case "failed":
      return "warning";
    case "processing":
      return "accent";
    case "pending":
      return "neutral";
    default:
      return "neutral";
  }
}

export function mapInterviewRecordListDtoToModel(response: InterviewRecordListItemDto[]) {
  return sortBySortOrder(
    toArray(response).map((record, index) => ({
      id: toId(record.id, `record-${index}`),
      companyName: record.companyName ?? null,
      roleName: record.roleName ?? null,
      title:
        [record.companyName, record.roleName].filter(Boolean).join(" · ") || "Imported interview",
      interviewDate: record.interviewDate ?? null,
      interviewDateLabel: formatApiDate(record.interviewDate),
      interviewType: record.interviewType ?? "general",
      interviewTypeLabel: formatLabel(record.interviewType),
      transcriptStatus: record.transcriptStatus ?? "unknown",
      transcriptStatusLabel: formatLabel(record.transcriptStatus),
      transcriptStatusTone: getTranscriptStatusTone(record.transcriptStatus),
      transcriptErrorCode: record.transcriptErrorCode ?? null,
      transcriptErrorLabel: formatTranscriptErrorCode(record.transcriptErrorCode),
      transcriptRetryCount: record.transcriptRetryCount ?? 0,
      transcriptNextRetryAt: record.transcriptNextRetryAt ?? null,
      transcriptNextRetryAtLabel: formatApiDateTime(record.transcriptNextRetryAt),
      isTranscriptRetrying:
        (record.transcriptStatus ?? "unknown") === "pending" ||
        (record.transcriptStatus ?? "unknown") === "processing",
      analysisStatus: record.analysisStatus ?? "unknown",
      analysisStatusLabel: formatLabel(record.analysisStatus),
      linkedResumeVersionId:
        record.linkedResumeVersionId === null || record.linkedResumeVersionId === undefined
          ? null
          : String(record.linkedResumeVersionId),
      interviewerProfileId:
        record.interviewerProfileId === null || record.interviewerProfileId === undefined
          ? null
          : String(record.interviewerProfileId),
      questionCount: record.questionCount ?? 0,
      createdAt: record.createdAt ?? null,
      createdAtLabel: formatApiDateTime(record.createdAt),
      sortOrder: -(new Date(record.createdAt ?? 0).getTime() || index),
    })),
  );
}

export function mapInterviewRecordDetailDtoToModel(dto: InterviewRecordDetailDto) {
  const transcriptStatus = dto.transcriptStatus ?? "unknown";
  const analysisStatus = dto.analysisStatus ?? "unknown";
  const transcriptErrorCode = dto.transcriptErrorCode ?? null;

  return {
    id: toId(dto.id, "record-detail"),
    companyName: dto.companyName ?? null,
    roleName: dto.roleName ?? null,
    title:
      [dto.companyName, dto.roleName].filter(Boolean).join(" · ") || "Imported interview",
    interviewDate: dto.interviewDate ?? null,
    interviewDateLabel: formatApiDate(dto.interviewDate),
    interviewType: dto.interviewType ?? "general",
    interviewTypeLabel: formatLabel(dto.interviewType),
    sourceAudioFileUrl: dto.sourceAudioFileUrl ?? null,
    sourceAudioFileName: dto.sourceAudioFileName ?? null,
    sourceAudioDurationMs: dto.sourceAudioDurationMs ?? null,
    transcriptStatus,
    analysisStatus,
    transcriptStatusLabel: formatLabel(transcriptStatus),
    transcriptStatusTone: getTranscriptStatusTone(transcriptStatus),
    analysisStatusLabel: formatLabel(analysisStatus),
    isTranscriptPending: transcriptStatus === "pending",
    isTranscriptProcessing: transcriptStatus === "processing",
    isTranscriptFailed: transcriptStatus === "failed",
    isTranscriptConfirmed: transcriptStatus === "confirmed",
    isAnalysisPending: analysisStatus === "pending",
    isAnalysisCompleted: analysisStatus === "completed",
    transcriptErrorCode,
    transcriptErrorLabel: formatTranscriptErrorCode(transcriptErrorCode),
    transcriptErrorMessage: dto.transcriptErrorMessage ?? null,
    transcriptRetryCount: dto.transcriptRetryCount ?? 0,
    transcriptLastAttemptAt: dto.transcriptLastAttemptAt ?? null,
    transcriptLastAttemptAtLabel: formatApiDateTime(dto.transcriptLastAttemptAt),
    transcriptProcessingStartedAt: dto.transcriptProcessingStartedAt ?? null,
    transcriptProcessingStartedAtLabel: formatApiDateTime(dto.transcriptProcessingStartedAt),
    transcriptNextRetryAt: dto.transcriptNextRetryAt ?? null,
    transcriptNextRetryAtLabel: formatApiDateTime(dto.transcriptNextRetryAt),
    canRetryTranscription:
      transcriptStatus !== "confirmed" && transcriptStatus !== "processing",
    linkedResumeVersionId:
      dto.linkedResumeVersionId === null || dto.linkedResumeVersionId === undefined
        ? null
        : String(dto.linkedResumeVersionId),
    linkedJobPostingId:
      dto.linkedJobPostingId === null || dto.linkedJobPostingId === undefined
        ? null
        : String(dto.linkedJobPostingId),
    interviewerProfileId:
      dto.interviewerProfileId === null || dto.interviewerProfileId === undefined
        ? null
        : String(dto.interviewerProfileId),
    deterministicSummary: dto.deterministicSummary ?? null,
    aiEnrichedSummary: dto.aiEnrichedSummary ?? null,
    overallSummary: dto.overallSummary ?? null,
    structuringStage: dto.structuringStage ?? "unknown",
    structuringStageLabel: formatLabel(dto.structuringStage),
    confirmedAt: dto.confirmedAt ?? null,
    confirmedAtLabel: formatApiDateTime(dto.confirmedAt),
    questionCount: dto.questionCount ?? 0,
    answerCount: dto.answerCount ?? 0,
    createdAtLabel: formatApiDateTime(dto.createdAt),
    updatedAtLabel: formatApiDateTime(dto.updatedAt),
  };
}

export function mapInterviewRecordTranscriptDtoToModel(dto: InterviewRecordTranscriptDto) {
  const transcriptErrorCode = dto.transcriptErrorCode ?? null;

  return {
    interviewRecordId: toId(dto.interviewRecordId, "record"),
    playback: mapPlayback(dto.playback),
    rawTranscript: dto.rawTranscript ?? null,
    cleanedTranscript: dto.cleanedTranscript ?? null,
    confirmedTranscript: dto.confirmedTranscript ?? null,
    transcriptStatus: dto.transcriptStatus ?? "unknown",
    transcriptStatusLabel: formatLabel(dto.transcriptStatus),
    transcriptStatusTone: getTranscriptStatusTone(dto.transcriptStatus),
    transcriptErrorCode,
    transcriptErrorLabel: formatTranscriptErrorCode(transcriptErrorCode),
    transcriptErrorMessage: dto.transcriptErrorMessage ?? null,
    transcriptRetryCount: dto.transcriptRetryCount ?? 0,
    transcriptLastAttemptAt: dto.transcriptLastAttemptAt ?? null,
    transcriptLastAttemptAtLabel: formatApiDateTime(dto.transcriptLastAttemptAt),
    transcriptNextRetryAt: dto.transcriptNextRetryAt ?? null,
    transcriptNextRetryAtLabel: formatApiDateTime(dto.transcriptNextRetryAt),
    segments: toArray(dto.segments).map(mapTranscriptSegment),
    updatedAtLabel: formatApiDateTime(dto.updatedAt),
  };
}

export function mapInterviewRecordQuestionsDtoToModel(dto: InterviewRecordQuestionsResponseDto) {
  return {
    interviewRecordId: toId(dto.interviewRecordId, "record"),
    playback: mapPlayback(dto.playback),
    items: toArray(dto.items)
      .map((item, index) => ({
        id: toId(item.id, `structured-question-${index}`),
        linkedQuestionId:
          item.linkedQuestionId === null || item.linkedQuestionId === undefined
            ? null
            : String(item.linkedQuestionId),
        text: item.text ?? "Interview question",
        normalizedText: item.normalizedText ?? null,
        questionType: item.questionType ?? "general",
        questionTypeLabel: formatLabel(item.questionType),
        topicTags: toArray(item.topicTags),
        intentTags: toArray(item.intentTags),
        derivedFromResumeSection: item.derivedFromResumeSection ?? null,
        derivedFromResumeRecordType: item.derivedFromResumeRecordType ?? null,
        derivedFromResumeRecordId:
          item.derivedFromResumeRecordId === null || item.derivedFromResumeRecordId === undefined
            ? null
            : String(item.derivedFromResumeRecordId),
        derivedFromJobPostingSection: item.derivedFromJobPostingSection ?? null,
        parentQuestionId:
          item.parentQuestionId === null || item.parentQuestionId === undefined
            ? null
            : String(item.parentQuestionId),
        structuringSource: item.structuringSource ?? "deterministic",
        orderIndex: item.orderIndex ?? index,
        questionRange: mapReplayRange(item.questionRange),
        answerRange: mapReplayRange(item.answerRange),
        questionAnswerRange: mapReplayRange(item.questionAnswerRange),
        answer: item.answer
          ? {
              id: toId(item.answer.id, `answer-${index}`),
              text: item.answer.text ?? "",
              normalizedText: item.answer.normalizedText ?? null,
              summary: item.answer.summary ?? null,
              confidenceMarkers: toArray(item.answer.confidenceMarkers),
              weaknessTags: toArray(item.answer.weaknessTags),
              strengthTags: toArray(item.answer.strengthTags),
              structuringSource: item.answer.structuringSource ?? "deterministic",
              orderIndex: item.answer.orderIndex ?? index,
              replayRange: mapReplayRange(item.answer.replayRange),
            }
          : null,
      }))
      .sort((left, right) => left.orderIndex - right.orderIndex),
  };
}

export function mapInterviewRecordAnalysisDtoToModel(dto: InterviewRecordAnalysisDto) {
  return {
    interviewRecordId: toId(dto.interviewRecordId, "record"),
    totalQuestions: dto.totalQuestions ?? 0,
    totalAnswers: dto.totalAnswers ?? 0,
    followUpCount: dto.followUpCount ?? 0,
    questionTypeDistribution: mapQuestionTypeCounts(dto.questionTypeDistribution),
    weakAnswerQuestionIds: toArray(dto.weakAnswerQuestionIds).map((id) => String(id)),
    topicTags: toArray(dto.topicTags),
    structuringStage: dto.structuringStage ?? "unknown",
    structuringStageLabel: formatLabel(dto.structuringStage),
    overallSummary: dto.overallSummary ?? null,
  };
}

export function mapInterviewerProfileDtoToModel(dto: InterviewerProfileDto) {
  return {
    id: toId(dto.id, "profile"),
    sourceInterviewRecordId: toId(dto.sourceInterviewRecordId, "record"),
    styleTags: toArray(dto.styleTags),
    toneProfile: dto.toneProfile ?? null,
    pressureLevel: dto.pressureLevel ?? null,
    depthPreference: dto.depthPreference ?? null,
    followUpPatterns: toArray(dto.followUpPatterns),
    favoriteTopics: toArray(dto.favoriteTopics),
    openingPattern: dto.openingPattern ?? null,
    closingPattern: dto.closingPattern ?? null,
    structuringSource: dto.structuringSource ?? "deterministic",
  };
}

export function mapInterviewRecordReviewDtoToModel(dto: InterviewRecordReviewDto) {
  const laneSummary = dto.reviewLaneSummary ?? {};
  const laneItems = sortBySortOrder([
    mapLaneItem("transcript", laneSummary.transcript),
    mapLaneItem("question", laneSummary.question),
    mapLaneItem("thread", laneSummary.thread),
  ]);
  const transcriptIssueSummary: InterviewRecordTranscriptIssueSummaryDto | null =
    dto.transcriptIssueSummary ?? null;

  return {
    interviewRecordId: toId(dto.interviewRecordId, "record"),
    playback: mapPlayback(dto.playback),
    structuringStage: dto.structuringStage ?? "unknown",
    structuringStageLabel: formatLabel(dto.structuringStage),
    requiresConfirmation: dto.requiresConfirmation ?? false,
    deterministicSummary: dto.deterministicSummary ?? null,
    aiEnrichedSummary: dto.aiEnrichedSummary ?? null,
    overallSummary: dto.overallSummary ?? null,
    confirmedAt: dto.confirmedAt ?? null,
    confirmedAtLabel: formatApiDateTime(dto.confirmedAt),
    totalSegmentCount: dto.totalSegmentCount ?? 0,
    editedSegmentCount: dto.editedSegmentCount ?? 0,
    totalQuestionCount: dto.totalQuestionCount ?? 0,
    changedQuestionCount: dto.changedQuestionCount ?? 0,
    weakAnswerCount: dto.weakAnswerCount ?? 0,
    followUpQuestionCount: dto.followUpQuestionCount ?? 0,
    questionSourceCounts: mapQuestionTypeCounts(dto.questionSourceCounts),
    answerSourceCounts: mapQuestionTypeCounts(dto.answerSourceCounts),
    interviewerProfileSource: dto.interviewerProfileSource ?? null,
    questionFilterSummary: {
      allQuestions: dto.questionFilterSummary?.allQuestions ?? 0,
      primaryQuestions: dto.questionFilterSummary?.primaryQuestions ?? 0,
      followUpQuestions: dto.questionFilterSummary?.followUpQuestions ?? 0,
      weakAnswerQuestions: dto.questionFilterSummary?.weakAnswerQuestions ?? 0,
      weakFollowUpQuestions: dto.questionFilterSummary?.weakFollowUpQuestions ?? 0,
      confirmedQuestions: dto.questionFilterSummary?.confirmedQuestions ?? 0,
    },
    questionDistributionSummary: {
      questionTypeCounts: mapQuestionTypeCounts(dto.questionDistributionSummary?.questionTypeCounts),
      topicTagCounts: mapQuestionTypeCounts(dto.questionDistributionSummary?.topicTagCounts),
    },
    questionOriginSummary: {
      resumeLinkedQuestions: dto.questionOriginSummary?.resumeLinkedQuestions ?? 0,
      jobPostingLinkedQuestions: dto.questionOriginSummary?.jobPostingLinkedQuestions ?? 0,
      hybridLinkedQuestions: dto.questionOriginSummary?.hybridLinkedQuestions ?? 0,
      generalQuestions: dto.questionOriginSummary?.generalQuestions ?? 0,
    },
    replayReadiness: {
      ready: dto.replayReadiness?.ready ?? false,
      replayableQuestionCount: dto.replayReadiness?.replayableQuestionCount ?? 0,
      linkedQuestionCount: dto.replayReadiness?.linkedQuestionCount ?? 0,
      unlinkedQuestionCount: dto.replayReadiness?.unlinkedQuestionCount ?? 0,
      followUpThreadCount: dto.replayReadiness?.followUpThreadCount ?? 0,
      hasInterviewerProfile: dto.replayReadiness?.hasInterviewerProfile ?? false,
      recommendedReplayMode: dto.replayReadiness?.recommendedReplayMode ?? null,
      recommendedReplayModeLabel: dto.replayReadiness?.recommendedReplayModeLabel ?? null,
      statusBadgeText: dto.replayReadiness?.statusBadgeText ?? "Unknown",
      statusVariant: dto.replayReadiness?.statusVariant ?? "neutral",
      statusSummary: dto.replayReadiness?.statusSummary ?? "",
      primaryCtaLabel: dto.replayReadiness?.primaryCtaLabel ?? "Start replay",
      blockedCtaLabel: dto.replayReadiness?.blockedCtaLabel ?? "Replay unavailable",
      blockers: toArray(dto.replayReadiness?.blockers),
      blockerDetails: sortBySortOrder(
        toArray(dto.replayReadiness?.blockerDetails).map(mapBlockerDetail),
      ),
    },
    laneItems,
    laneMap: {
      transcript: laneItems.find((item) => item.key === "transcript") ?? mapLaneItem("transcript"),
      question: laneItems.find((item) => item.key === "question") ?? mapLaneItem("question"),
      thread: laneItems.find((item) => item.key === "thread") ?? mapLaneItem("thread"),
    },
    transcriptIssueSummary: {
      lowConfidenceSegmentCount: transcriptIssueSummary?.lowConfidenceSegmentCount ?? 0,
      lowConfidenceSegmentSequences: toArray(
        transcriptIssueSummary?.lowConfidenceSegmentSequences,
      ),
      speakerOverrideSegmentCount: transcriptIssueSummary?.speakerOverrideSegmentCount ?? 0,
      speakerOverrideSegmentSequences: toArray(
        transcriptIssueSummary?.speakerOverrideSegmentSequences,
      ),
      confirmedTextOverrideCount: transcriptIssueSummary?.confirmedTextOverrideCount ?? 0,
      editedSegmentSequences: toArray(transcriptIssueSummary?.editedSegmentSequences),
      resolvedIssueCount: transcriptIssueSummary?.resolvedIssueCount ?? 0,
      unresolvedIssueCount: transcriptIssueSummary?.unresolvedIssueCount ?? 0,
      confirmationReadiness: transcriptIssueSummary?.confirmationReadiness ?? "unknown",
      reviewerLaneCounts: transcriptIssueSummary?.reviewerLaneCounts ?? {},
      topPrioritySegmentActions: toArray(transcriptIssueSummary?.topPrioritySegmentActions).map(
        mapTranscriptAction,
      ),
      segmentActions: toArray(transcriptIssueSummary?.segmentActions).map(mapTranscriptAction),
    },
    answerQualitySummary: {
      answeredQuestionCount: dto.answerQualitySummary?.answeredQuestionCount ?? 0,
      weakAnswerCount: dto.answerQualitySummary?.weakAnswerCount ?? 0,
      strengthTaggedAnswerCount: dto.answerQualitySummary?.strengthTaggedAnswerCount ?? 0,
      quantifiedAnswerCount: dto.answerQualitySummary?.quantifiedAnswerCount ?? 0,
      structuredAnswerCount: dto.answerQualitySummary?.structuredAnswerCount ?? 0,
      tradeoffAwareAnswerCount: dto.answerQualitySummary?.tradeoffAwareAnswerCount ?? 0,
      uncertainAnswerCount: dto.answerQualitySummary?.uncertainAnswerCount ?? 0,
      detailedAnswerCount: dto.answerQualitySummary?.detailedAnswerCount ?? 0,
    },
    timelineNavigation: mapTimelineNavigation(dto.timelineNavigation),
    actionRecommendations: mapActionRecommendations(dto.actionRecommendations),
    replayLaunchPreset: mapReplayLaunchPreset(dto.replayLaunchPreset),
    provenanceComparisonSummary: mapProvenanceComparisonSummary(
      dto.provenanceComparisonSummary,
    ),
    questionSummaries: toArray(dto.questionSummaries)
      .map(mapQuestionSummary)
      .sort((left, right) => left.orderIndex - right.orderIndex),
    followUpThreads: toArray(dto.followUpThreads)
      .map(mapFollowUpThread)
      .sort((left, right) => left.rootOrderIndex - right.rootOrderIndex),
  };
}
