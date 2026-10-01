import type { useInterviewRecordDetailQuery } from "../../../features/practical-interview/api/useInterviewRecordDetailQuery";
import type { useInterviewRecordQuestionsQuery } from "../../../features/practical-interview/api/useInterviewRecordQuestionsQuery";
import type { useInterviewRecordReviewQuery } from "../../../features/practical-interview/api/useInterviewRecordReviewQuery";
import type { useInterviewRecordTranscriptQuery } from "../../../features/practical-interview/api/useInterviewRecordTranscriptQuery";
import { routeConfig } from "../../../shared/config/routes";
import type { MessageKey, MessageParams } from "../../../shared/i18n";

export const REVIEW_TABS = ["question", "thread", "transcript"] as const;
export type ReviewTab = (typeof REVIEW_TABS)[number];

/** Which record route rendered the review workspace. */
export type ReviewRoute = "overview" | "transcript" | "question" | "simulate";

export type ReviewRecordDetail = NonNullable<ReturnType<typeof useInterviewRecordDetailQuery>["data"]>;
export type ReviewModel = NonNullable<ReturnType<typeof useInterviewRecordReviewQuery>["data"]>;
export type ReviewTranscript = NonNullable<ReturnType<typeof useInterviewRecordTranscriptQuery>["data"]>;
export type ReviewQuestions = NonNullable<ReturnType<typeof useInterviewRecordQuestionsQuery>["data"]>;
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

/** Questions are the default view; the transcript is for checking what was said. */
export function normalizeTab(value: string | null | undefined): ReviewTab {
  if (value === "transcript" || value === "thread") {
    return value;
  }

  return "question";
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
  Reviewed: "recordReview.payloadReviewed",
  Pending: "recordReview.payloadPending",
  Confirmed: "recordReview.payloadConfirmed",
  Completed: "recordReview.payloadCompleted",
  Failed: "recordReview.payloadFailed",
  warning: "recordReview.payloadWarning",
  high: "recordReview.payloadHigh",
  needs_review: "recordReview.payloadNeedsReview",
  ready: "recordReview.payloadReady",
  Question: "recordReview.payloadQuestion",
  Answer: "recordReview.payloadAnswer",
  Behavioral: "recordReview.payloadBehavioral",
  "Resume Linked": "recordReview.payloadResumeLinked",
  "Question lane": "recordReview.payloadQuestionLane",
  "Transcript lane": "recordReview.payloadTranscriptLane",
  "Thread lane": "recordReview.payloadThreadLane",
  "Review transcript lane": "recordReview.payloadReviewTranscriptLane",
  "Review structured questions": "recordReview.payloadReviewStructuredQuestions",
  "Transcript needs final review": "recordReview.payloadTranscriptNeedsFinalReview",
  "Check follow-up chains": "recordReview.payloadCheckFollowUpChains",
  "Question structure is the replay backbone.": "recordReview.payloadQuestionStructureBackbone",
  "Transcript issues affect all downstream structuring.": "recordReview.payloadTranscriptIssuesDownstream",
  "Thread quality affects realistic replay.": "recordReview.payloadThreadQualityReplay",
  "Original replay": "recordReview.payloadOriginalReplay",
  "Pressure variant": "recordReview.payloadPressureVariant",
  "Replay this interview": "recordReview.payloadReplayThisInterview",
  "Use the reviewed practical interview as a replay seed.": "recordReview.payloadReplaySeedDescription",
  "Start replay": "recordReview.payloadStartReplay",
  "Low confidence words detected.": "recordReview.payloadLowConfidenceWords",
  "Review segment 1": "recordReview.payloadReviewSegmentOne",
  ai_enriched: "recordReview.payloadAiEnriched",
  confirmed: "recordReview.payloadConfirmedSource",
  deep_dive: "recordReview.payloadDeepDive",
  Skeptical: "recordReview.payloadSkeptical",
  candidate: "recordReview.payloadCandidateLower",
  Candidate: "recordReview.payloadCandidate",
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

const QUESTION_TYPES: Record<string, MessageKey> = {
  behavioral: "recordReview.typeBehavioral",
  ownership: "recordReview.typeOwnership",
  storytelling: "recordReview.typeStorytelling",
  technical_deep_dive: "recordReview.typeTechnicalDeepDive",
  tradeoff: "recordReview.typeTradeoff",
  verification: "recordReview.typeVerification",
  project: "recordReview.typeProject",
  technical: "recordReview.typeTechnical",
  system_design: "recordReview.typeSystemDesign",
};


const RESUME_SECTIONS: Record<string, MessageKey> = {
  project: "recordReview.sectionProject",
  experience: "recordReview.sectionExperience",
  skill: "recordReview.sectionSkill",
  competency: "recordReview.sectionCompetency",
  summary: "recordReview.sectionSummary",
};

/** The question's kind, or null for follow-ups (they carry their own badge) and unknown codes. */
export function questionTypeLabel(code: string | null | undefined, t: ReviewTranslate) {
  const key = code ? QUESTION_TYPES[code] : undefined;
  return key ? t(key) : null;
}


export function resumeSectionLabel(section: string, t: ReviewTranslate) {
  const key = RESUME_SECTIONS[section];
  return key ? t(key) : section;
}

const THREAD_ACTIONS: Record<string, MessageKey> = {
  review_weak_chain: "recordReview.actionReviewWeakChain",
  replay_chain: "recordReview.actionReplayChain",
  stable_chain: "recordReview.actionStableChain",
};

/** The server's next step for a follow-up chain, in words; unknown codes are hidden. */
export function threadActionLabel(code: string | null | undefined, t: ReviewTranslate) {
  const key = code ? THREAD_ACTIONS[code] : undefined;
  return key ? t(key) : null;
}
