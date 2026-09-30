import type { useInterviewRecordAnalysisQuery } from "../../../features/practical-interview/api/useInterviewRecordAnalysisQuery";
import type { useInterviewRecordDetailQuery } from "../../../features/practical-interview/api/useInterviewRecordDetailQuery";
import type { useInterviewRecordQuestionsQuery } from "../../../features/practical-interview/api/useInterviewRecordQuestionsQuery";
import type { useInterviewRecordReviewQuery } from "../../../features/practical-interview/api/useInterviewRecordReviewQuery";
import type { useInterviewRecordTranscriptQuery } from "../../../features/practical-interview/api/useInterviewRecordTranscriptQuery";
import type { useInterviewerProfileQuery } from "../../../features/practical-interview/api/useInterviewerProfileQuery";
import { routeConfig } from "../../../shared/config/routes";
import type { MessageKey, MessageParams } from "../../../shared/i18n";

export const REVIEW_TABS = ["transcript", "question", "thread"] as const;
export type ReviewTab = (typeof REVIEW_TABS)[number];

/** Which record route rendered the review workspace. */
export type ReviewRoute = "overview" | "transcript" | "question" | "simulate";

export type ReviewRecordDetail = NonNullable<ReturnType<typeof useInterviewRecordDetailQuery>["data"]>;
export type ReviewModel = NonNullable<ReturnType<typeof useInterviewRecordReviewQuery>["data"]>;
export type ReviewTranscript = NonNullable<ReturnType<typeof useInterviewRecordTranscriptQuery>["data"]>;
export type ReviewQuestions = NonNullable<ReturnType<typeof useInterviewRecordQuestionsQuery>["data"]>;
export type ReviewAnalysis = NonNullable<ReturnType<typeof useInterviewRecordAnalysisQuery>["data"]>;
export type ReviewInterviewerProfile = ReturnType<typeof useInterviewerProfileQuery>["data"];
export type ReplayPresetModel = ReviewModel["replayLaunchPreset"];
export type StructuredQuestion = ReviewQuestions["items"][number];

export type PlaybackRange = {
  startMs: number;
  endMs: number;
  durationMs: number;
  startTimestampLabel: string | null;
  endTimestampLabel: string | null;
};

export type PlayRange = (range: PlaybackRange | null | undefined, label: string) => Promise<void>;

export type SegmentDraftEdits = Record<
  string,
  { speakerType: string; cleanedText: string; confirmedText: string }
>;

export function normalizeTab(value: string | null | undefined): ReviewTab {
  if (value === "question" || value === "thread") {
    return value;
  }

  return "transcript";
}

export function mapLaneTab(target?: string | null, payload?: Record<string, string>) {
  const normalizedTarget = (target ?? "").toLowerCase();
  const payloadTab = normalizeTab(payload?.recommendedTab ?? payload?.tab);

  if (normalizedTarget.includes("question")) {
    return "question" as const;
  }

  if (normalizedTarget.includes("thread")) {
    return "thread" as const;
  }

  if (normalizedTarget.includes("transcript")) {
    return "transcript" as const;
  }

  return payloadTab;
}

export function buildHeatmapAnchorPath(params: {
  versionId: string | null;
  anchorType: string | null;
  anchorRecordId: string | null;
  isFollowUp?: boolean;
  weakOnly?: boolean;
}) {
  if (!params.versionId || !params.anchorType || !params.anchorRecordId) {
    return null;
  }

  const query = new URLSearchParams();
  query.set("selectedAnchor", `${params.anchorType}:${params.anchorRecordId}`);

  if (params.isFollowUp) {
    query.set("scope", "follow_up");
  }

  if (params.weakOnly) {
    query.set("weakOnly", "true");
  }

  return `${routeConfig.resumeHeatmap.buildPath({ versionId: params.versionId })}?${query.toString()}`;
}

