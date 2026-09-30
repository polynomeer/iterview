import type { useInterviewRecordAnalysisQuery } from "../../../features/practical-interview/api/useInterviewRecordAnalysisQuery";
import type { useInterviewRecordDetailQuery } from "../../../features/practical-interview/api/useInterviewRecordDetailQuery";
import type { useInterviewRecordQuestionsQuery } from "../../../features/practical-interview/api/useInterviewRecordQuestionsQuery";
import type { useInterviewRecordReviewQuery } from "../../../features/practical-interview/api/useInterviewRecordReviewQuery";
import type { useInterviewRecordTranscriptQuery } from "../../../features/practical-interview/api/useInterviewRecordTranscriptQuery";
import type { useInterviewerProfileQuery } from "../../../features/practical-interview/api/useInterviewerProfileQuery";
import { routeConfig } from "../../../shared/config/routes";

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

export function localizeReviewPayloadText(value: string | null | undefined, isKorean: boolean) {
  if (!value || !isKorean) {
    return value ?? "";
  }

  const normalized = value.trim();
  const dictionary: Record<string, string> = {
    Reviewed: "검토 완료",
    Pending: "대기 중",
    Confirmed: "확정됨",
    Completed: "완료",
    Failed: "실패",
    warning: "주의",
    high: "높음",
    needs_review: "검토 필요",
    ready: "준비됨",
    Question: "질문",
    Answer: "답변",
    Behavioral: "행동",
    "Resume Linked": "이력서 연결",
    "Question lane": "질문 레인",
    "Transcript lane": "전사 레인",
    "Thread lane": "스레드 레인",
    "Review transcript lane": "전사 레인 검토",
    "Review structured questions": "구조화 질문 검토",
    "Transcript needs final review": "전사 최종 검토 필요",
    "Check follow-up chains": "꼬리질문 체인 점검",
    "Question structure is the replay backbone.": "질문 구조는 리플레이의 뼈대입니다.",
    "Transcript issues affect all downstream structuring.": "전사 이슈는 이후의 모든 구조화에 영향을 줍니다.",
    "Thread quality affects realistic replay.": "스레드 품질은 현실적인 리플레이에 영향을 줍니다.",
    "Original replay": "원본 리플레이",
    "Pressure variant": "압박 변형",
    "Replay this interview": "이 면접 리플레이",
    "Use the reviewed practical interview as a replay seed.": "검토한 실전 면접을 리플레이 시드로 사용합니다.",
    "Start replay": "리플레이 시작",
    "Low confidence words detected.": "신뢰도가 낮은 단어가 감지되었습니다.",
    "Review segment 1": "1번 세그먼트 검토",
    ai_enriched: "AI 보강",
    confirmed: "확정본",
    deep_dive: "딥 다이브",
    Skeptical: "회의적",
    candidate: "지원자",
    Candidate: "지원자",
  };

  return dictionary[normalized] ?? value;
}

export function localizeReplayModeLabel(value: string | null | undefined, isKorean: boolean) {
  return localizeReviewPayloadText(value, isKorean);
}

/** Lane and replay-blocker signals shared by the overview and the brief. */
export function deriveReviewSignals(review: ReviewModel, isKorean: boolean) {
  const laneNeedsReviewTotal = review.laneItems.reduce(
    (count, lane) => count + lane.needsReviewCount,
    0,
  );
  const primaryReviewLane =
    [...review.laneItems].sort((left, right) => left.sortOrder - right.sortOrder)[0] ?? null;
  const replayBlockerCount = review.replayReadiness.blockerDetails.length;
  const reviewSignal =
    replayBlockerCount > 0
      ? isKorean
        ? "리플레이 차단 요인 정리"
        : "Clear replay blockers"
      : primaryReviewLane
        ? isKorean
          ? `${localizeReviewPayloadText(primaryReviewLane.badgeText, true)} 열기`
          : `Open ${primaryReviewLane.badgeText}`
        : isKorean
          ? "활성 레인 안정화"
          : "Stabilize active lane";

  return { laneNeedsReviewTotal, primaryReviewLane, replayBlockerCount, reviewSignal };
}