export function formatDurationLabel(durationMs?: number | null) {
  if (durationMs === null || durationMs === undefined || durationMs <= 0) {
    return "0:00";
  }

  const totalSeconds = Math.floor(durationMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export function truncateText(value: string, maxLength = 120) {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength - 1)}…`;
}

export type ReviewTranslate = (key: MessageKey, params?: MessageParams) => string;

/** Fixed server payload labels that have a catalog translation, keyed by the raw payload value. */
const reviewPayloadMessageKeys: Record<string, MessageKey> = {
  Reviewed: "practicalReview.payloadReviewed",
  Pending: "practicalReview.payloadPending",
  Confirmed: "practicalReview.payloadConfirmed",
  Completed: "practicalReview.payloadCompleted",
  Failed: "practicalReview.payloadFailed",
  warning: "practicalReview.payloadWarning",
  high: "practicalReview.payloadHigh",
  needs_review: "practicalReview.payloadNeedsReview",
  ready: "practicalReview.payloadReady",
  Question: "practicalReview.payloadQuestion",
  Answer: "practicalReview.payloadAnswer",
  Behavioral: "practicalReview.payloadBehavioral",
  "Resume Linked": "practicalReview.payloadResumeLinked",
  "Question lane": "practicalReview.payloadQuestionLane",
  "Transcript lane": "practicalReview.payloadTranscriptLane",
  "Thread lane": "practicalReview.payloadThreadLane",
  "Review transcript lane": "practicalReview.payloadReviewTranscriptLane",
  "Review structured questions": "practicalReview.payloadReviewStructuredQuestions",
  "Transcript needs final review": "practicalReview.payloadTranscriptNeedsFinalReview",
  "Check follow-up chains": "practicalReview.payloadCheckFollowUpChains",
  "Question structure is the replay backbone.": "practicalReview.payloadQuestionStructureBackbone",
  "Transcript issues affect all downstream structuring.": "practicalReview.payloadTranscriptIssuesDownstream",
  "Thread quality affects realistic replay.": "practicalReview.payloadThreadQualityReplay",
  "Original replay": "practicalReview.payloadOriginalReplay",
  "Pressure variant": "practicalReview.payloadPressureVariant",
  "Replay this interview": "practicalReview.payloadReplayThisInterview",
  "Use the reviewed practical interview as a replay seed.": "practicalReview.payloadReplaySeedDescription",
  "Start replay": "practicalReview.payloadStartReplay",
  "Low confidence words detected.": "practicalReview.payloadLowConfidenceWords",
  "Review segment 1": "practicalReview.payloadReviewSegmentOne",
  ai_enriched: "practicalReview.payloadAiEnriched",
  confirmed: "practicalReview.payloadConfirmedSource",
  deep_dive: "practicalReview.payloadDeepDive",
  Skeptical: "practicalReview.payloadSkeptical",
  candidate: "practicalReview.payloadCandidateLower",
  Candidate: "practicalReview.payloadCandidate",
};

/** Translates a known server payload label; unknown values pass through unchanged. */
export function localizeReviewPayloadText(value: string | null | undefined, t: ReviewTranslate) {
  if (!value) {
    return value ?? "";
  }

  const messageKey = reviewPayloadMessageKeys[value.trim()];

  return messageKey ? t(messageKey) : value;
}

export function localizeReplayModeLabel(value: string | null | undefined, t: ReviewTranslate) {
  return localizeReviewPayloadText(value, t);
}

/** Lane and replay-blocker signals shared by the overview and the brief. */
export function deriveReviewSignals(review: ReviewModel, t: ReviewTranslate) {
  const laneNeedsReviewTotal = review.laneItems.reduce(
    (count, lane) => count + lane.needsReviewCount,
    0,
  );
  const primaryReviewLane =
    [...review.laneItems].sort((left, right) => left.sortOrder - right.sortOrder)[0] ?? null;
  const replayBlockerCount = review.replayReadiness.blockerDetails.length;
  const reviewSignal =
    replayBlockerCount > 0
      ? t("practicalReview.clearReplayBlockers")
      : primaryReviewLane
        ? t("practicalReview.openLane", {
            lane: localizeReviewPayloadText(primaryReviewLane.badgeText, t),
          })
        : t("practicalReview.stabilizeActiveLane");

  return { laneNeedsReviewTotal, primaryReviewLane, replayBlockerCount, reviewSignal };
}
