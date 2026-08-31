import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { Link, useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useCreateInterviewSessionMutation } from "../../features/interview/api/useCreateInterviewSessionMutation";
import { useConfirmInterviewRecordMutation } from "../../features/practical-interview/api/useConfirmInterviewRecordMutation";
import { useInterviewRecordAnalysisQuery } from "../../features/practical-interview/api/useInterviewRecordAnalysisQuery";
import { useInterviewRecordDetailQuery } from "../../features/practical-interview/api/useInterviewRecordDetailQuery";
import { useInterviewRecordQuestionsQuery } from "../../features/practical-interview/api/useInterviewRecordQuestionsQuery";
import { useRetryInterviewRecordTranscriptionMutation } from "../../features/practical-interview/api/useRetryInterviewRecordTranscriptionMutation";
import { useInterviewRecordReviewQuery } from "../../features/practical-interview/api/useInterviewRecordReviewQuery";
import { useInterviewRecordTranscriptQuery } from "../../features/practical-interview/api/useInterviewRecordTranscriptQuery";
import { useInterviewerProfileQuery } from "../../features/practical-interview/api/useInterviewerProfileQuery";
import { useUpdateInterviewReviewMutation } from "../../features/practical-interview/api/useUpdateInterviewReviewMutation";
import { useUpdateInterviewTranscriptSegmentMutation } from "../../features/practical-interview/api/useUpdateInterviewTranscriptSegmentMutation";
import { getErrorDetails } from "../../shared/api/errors";
import { routeConfig } from "../../shared/config/routes";
import { EmptyStateCard } from "../../shared/ui/EmptyStateCard";
import { ErrorStateCard } from "../../shared/ui/ErrorStateCard";
import { FeedbackNotice } from "../../shared/ui/FeedbackNotice";
import { LoadingStateCard } from "../../shared/ui/LoadingStateCard";
import { MetricCard } from "../../shared/ui/MetricCard";
import { PageContainer } from "../../shared/ui/PageContainer";
import { useLocale } from "../../shared/i18n";
import { SectionPanel } from "../../shared/ui/layout";

const REVIEW_TABS = ["transcript", "question", "thread"] as const;
type ReviewTab = (typeof REVIEW_TABS)[number];

type ReplayPresetModel = NonNullable<
  ReturnType<typeof useInterviewRecordReviewQuery>["data"]
>["replayLaunchPreset"];

function normalizeTab(value: string | null | undefined): ReviewTab {
  if (value === "question" || value === "thread") {
    return value;
  }

  return "transcript";
}

function mapLaneTab(target?: string | null, payload?: Record<string, string>) {
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

function buildHeatmapAnchorPath(params: {
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

function formatDurationLabel(durationMs?: number | null) {
  if (durationMs === null || durationMs === undefined || durationMs <= 0) {
    return "0:00";
  }

  const totalSeconds = Math.floor(durationMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function truncateText(value: string, maxLength = 120) {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength - 1)}…`;
}

function localizeReviewPayloadText(value: string | null | undefined, isKorean: boolean) {
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

function localizeReplayModeLabel(value: string | null | undefined, isKorean: boolean) {
  return localizeReviewPayloadText(value, isKorean);
}

function ReplayPlayer(props: {
  playback: {
    playbackAvailable: boolean;
    sourceAudioFileUrl: string | null;
    sourceAudioFileName: string | null;
    audioDurationMs: number | null;
  } | null;
  currentTimeMs: number;
  isPlaying: boolean;
  playbackRate: number;
  activeRangeLabel: string | null;
  transcriptTimeline: Array<{
    id: string;
    sequence: number;
    startMs: number;
    endMs: number;
    timestampLabel: string | null;
    speakerLabel: string;
    text: string;
  }>;
  chapters: Array<{
    id: string;
    label: string;
    startMs: number;
    endMs: number;
    timestampLabel: string | null;
    supportingText: string | null;
    isFollowUp: boolean;
  }>;
  audioRef: RefObject<HTMLAudioElement | null>;
  onTogglePlay: () => void;
  onSeekToMs: (ms: number) => void;
  onPlayRange: (range: { startMs: number; endMs: number; durationMs: number; startTimestampLabel: string | null; endTimestampLabel: string | null; }, label: string) => void;
  onPlaybackRateChange: (rate: number) => void;
}) {
  const { locale } = useLocale();
  const isKorean = locale === "ko";
  const [navigatorMode, setNavigatorMode] = useState<"timeline" | "chapters">("timeline");

  if (!props.playback?.playbackAvailable || !props.playback.sourceAudioFileUrl) {
    return null;
  }

  const durationMs = props.playback.audioDurationMs ?? 0;
  const progress = durationMs > 0 ? Math.min(100, (props.currentTimeMs / durationMs) * 100) : 0;
  const playerItems = navigatorMode === "timeline" ? props.transcriptTimeline : props.chapters;

  return (
    <section className="page-card practical-audio-player">
      <span className="page-card__label">{isKorean ? "오디오 리플레이" : "Audio replay"}</span>
      <div className="section-heading">
        <div>
          <h2 className="page-card__title">
            {props.playback.sourceAudioFileName ?? (isKorean ? "면접 녹음 파일" : "Interview recording")}
          </h2>
          <p className="page-card__body">
            {props.activeRangeLabel ??
              (isKorean
                ? "전사, 질문, 스레드 리플레이 동작으로 원하는 구간으로 바로 이동할 수 있습니다."
                : "Use transcript, question, or thread replay actions to jump to one clip.")}
          </p>
        </div>
        <div className="chip-list">
          <span className="detail-chip">
            {formatDurationLabel(props.currentTimeMs)} / {formatDurationLabel(durationMs)}
          </span>
        </div>
      </div>
      <audio preload="metadata" ref={props.audioRef} src={props.playback.sourceAudioFileUrl} />
      <div className="practical-audio-player__progress">
        <input
          aria-label={isKorean ? "리플레이 위치" : "Replay position"}
          className="practical-audio-player__scrubber"
          max={durationMs || 0}
          min={0}
          onChange={(event) => props.onSeekToMs(Number(event.target.value))}
          step={250}
          type="range"
          value={Math.min(props.currentTimeMs, durationMs || props.currentTimeMs)}
        />
        <div className="practical-audio-player__progress-bar">
          <span style={{ width: `${progress}%` }} />
        </div>
        <div className="practical-audio-player__progress-meta">
          <span>{formatDurationLabel(props.currentTimeMs)}</span>
          <span>{formatDurationLabel(durationMs)}</span>
        </div>
      </div>
      <div className="page-card__actions practical-audio-player__actions">
        <button className="primary-button practical-audio-player__button" onClick={props.onTogglePlay} type="button">
          {props.isPlaying ? (isKorean ? "일시정지" : "Pause") : isKorean ? "재생" : "Play"}
        </button>
        <button
          className="secondary-button practical-audio-player__button"
          onClick={() => props.onSeekToMs(props.currentTimeMs - 5000)}
          type="button"
        >
          -5s
        </button>
        <button
          className="secondary-button practical-audio-player__button"
          onClick={() => props.onSeekToMs(props.currentTimeMs + 5000)}
          type="button"
        >
          +5s
        </button>
        <select
          aria-label={isKorean ? "재생 속도" : "Playback rate"}
          className="form-input practical-audio-player__rate-input"
          onChange={(event) => props.onPlaybackRateChange(Number(event.target.value))}
          value={props.playbackRate}
        >
          {[0.75, 1, 1.25, 1.5, 2].map((rate) => (
            <option key={rate} value={rate}>
              {rate}x
            </option>
          ))}
        </select>
      </div>
      <div className="practical-audio-player__navigator">
        <div className="chip-list">
          <button
            className={navigatorMode === "timeline" ? "primary-button" : "secondary-button"}
            onClick={() => setNavigatorMode("timeline")}
            type="button"
          >
            {isKorean ? "타임라인" : "Timeline"}
          </button>
          <button
            className={navigatorMode === "chapters" ? "primary-button" : "secondary-button"}
            onClick={() => setNavigatorMode("chapters")}
            type="button"
          >
            {isKorean ? "챕터" : "Chapters"}
          </button>
        </div>
        <div className="stack-list practical-audio-player__navigator-list">
          {playerItems.length === 0 ? (
            <p className="page-card__body">
              {navigatorMode === "timeline"
                ? isKorean
                  ? "세그먼트 리플레이 데이터가 준비되면 전사 시점이 여기에 표시됩니다."
                  : "Transcript timestamps will appear here when segment replay data is available."
                : isKorean
                  ? "질문 리플레이 구간이 준비되면 질문 챕터가 여기에 표시됩니다."
                  : "Question chapters will appear here when question replay ranges are available."}
            </p>
          ) : null}
          {navigatorMode === "timeline"
            ? props.transcriptTimeline.map((segment) => {
                const isActive =
                  props.currentTimeMs >= segment.startMs && props.currentTimeMs <= segment.endMs;

                return (
                  <button
                    className={`list-item-card practical-audio-player__item ${
                      isActive ? "practical-audio-player__item--active" : ""
                    }`}
                    key={segment.id}
                    onClick={() =>
                      props.onPlayRange(
                        {
                          startMs: segment.startMs,
                          endMs: segment.endMs,
                          durationMs: Math.max(0, segment.endMs - segment.startMs),
                          startTimestampLabel: segment.timestampLabel,
                          endTimestampLabel: null,
                        },
                        isKorean ? `${segment.sequence}번 세그먼트` : `Segment ${segment.sequence}`,
                      )
                    }
                    type="button"
                  >
                    <div className="list-item-card__content">
                      <div className="list-item-card__meta">
                        <span>{segment.timestampLabel ?? formatDurationLabel(segment.startMs)}</span>
                        <span>{segment.speakerLabel}</span>
                      </div>
                      <h3 className="list-item-card__title">
                        {isKorean ? `${segment.sequence}번 세그먼트` : `Segment ${segment.sequence}`}
                      </h3>
                      <p className="list-item-card__body">{truncateText(segment.text)}</p>
                    </div>
                  </button>
                );
              })
            : props.chapters.map((chapter) => {
                const isActive =
                  props.currentTimeMs >= chapter.startMs && props.currentTimeMs <= chapter.endMs;

                return (
                  <button
                    className={`list-item-card practical-audio-player__item ${
                      isActive ? "practical-audio-player__item--active" : ""
                    }`}
                    key={chapter.id}
                    onClick={() =>
                      props.onPlayRange(
                        {
                          startMs: chapter.startMs,
                          endMs: chapter.endMs,
                          durationMs: Math.max(0, chapter.endMs - chapter.startMs),
                          startTimestampLabel: chapter.timestampLabel,
                          endTimestampLabel: null,
                        },
                        chapter.label,
                      )
                    }
                    type="button"
                  >
                    <div className="list-item-card__content">
                      <div className="list-item-card__meta">
                        <span>{chapter.timestampLabel ?? formatDurationLabel(chapter.startMs)}</span>
                        <span>{chapter.isFollowUp ? (isKorean ? "꼬리질문" : "Follow-up") : isKorean ? "메인" : "Main"}</span>
                      </div>
                      <h3 className="list-item-card__title">{chapter.label}</h3>
                      {chapter.supportingText ? (
                        <p className="list-item-card__body">{truncateText(chapter.supportingText)}</p>
                      ) : null}
                    </div>
                  </button>
                );
              })}
        </div>
      </div>
    </section>
  );
}

export function PracticalInterviewReviewPage() {
  const { locale } = useLocale();
  const isKorean = locale === "ko";
  const navigate = useNavigate();
  const location = useLocation();
  const { recordId, questionId } = useParams<{ recordId: string; questionId?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [draftEdits, setDraftEdits] = useState<
    Record<string, { speakerType: string; cleanedText: string; confirmedText: string }>
  >({});
  const [selectedSegmentSequence, setSelectedSegmentSequence] = useState<number | null>(null);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(questionId ?? null);
  const [selectedThreadRootQuestionId, setSelectedThreadRootQuestionId] = useState<string | null>(
    null,
  );
  const [activeQuestionFilter, setActiveQuestionFilter] = useState("all");
  const [selectedReplayMode, setSelectedReplayMode] = useState<string>("");
  const [selectedQuestionCount, setSelectedQuestionCount] = useState(5);
  const [replayPreset, setReplayPreset] = useState<ReplayPresetModel>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const activeRangeEndRef = useRef<number | null>(null);
  const [currentTimeMs, setCurrentTimeMs] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [activeReplayLabel, setActiveReplayLabel] = useState<string | null>(null);
  const detailQuery = useInterviewRecordDetailQuery(recordId);
  const isRecordReadyForReview = detailQuery.data?.isTranscriptConfirmed ?? false;
  const reviewQuery = useInterviewRecordReviewQuery(recordId, isRecordReadyForReview);
  const transcriptQuery = useInterviewRecordTranscriptQuery(recordId, isRecordReadyForReview);
  const questionsQuery = useInterviewRecordQuestionsQuery(recordId, isRecordReadyForReview);
  const analysisQuery = useInterviewRecordAnalysisQuery(recordId, isRecordReadyForReview);
  const interviewerProfileQuery = useInterviewerProfileQuery(recordId, isRecordReadyForReview);
  const structuredQuestionById = useMemo(
    () => new Map((questionsQuery.data?.items ?? []).map((item) => [item.id, item])),
    [questionsQuery.data?.items],
  );
  const updateSegmentMutation = useUpdateInterviewTranscriptSegmentMutation(recordId);
  const updateReviewMutation = useUpdateInterviewReviewMutation(recordId);
  const confirmMutation = useConfirmInterviewRecordMutation(recordId);
  const retryTranscriptionMutation = useRetryInterviewRecordTranscriptionMutation(recordId);
  const createReplayMutation = useCreateInterviewSessionMutation();
  const activeTab = useMemo(() => {
    if (location.pathname.endsWith("/transcript")) {
      return "transcript";
    }

    if (location.pathname.includes("/questions/")) {
      return "question";
    }

    return normalizeTab(searchParams.get("tab"));
  }, [location.pathname, searchParams]);

  useEffect(() => {
    if (questionId && searchParams.get("tab") !== "question") {
      setSelectedQuestionId(questionId);
      const next = new URLSearchParams(searchParams);
      next.set("tab", "question");
      setSearchParams(next, { replace: true });
    }
  }, [questionId, searchParams, setSearchParams]);

  useEffect(() => {
    if (location.pathname.endsWith("/simulate") && reviewQuery.data?.replayLaunchPreset) {
      setReplayPreset(reviewQuery.data.replayLaunchPreset);
    }
  }, [location.pathname, reviewQuery.data?.replayLaunchPreset]);

  useEffect(() => {
    if (replayPreset) {
      setSelectedReplayMode(
        replayPreset.replayMode ??
          replayPreset.availableReplayModes[0] ??
          "original_replay",
      );
      setSelectedQuestionCount(replayPreset.recommendedQuestionCount || 5);
    }
  }, [replayPreset]);

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio) {
      return undefined;
    }

    const handleTimeUpdate = () => {
      const nextTimeMs = audio.currentTime * 1000;
      setCurrentTimeMs(nextTimeMs);

      if (activeRangeEndRef.current !== null && nextTimeMs >= activeRangeEndRef.current) {
        audio.pause();
        setIsPlayingAudio(false);
      }
    };
    const handlePlay = () => setIsPlayingAudio(true);
    const handlePause = () => setIsPlayingAudio(false);

    audio.playbackRate = playbackRate;
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
    };
  }, [playbackRate]);

  useEffect(() => {
    const timelineNavigation = reviewQuery.data?.timelineNavigation ?? [];

    if (timelineNavigation.length === 0 || currentTimeMs <= 0) {
      return;
    }

    const activeTimelineItem = timelineNavigation.find((item) => {
      const start = item.questionRange?.startMs ?? item.questionAnswerRange?.startMs ?? item.answerRange?.startMs;
      const end = item.questionAnswerRange?.endMs ?? item.answerRange?.endMs ?? item.questionRange?.endMs;

      return start !== undefined && end !== undefined && currentTimeMs >= start && currentTimeMs <= end;
    });

    if (!activeTimelineItem) {
      return;
    }

    if (activeTimelineItem.questionId) {
      setSelectedQuestionId(activeTimelineItem.questionId);
    }

    if (activeTimelineItem.threadRootQuestionId) {
      setSelectedThreadRootQuestionId(activeTimelineItem.threadRootQuestionId);
    }

    const activeSequence =
      activeTimelineItem.questionSegmentStartSequence ??
      activeTimelineItem.answerSegmentStartSequence ??
      null;

    if (activeSequence) {
      setSelectedSegmentSequence(activeSequence);
    }
  }, [currentTimeMs, reviewQuery.data?.timelineNavigation]);

  const isLoading =
    detailQuery.isLoading ||
    (isRecordReadyForReview &&
      (reviewQuery.isLoading ||
        transcriptQuery.isLoading ||
        questionsQuery.isLoading ||
        analysisQuery.isLoading ||
        interviewerProfileQuery.isLoading));
  const hasError =
    detailQuery.isError ||
    (isRecordReadyForReview &&
      (reviewQuery.isError ||
        transcriptQuery.isError ||
        questionsQuery.isError ||
        analysisQuery.isError ||
        interviewerProfileQuery.isError));
  const transcriptTimeline = useMemo(
    () =>
      (transcriptQuery.data?.segments ?? [])
        .filter((segment) => segment.endMs > segment.startMs)
        .map((segment) => ({
          id: segment.id,
          sequence: segment.sequence,
          startMs: segment.startMs,
          endMs: segment.endMs,
          timestampLabel: segment.timestampLabel,
          speakerLabel: segment.speakerLabel,
          text: segment.confirmedText || segment.cleanedText || segment.rawText,
        })),
    [transcriptQuery.data?.segments],
  );
  const chapterItems = useMemo(
    () =>
      (reviewQuery.data?.questionSummaries ?? [])
        .map((question) => {
          const range = question.questionAnswerRange ?? question.answerRange ?? question.questionRange;

          if (!range) {
            return null;
          }

          return {
            id: question.id,
            label: `Q${question.orderIndex + 1}. ${question.text}`,
            startMs: range.startMs,
            endMs: range.endMs,
            timestampLabel: range.startTimestampLabel,
            supportingText: question.answerSummary,
            isFollowUp: question.isFollowUp,
          };
        })
        .filter((chapter): chapter is NonNullable<typeof chapter> => chapter !== null),
    [reviewQuery.data?.questionSummaries],
  );

  if (!recordId) {
    return (
      <PageContainer
        description={
          isKorean
            ? "리뷰 작업공간을 열기 전에 가져온 면접 기록을 먼저 선택하세요."
            : "Choose an imported interview record before opening the review workspace."
        }
        eyebrow={isKorean ? "실전 면접" : "Practical Interview"}
        title={isKorean ? "리뷰를 열 수 없습니다" : "Review unavailable"}
      >
        <EmptyStateCard
          action={{ label: isKorean ? "실전 면접 목록 열기" : "Open practical interviews", to: routeConfig.practicalInterviews.buildPath() }}
          body={isKorean ? "실전 면접 리뷰 경로에는 기록 식별자가 필요합니다." : "The practical interview review route needs a record id."}
          title={isKorean ? "면접 기록이 없습니다" : "Missing interview record"}
        />
      </PageContainer>
    );
  }

  if (isLoading) {
    return (
      <PageContainer
        description={
          isKorean
            ? "리뷰 셸, 전사, 질문 구조화, 리플레이 가이드를 불러오는 중입니다."
            : "Loading the review shell, transcript, question structuring, and replay guidance."
        }
        eyebrow={isKorean ? "실전 면접" : "Practical Interview"}
        title={isKorean ? "리뷰 작업공간 준비 중" : "Preparing review workspace"}
      >
        <LoadingStateCard
          body={
            isKorean
              ? "백엔드 리뷰 데이터 묶음과 연결된 실전 면접 데이터를 불러오는 중입니다."
              : "Loading the backend review payload and linked practical interview data."
          }
          title={isKorean ? "실전 면접 리뷰 준비 중" : "Preparing practical interview review"}
        />
      </PageContainer>
    );
  }

  if (hasError || !detailQuery.data || (isRecordReadyForReview && (!reviewQuery.data || !transcriptQuery.data || !questionsQuery.data || !analysisQuery.data))) {
    const error =
      detailQuery.error ??
      reviewQuery.error ??
      transcriptQuery.error ??
      questionsQuery.error ??
      analysisQuery.error ??
      interviewerProfileQuery.error;

    return (
      <PageContainer
        description={isKorean ? "실전 면접 리뷰를 불러오지 못했습니다." : "The practical interview review could not be loaded."}
        eyebrow={isKorean ? "실전 면접" : "Practical Interview"}
        title={isKorean ? "리뷰를 열 수 없습니다" : "Review unavailable"}
      >
        <ErrorStateCard
          body={error instanceof Error ? error.message : isKorean ? "실전 면접 리뷰를 불러오지 못했습니다." : "The practical interview review could not be loaded."}
          details={getErrorDetails(error)}
          onAction={() => {
            void Promise.all([
              detailQuery.refetch(),
              reviewQuery.refetch(),
              transcriptQuery.refetch(),
              questionsQuery.refetch(),
              analysisQuery.refetch(),
              interviewerProfileQuery.refetch(),
            ]);
          }}
          title={isKorean ? "실전 면접 리뷰를 불러올 수 없습니다" : "Unable to load practical interview review"}
        />
      </PageContainer>
    );
  }

  const detail = detailQuery.data;
  if (!detail.isTranscriptConfirmed) {
    const isProcessing = detail.isTranscriptPending || detail.isTranscriptProcessing;
    const canRetry = detail.isTranscriptFailed && detail.canRetryTranscription;

    return (
      <PageContainer
        description={
          isProcessing
            ? isKorean
              ? "업로드한 면접 기록은 생성되었고, 전사 추출 또는 구조화가 아직 진행 중입니다."
              : "The uploaded interview record was created successfully, and transcript extraction or structuring is still in progress."
            : isKorean
              ? "업로드는 성공했지만 전사 추출이 아직 끝나지 않았습니다."
              : "The upload succeeded, but transcript extraction did not complete yet."
        }
        eyebrow={isKorean ? "실전 면접" : "Practical Interview"}
        title={detail.title}
      >
        <div className="page-stack">
          <section className="page-card">
            <span className="page-card__label">{isKorean ? "처리 중" : "Processing"}</span>
            <h2 className="page-card__title">
              {detail.isTranscriptFailed
                ? isKorean
                  ? "전사 추출에 확인이 필요합니다"
                  : "Transcript extraction needs attention"
                : isKorean
                  ? "전사 추출 진행 중"
                  : "Transcript extraction in progress"}
            </h2>
            <p className="page-card__body">
              {detail.isTranscriptFailed
                ? detail.transcriptErrorMessage ??
                  detail.transcriptErrorLabel ??
                  (isKorean
                    ? "업로드는 성공했지만 서버가 아직 전사를 준비하지 못했습니다."
                    : "The upload succeeded, but the server could not prepare a transcript yet.")
                : isKorean
                  ? "업로드는 성공했습니다. 전사를 직접 붙여넣지 않았다면 서버가 오디오에서 전사를 추출하고 구조화 파이프라인을 진행하는 중입니다."
                  : "The upload succeeded. If you did not paste a transcript, the server is now trying to extract one from the audio and run the structuring pipeline."}
            </p>
            <div className="stats-grid">
              <MetricCard label={isKorean ? "전사" : "Transcript"} value={detail.transcriptStatusLabel} />
              <MetricCard label={isKorean ? "분석" : "Analysis"} tone="accent" value={detail.analysisStatusLabel} />
              <MetricCard label={isKorean ? "질문" : "Questions"} tone="muted" value={String(detail.questionCount)} />
              <MetricCard
                label={isKorean ? "재시도" : "Retries"}
                tone="muted"
                value={String(detail.transcriptRetryCount)}
              />
            </div>
            <div className="page-card__actions">
              <button
                className="primary-button"
                onClick={() => {
                  void detailQuery.refetch();
                }}
                type="button"
              >
                {isKorean ? "상태 새로고침" : "Refresh status"}
              </button>
              {canRetry ? (
                <button
                  className="secondary-button"
                  disabled={retryTranscriptionMutation.isPending}
                  onClick={() => {
                    void retryTranscriptionMutation.mutateAsync();
                  }}
                  type="button"
                >
                  {retryTranscriptionMutation.isPending
                    ? isKorean
                      ? "재시도 요청 중..."
                      : "Retrying..."
                    : isKorean
                      ? "전사 다시 시도"
                      : "Retry transcription"}
                </button>
              ) : null}
              <Link
                className="secondary-button"
                to={routeConfig.practicalInterviews.buildPath()}
              >
                {isKorean ? "실전 면접 목록으로" : "Back to practical interviews"}
              </Link>
            </div>
          </section>

          <FeedbackNotice
            message={
              detail.isTranscriptFailed
                ? isKorean
                  ? "전사 실패는 업로드 실패와 다릅니다. 가능하면 전사 재시도를 사용하고, 아니면 서버 재시도 시간이 지난 뒤 기록을 다시 여세요."
                  : "A failed transcript is not the same as a failed upload. Use retry transcription when available, or reopen the record after the server retry window."
                : isKorean
                  ? "전사 대기는 오류가 아닙니다. 처리가 끝난 뒤 이 기록을 다시 열면 리뷰 작업공간이 자동으로 나타납니다."
                  : "Pending transcript extraction is not an error. Re-open this record after processing completes and the review workspace will appear automatically."
            }
            tone={detail.isTranscriptFailed ? "error" : "info"}
          />

          {retryTranscriptionMutation.isError ? (
            <ErrorStateCard
              body={
                retryTranscriptionMutation.error instanceof Error
                  ? retryTranscriptionMutation.error.message
                  : isKorean
                    ? "전사 재시도 요청에 실패했습니다."
                    : "The transcript retry request failed."
              }
              details={getErrorDetails(retryTranscriptionMutation.error)}
              onAction={() => retryTranscriptionMutation.reset()}
              title={isKorean ? "전사를 다시 시도할 수 없습니다" : "Unable to retry transcription"}
            />
          ) : null}

          <section className="page-card">
            <span className="page-card__label">{isKorean ? "현재 상태" : "Current status"}</span>
            <h2 className="page-card__title">{isKorean ? "다음에 일어나는 일" : "What happens next"}</h2>
            <div className="stack-list">
              <article className="list-item-card">
                <div className="list-item-card__content">
                  <div className="list-item-card__meta">
                    <span>{isKorean ? "오디오" : "Audio"}</span>
                    {detail.sourceAudioFileName ? <span>{detail.sourceAudioFileName}</span> : null}
                  </div>
                  <h3 className="list-item-card__title">{isKorean ? "업로드한 원본이 보관되었습니다" : "Uploaded source is stored"}</h3>
                  <p className="list-item-card__body">
                    {detail.isTranscriptFailed
                      ? isKorean
                        ? "업로드한 오디오는 계속 보관됩니다. 파일을 다시 올리지 않아도 전사를 재시도할 수 있습니다."
                        : "The uploaded audio is still stored. You can retry transcription without re-uploading the file."
                      : isKorean
                        ? "전사가 확정되면 여기에서 전사, 질문 리뷰, 스레드 리뷰 영역을 사용할 수 있습니다."
                        : "Once the transcript is confirmed, the transcript, question review, and thread review lanes will become available here."}
                  </p>
                </div>
              </article>
              <article className="list-item-card">
                <div className="list-item-card__content">
                  <div className="list-item-card__meta">
                    <span>{isKorean ? "구조화 단계" : "Structuring stage"}</span>
                  </div>
                  <h3 className="list-item-card__title">{detail.structuringStageLabel}</h3>
                  <p className="list-item-card__body">
                    {detail.overallSummary ??
                      detail.aiEnrichedSummary ??
                      detail.deterministicSummary ??
                      (detail.isTranscriptFailed
                        ? isKorean
                          ? "백엔드가 전사 준비를 끝내지 못했습니다. 전사가 성공할 때까지 리뷰 데이터 묶음이 막혀 있습니다."
                          : "The backend did not finish transcript preparation. Review payloads will stay blocked until transcription succeeds."
                        : isKorean
                          ? "백엔드가 이 면접 기록 처리를 계속 진행하고, 준비가 되면 리뷰 데이터 묶음을 갱신합니다."
                          : "The backend will continue processing this interview record and update the review payload when ready.")}
                  </p>
                  <p className="list-item-card__body">
                    {detail.transcriptLastAttemptAtLabel
                      ? isKorean
                        ? `마지막 시도 ${detail.transcriptLastAttemptAtLabel}`
                        : `Last attempt ${detail.transcriptLastAttemptAtLabel}`
                      : detail.transcriptProcessingStartedAtLabel
                        ? isKorean
                          ? `처리 시작 ${detail.transcriptProcessingStartedAtLabel}`
                          : `Processing started ${detail.transcriptProcessingStartedAtLabel}`
                        : isKorean
                          ? "전사 워커가 아직 완료된 시도를 보고하지 않았습니다."
                          : "The transcript worker has not reported a completed attempt yet."}
                    {detail.transcriptNextRetryAtLabel
                      ? isKorean
                        ? ` 다음 재시도 ${detail.transcriptNextRetryAtLabel}.`
                        : ` Next retry ${detail.transcriptNextRetryAtLabel}.`
                      : ""}
                  </p>
                </div>
              </article>
            </div>
          </section>
        </div>
      </PageContainer>
    );
  }

  const review = reviewQuery.data!;
  const transcript = transcriptQuery.data!;
  const questions = questionsQuery.data!;
  const analysis = analysisQuery.data!;
  const interviewerProfile = interviewerProfileQuery.data;
  const dirtyEditCount = Object.keys(draftEdits).length;
  const selectedQuestionSummary =
    review.questionSummaries.find((item) => item.id === selectedQuestionId) ?? null;
  const selectedThread =
    review.followUpThreads.find((item) => item.id === selectedThreadRootQuestionId) ?? null;
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
  const playback = review.playback ?? transcript.playback ?? questions.playback ?? null;
  const activePlaybackSegmentSequence = useMemo(
    () =>
      transcript.segments.find(
        (segment) => currentTimeMs >= segment.startMs && currentTimeMs <= segment.endMs,
      )?.sequence ?? null,
    [currentTimeMs, transcript.segments],
  );

  function changeTab(tab: ReviewTab) {
    const next = new URLSearchParams(searchParams);
    next.set("tab", tab);
    setSearchParams(next, { replace: true });
  }

  function jumpToSegment(sequence: number | null) {
    if (!sequence) {
      return;
    }

    setSelectedSegmentSequence(sequence);
    changeTab("transcript");
    window.requestAnimationFrame(() => {
      document
        .getElementById(`practical-segment-${sequence}`)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }

  async function playRange(
    range:
      | {
          startMs: number;
          endMs: number;
          durationMs: number;
          startTimestampLabel: string | null;
          endTimestampLabel: string | null;
        }
      | null
      | undefined,
    label: string,
  ) {
    const audio = audioRef.current;

    if (!audio || !range) {
      return;
    }

    activeRangeEndRef.current = range.endMs;
    audio.currentTime = range.startMs / 1000;
    setCurrentTimeMs(range.startMs);
    setActiveReplayLabel(
      range.startTimestampLabel && range.endTimestampLabel
        ? `${label} · ${range.startTimestampLabel} - ${range.endTimestampLabel}`
        : label,
    );

    try {
      await audio.play();
    } catch {
      setIsPlayingAudio(false);
    }
  }

  function seekToMs(ms: number) {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    const nextMs = Math.max(0, ms);
    activeRangeEndRef.current = null;
    setActiveReplayLabel(null);
    audio.currentTime = nextMs / 1000;
    setCurrentTimeMs(nextMs);
  }

  function toggleAudioPlayback() {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    if (audio.paused) {
      void audio.play();
      return;
    }

    audio.pause();
  }

  function jumpToQuestion(targetQuestionId: string | null) {
    if (!targetQuestionId) {
      return;
    }

    setSelectedQuestionId(targetQuestionId);
    changeTab("question");
    window.requestAnimationFrame(() => {
      document
        .getElementById(`practical-question-${targetQuestionId}`)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }

  function jumpToThread(threadRootQuestionId: string | null) {
    if (!threadRootQuestionId) {
      return;
    }

    setSelectedThreadRootQuestionId(threadRootQuestionId);
    changeTab("thread");
    window.requestAnimationFrame(() => {
      document
        .getElementById(`practical-thread-${threadRootQuestionId}`)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }

  function openReplayLauncher(preset: ReplayPresetModel) {
    if (!preset) {
      return;
    }

    setReplayPreset(preset);
  }

  function focusQuestionWithPlayback(
    targetQuestionId: string | null,
    range:
      | {
          startMs: number;
          endMs: number;
          durationMs: number;
          startTimestampLabel: string | null;
          endTimestampLabel: string | null;
        }
      | null
      | undefined,
    label: string,
  ) {
    jumpToQuestion(targetQuestionId);
    void playRange(range, label);
  }

  function applyTarget(target?: string | null, payload?: Record<string, string>) {
    const targetTab = mapLaneTab(target, payload);
    changeTab(targetTab);

    if (payload?.sequence) {
      jumpToSegment(Number(payload.sequence));
    }

    if (payload?.segmentSequence) {
      jumpToSegment(Number(payload.segmentSequence));
    }

    if (payload?.questionId) {
      jumpToQuestion(payload.questionId);
    }

    if (payload?.sourceInterviewQuestionId) {
      jumpToQuestion(payload.sourceInterviewQuestionId);
    }

    if (payload?.threadRootQuestionId) {
      jumpToThread(payload.threadRootQuestionId);
    }

    if ((target ?? "").toLowerCase().includes("replay")) {
      openReplayLauncher(review.replayLaunchPreset);
    }
  }

  async function handleSaveSegment(segmentId: string) {
    const draft = draftEdits[segmentId];

    if (!draft) {
      return;
    }

    await updateSegmentMutation.mutateAsync({
      segmentId,
      payload: {
        speakerType: draft.speakerType || null,
        cleanedText: draft.cleanedText || null,
        confirmedText: draft.confirmedText || null,
      },
    });

    setDraftEdits((current) => {
      const next = { ...current };
      delete next[segmentId];
      return next;
    });
  }

  async function handleApplyBulkEdits(confirmAfterApply = false) {
    if (dirtyEditCount === 0) {
      return;
    }

    await updateReviewMutation.mutateAsync({
      edits: Object.entries(draftEdits).map(([segmentId, draft]) => ({
        segmentId,
        speakerType: draft.speakerType || null,
        cleanedText: draft.cleanedText || null,
        confirmedText: draft.confirmedText || null,
      })),
      confirmAfterApply,
    });

    setDraftEdits({});
  }

  async function handleConfirm() {
    if (dirtyEditCount > 0) {
      changeTab("transcript");
      return;
    }

    await confirmMutation.mutateAsync();
    await Promise.all([detailQuery.refetch(), reviewQuery.refetch()]);
  }

  async function handleStartReplay() {
    if (!replayPreset?.sourceInterviewRecordId) {
      return;
    }

    const session = await createReplayMutation.mutateAsync({
      sessionType:
        replayPreset.sessionType === "replay_mock" ? "replay_mock" : "replay_mock",
      sourceInterviewRecordId: replayPreset.sourceInterviewRecordId,
      replayMode: selectedReplayMode,
      questionCount: selectedQuestionCount,
      seedQuestionIds: replayPreset.seedQuestionIds,
    });

    if (session.id) {
      navigate(routeConfig.interviewSession.buildPath({ sessionId: String(session.id) }));
    }
  }

  const questionFilterOptions = [
    { id: "all", label: isKorean ? "전체" : "All", count: review.questionFilterSummary.allQuestions },
    { id: "primary", label: isKorean ? "메인" : "Primary", count: review.questionFilterSummary.primaryQuestions },
    { id: "follow-up", label: isKorean ? "꼬리질문" : "Follow-up", count: review.questionFilterSummary.followUpQuestions },
    { id: "weak", label: isKorean ? "약한 답변" : "Weak answers", count: review.questionFilterSummary.weakAnswerQuestions },
  ];

  const filteredQuestionSummaries = review.questionSummaries.filter((question) => {
    switch (activeQuestionFilter) {
      case "primary":
        return !question.isFollowUp;
      case "follow-up":
        return question.isFollowUp;
      case "weak":
        return question.hasWeakAnswer;
      default:
        return true;
    }
  });

  return (
    <PageContainer
      description={
        isKorean
          ? "가져온 면접 하나로 전사 실패, 질문 구조, 꼬리질문 스레드, 리플레이 차단 요인을 점검한 뒤 다음 재시도로 넘어가세요."
          : "Use one imported interview to inspect transcript failures, question structure, follow-up threads, and replay blockers before the next retry."
      }
      eyebrow={isKorean ? "복구 루프" : "Recovery loop"}
      title={detail.title}
    >
      <div className="page-stack practical-review-layout">
        <div className="practical-review-layout__hero">
          <section className="practical-review-workspace-surface practical-review-layout__overview">
            <div className="practical-review-workspace-surface__header">
              <div className="practical-review-workspace-surface__intro">
                <div className="practical-review-workspace-surface__eyebrow-row">
                  <p className="practical-review-workspace-surface__breadcrumbs">
                    <span>{isKorean ? "가져온 면접" : "Imported interview"}</span>
                    <span>/</span>
                    <span>{isKorean ? "복구 레인" : "Recovery lanes"}</span>
                    <span>/</span>
                    <span>{isKorean ? "리플레이 준비 상태" : "Replay readiness"}</span>
                  </p>
                <span className="detail-chip">{isKorean ? "리뷰 단계" : "Review stage"}</span>
                <span className="question-status-badge question-status-badge--accent">
                    {localizeReviewPayloadText(detail.structuringStageLabel, isKorean)}
                </span>
                </div>
                <span className="page-card__label">{isKorean ? "리뷰 개요" : "Review overview"}</span>
                <h2 className="practical-review-workspace-surface__title">
                  {review.overallSummary ?? detail.overallSummary ?? detail.title}
                </h2>
                <p className="practical-review-workspace-surface__body">
                  {detail.aiEnrichedSummary ??
                    detail.deterministicSummary ??
                    (isKorean
                      ? "아래 레인 대시보드를 사용해 전사 품질, 구조화 질문, 리플레이 준비 상태를 보완한 뒤 다음 시도를 진행하세요."
                      : "Use the lane dashboard below to repair transcript quality, structured questions, and replay readiness before another attempt.")}
                </p>
              </div>
              <div className="practical-review-workspace-surface__stats">
                <article className="practical-review-workspace-surface__stat">
                  <span>{isKorean ? "세그먼트" : "Segments"}</span>
                  <strong>{review.totalSegmentCount}</strong>
                </article>
                <article className="practical-review-workspace-surface__stat">
                  <span>{isKorean ? "질문" : "Questions"}</span>
                  <strong>{review.totalQuestionCount}</strong>
                </article>
                <article className="practical-review-workspace-surface__stat">
                  <span>{isKorean ? "리뷰 필요 레인" : "Lanes needing review"}</span>
                  <strong>{laneNeedsReviewTotal}</strong>
                </article>
                <article className="practical-review-workspace-surface__stat">
                  <span>{isKorean ? "약한 답변" : "Weak answers"}</span>
                  <strong>{review.weakAnswerCount}</strong>
                </article>
              </div>
            </div>
            <div className="practical-review-workspace-surface__chips">
              <span
                className={`question-status-badge ${
                  review.requiresConfirmation
                    ? "question-status-badge--warning"
                    : "question-status-badge--positive"
                }`}
              >
                {review.requiresConfirmation
                  ? isKorean
                    ? "확인 필요"
                    : "Confirmation required"
                  : isKorean
                    ? "확인 가능"
                    : "Ready to confirm"}
              </span>
              <span className="detail-chip">{isKorean ? `변경된 질문 ${review.changedQuestionCount}` : `Changed questions ${review.changedQuestionCount}`}</span>
              <span className="detail-chip">{isKorean ? `꼬리질문 ${review.followUpQuestionCount}` : `Follow-ups ${review.followUpQuestionCount}`}</span>
              {detail.confirmedAtLabel ? (
                <span className="question-status-badge question-status-badge--neutral">
                  {isKorean ? `확인됨 ${detail.confirmedAtLabel}` : `Confirmed ${detail.confirmedAtLabel}`}
                </span>
              ) : null}
            </div>
            <div className="practical-review-workspace-surface__guidance">
              <article className="practical-review-workspace-surface__guidance-card">
                <span>{isKorean ? "리뷰 원칙" : "Review rule"}</span>
                <strong>
                  {isKorean
                    ? "질문이나 스레드로 넓히기 전에 이후 해석 전체를 왜곡할 수 있는 레인을 먼저 안정화하세요."
                    : "Stabilize the lane that can distort all downstream interpretation before you broaden into questions or threads."}
                </strong>
              </article>
              <article className="practical-review-workspace-surface__guidance-card">
                <span>{isKorean ? "다음 복구" : "Next recovery"}</span>
                <strong>
                  {primaryReviewLane
                    ? isKorean
                      ? `${localizeReviewPayloadText(primaryReviewLane.badgeText, true)}을 먼저 복구하세요. 이유: ${localizeReviewPayloadText(primaryReviewLane.whyItMatters, true)}`
                      : `${primaryReviewLane.badgeText} is the first recovery surface because ${primaryReviewLane.whyItMatters.toLowerCase()}`
                    : isKorean
                      ? "가장 불안정한 레인을 먼저 열고, 그다음 리플레이 준비 상태를 확인하세요."
                      : "Open the most unstable lane first, then verify replay readiness."}
                </strong>
              </article>
              <article className="practical-review-workspace-surface__guidance-card">
                <span>{isKorean ? "이탈 조건" : "Exit rule"}</span>
                <strong>{isKorean ? "약한 답변 하나 또는 꼬리질문 체인 하나에 명확한 교정 경로가 생겼을 때만 이 리뷰를 벗어나세요." : "Leave this review only when one weak answer or follow-up chain has a clear correction path."}</strong>
              </article>
            </div>
            {(updateReviewMutation.isSuccess || confirmMutation.isSuccess) && (
              <FeedbackNotice
                message={
                  confirmMutation.isSuccess
                    ? isKorean
                      ? "실전 면접 리뷰를 확정했습니다."
                      : "The practical interview review was confirmed."
                    : isKorean
                      ? "전사 수정 사항이 실전 면접 리뷰에 반영되었습니다."
                      : "Transcript edits were applied to the practical interview review."
                }
                tone="success"
              />
            )}
            {(updateReviewMutation.isError || confirmMutation.isError || createReplayMutation.isError) && (
              <ErrorStateCard
                body={
                  updateReviewMutation.error instanceof Error
                    ? updateReviewMutation.error.message
                    : confirmMutation.error instanceof Error
                      ? confirmMutation.error.message
                      : createReplayMutation.error instanceof Error
                        ? createReplayMutation.error.message
                        : isKorean
                          ? "요청한 리뷰 동작에 실패했습니다."
                          : "The requested review action failed."
                }
                details={getErrorDetails(
                  updateReviewMutation.error ?? confirmMutation.error ?? createReplayMutation.error,
                )}
                title={isKorean ? "리뷰 동작을 완료할 수 없습니다" : "Unable to complete the review action"}
              />
            )}
            <div className="page-card__actions">
              <button
                className="primary-button"
                onClick={() =>
                  applyTarget(
                    review.actionRecommendations.primaryActionTarget,
                    review.actionRecommendations.primaryActionTargetPayload,
                  )
                }
                type="button"
              >
                {review.actionRecommendations.primaryActionLabel
                  ? localizeReviewPayloadText(review.actionRecommendations.primaryActionLabel, isKorean)
                  : isKorean
                    ? "리뷰 계속"
                    : "Continue review"}
              </button>
              <button
                className="secondary-button"
                disabled={
                  dirtyEditCount > 0 ||
                  !review.actionRecommendations.canConfirm ||
                  confirmMutation.isPending
                }
                onClick={() => {
                  void handleConfirm();
                }}
                type="button"
              >
                {confirmMutation.isPending ? (isKorean ? "확정 중..." : "Confirming...") : isKorean ? "리뷰 확정" : "Confirm review"}
              </button>
              {review.actionRecommendations.canReplay && review.replayLaunchPreset ? (
                <button
                  className="secondary-button"
                  onClick={() => openReplayLauncher(review.replayLaunchPreset)}
                  type="button"
                >
                  {localizeReviewPayloadText(review.replayLaunchPreset.launchButtonLabel, isKorean)}
                </button>
              ) : null}
            </div>
            {!review.actionRecommendations.canConfirm ? (
              <div className="stack-list">
                {review.actionRecommendations.blockingReasonDetails.map((detail) => (
                  <article className="list-item-card" key={detail.id}>
                    <div className="list-item-card__content">
                      <div className="list-item-card__meta">
                        <span>{localizeReviewPayloadText(detail.label, isKorean)}</span>
                        <span>{localizeReviewPayloadText(detail.severity, isKorean)}</span>
                      </div>
                      <p className="list-item-card__body">{detail.description}</p>
                    </div>
                  </article>
                ))}
              </div>
            ) : null}
          </section>

          <SectionPanel className="practical-review-insight-surface" variant="muted">
            <div className="practical-review-insight-surface__header">
              <div>
                <span className="page-card__label">{isKorean ? "리뷰 인사이트" : "Review insight"}</span>
                <h2 className="page-card__title">{isKorean ? "리뷰 범위를 넓히기 전에 리플레이와 질문 구조를 왜곡하는 레인을 먼저 해결하세요" : "Resolve the lane that distorts replay and question structure before widening the review"}</h2>
                <p className="page-card__body">
                  {isKorean
                    ? "이 레이어는 무엇을 먼저 안정화해야 하는지 알려줘야 합니다. 전사 정확도, 구조화 질문, 꼬리질문 스레드 무결성, 리플레이 준비 상태 중 무엇이 먼저인지 결정한 뒤 아래 작업을 전술적으로 진행하세요."
                    : "This layer should tell you what to stabilize first: transcript fidelity, structured questions, follow-up thread integrity, or replay readiness. Treat everything below as tactical work after that decision."}
                </p>
              </div>
              <span className="detail-chip detail-chip--accent">{reviewSignal}</span>
            </div>
            <div className="practical-review-insight-surface__stats">
              <article>
                <span>{isKorean ? "주요 레인" : "Primary lane"}</span>
                <strong>{primaryReviewLane ? localizeReviewPayloadText(primaryReviewLane.badgeText, isKorean) : isKorean ? "레인 없음" : "No lane"}</strong>
                <p>
                  {primaryReviewLane
                    ? isKorean
                      ? `이 레인에는 ${primaryReviewLane.needsReviewCount}개의 리뷰 대상이 있습니다.`
                      : `${primaryReviewLane.needsReviewCount} item${primaryReviewLane.needsReviewCount === 1 ? "" : "s"} need review in this lane.`
                    : isKorean
                      ? "서버가 우선순위를 준 레인이 없습니다."
                      : "No server-prioritized lane is available."}
                </p>
              </article>
              <article>
                <span>{isKorean ? "리플레이 상태" : "Replay state"}</span>
                <strong>{replayBlockerCount > 0 ? localizeReviewPayloadText(review.replayReadiness.statusBadgeText, isKorean) : isKorean ? "리플레이 가능" : "Replay clear"}</strong>
                <p>{replayBlockerCount > 0 ? (isKorean ? `${replayBlockerCount}개의 차단 요인이 아직 리플레이 시작을 막고 있습니다.` : `${replayBlockerCount} blocker${replayBlockerCount === 1 ? "" : "s"} still gate replay launch.`) : isKorean ? "선택한 레인이 안정화되면 리플레이를 시작할 수 있습니다." : "Replay can start once the selected lane is stable."}</p>
              </article>
              <article>
                <span>{isKorean ? "약한 답변 부하" : "Weak answer load"}</span>
                <strong>{review.weakAnswerCount}</strong>
                <p>{isKorean ? "복구 지향 리플레이나 스레드 점검이 더 필요한 답변 수입니다." : "answers that still need recovery-oriented replay or thread inspection"}</p>
              </article>
            </div>
            <div className="practical-review-insight-surface__lanes">
              <div className="practical-review-insight-surface__lane">
                <strong>{isKorean ? "해석 안정화" : "Stabilize interpretation"}</strong>
                <span>{isKorean ? "이후의 모든 질문과 스레드 해석을 불안정하게 만드는 레인을 먼저 고치세요." : "Fix the lane that can make every downstream question or thread read unreliable."}</span>
              </div>
              <div className="practical-review-insight-surface__lane">
                <strong>{isKorean ? "리플레이 가능성 재점검" : "Recheck replayability"}</strong>
                <span>{isKorean ? "리플레이 모의면접이나 스레드 기반 재시뮬레이션을 열기 전에 차단 요인을 제거하세요." : "Clear blockers before opening replay mock flows or thread-based re-simulation."}</span>
              </div>
              <div className="practical-review-insight-surface__lane">
                <strong>{isKorean ? "가장 약한 답변 복구" : "Recover the weakest answer"}</strong>
                <span>{isKorean ? "가장 약한 구조화 답변을 의도적인 재연습의 첫 목표로 삼으세요." : "Use the weakest structured answer as the first target for deliberate re-practice."}</span>
              </div>
            </div>
          </SectionPanel>

          <div className="practical-review-layout__hero-side">
            <SectionPanel className="workspace-note-card workspace-note-card--accent practical-review-layout__hero-note" variant="muted">
              <span className="page-card__label">{isKorean ? "분석 흐름" : "Analysis flow"}</span>
              <h2 className="page-card__title">{isKorean ? "상세 수정 위에 리플레이 컨텍스트와 레인 우선순위를 유지하세요" : "Keep replay context and lane priorities above the detailed edits"}</h2>
              <p className="page-card__body">
                {isKorean ? "전사 수정은 전술적 작업입니다. 준비 상태, 차단 요인, 출처, 실행 결정은 그 위의 안정적인 브리핑 레이어에 있어야 합니다." : "Transcript edits stay tactical. Readiness, blockers, provenance, and launch decisions belong in a stable briefing layer above them."}
              </p>
            </SectionPanel>

            <ReplayPlayer
              activeRangeLabel={activeReplayLabel}
              audioRef={audioRef}
              chapters={chapterItems}
              currentTimeMs={currentTimeMs}
              isPlaying={isPlayingAudio}
              onPlaybackRateChange={setPlaybackRate}
              onPlayRange={(range, label) => {
                void playRange(range, label);
              }}
              onSeekToMs={seekToMs}
              onTogglePlay={toggleAudioPlayback}
              playback={playback}
              playbackRate={playbackRate}
              transcriptTimeline={transcriptTimeline}
            />
          </div>
        </div>

        <section className="page-card practical-review-brief">
          <div className="section-heading">
            <div>
              <span className="page-card__label">{isKorean ? "리뷰 브리프" : "Review brief"}</span>
              <h2 className="page-card__title">{isKorean ? "전사 위에 리플레이 컨텍스트를 유지하세요" : "Keep replay context above the transcript"}</h2>
            </div>
            <p className="page-card__body practical-review-brief__summary">
              {isKorean ? "전사가 중심입니다. 나머지 리뷰가 면접 자체에 집중할 수 있도록 리플레이 준비 상태, 레인 우선순위, 출처, 보조 데이터 묶음을 여기서 함께 보여줍니다." : "Transcript stays primary. Replay readiness, lane priorities, provenance, and supporting payloads are grouped here so the rest of the review can focus on the interview itself."}
            </p>
          </div>
          <div className="practical-review-brief__summary-grid">
            <article className="practical-review-brief__summary-card">
              <span>{isKorean ? "먼저 열기" : "Open first"}</span>
              <strong>{primaryReviewLane ? localizeReviewPayloadText(primaryReviewLane.summaryText, isKorean) : isKorean ? "사용 가능한 레인 우선순위 없음" : "No lane priority available"}</strong>
            </article>
            <article className="practical-review-brief__summary-card">
              <span>{isKorean ? "리플레이 차단 요인" : "Replay blockers"}</span>
              <strong>
                {replayBlockerCount > 0
                  ? isKorean
                    ? `리플레이 전에 ${replayBlockerCount}개의 차단 요인을 정리해야 합니다.`
                    : `${replayBlockerCount} blocker${replayBlockerCount === 1 ? "" : "s"} should be cleared before replay.`
                  : isKorean
                    ? "활성 레인 리뷰가 안정화되면 리플레이를 시작할 수 있습니다."
                    : "Replay can start once the active lane review is stable."}
              </strong>
            </article>
            <article className="practical-review-brief__summary-card">
              <span>{isKorean ? "약한 답변 부하" : "Weak-answer load"}</span>
              <strong>{isKorean ? `${review.weakAnswerCount}개의 답변이 아직 복구 지향 점검이 필요합니다.` : `${review.weakAnswerCount} answers still need recovery-oriented inspection.`}</strong>
            </article>
          </div>
          <div className="practical-review-brief__grid">
            <section className="page-card page-card--inset practical-review-brief__card">
              <span className="page-card__label">{isKorean ? "리플레이 준비 상태" : "Replay readiness"}</span>
              <h3 className="page-card__title">{localizeReviewPayloadText(review.replayReadiness.statusBadgeText, isKorean)}</h3>
              <p className="page-card__body">{review.replayReadiness.statusSummary}</p>
              <div className="stats-grid">
                <MetricCard label={isKorean ? "리플레이 가능" : "Replayable"} value={String(review.replayReadiness.replayableQuestionCount)} />
                <MetricCard label={isKorean ? "연결됨" : "Linked"} value={String(review.replayReadiness.linkedQuestionCount)} />
                <MetricCard label={isKorean ? "스레드" : "Threads"} tone="accent" value={String(review.replayReadiness.followUpThreadCount)} />
              </div>
              {review.replayReadiness.blockerDetails.length > 0 ? (
                <div className="stack-list">
                  {review.replayReadiness.blockerDetails.slice(0, 2).map((blocker) => (
                    <article className="list-item-card practical-blocker-card" key={blocker.id}>
                      <div className="list-item-card__content">
                        <div className="list-item-card__meta">
                          <span>{localizeReviewPayloadText(blocker.label, isKorean)}</span>
                          <span>{localizeReviewPayloadText(blocker.severity, isKorean)}</span>
                        </div>
                        <p className="list-item-card__body">{blocker.description}</p>
                      </div>
                    </article>
                  ))}
                </div>
              ) : null}
            </section>

            <section className="page-card page-card--inset practical-review-brief__card">
              <span className="page-card__label">{isKorean ? "레인 우선순위" : "Lane priorities"}</span>
              <h3 className="page-card__title">{isKorean ? "서버 우선순위 레인" : "Server-prioritized lanes"}</h3>
              <div className="stack-list">
                {review.laneItems.map((lane) => (
                  <article
                    className={`list-item-card practical-lane-card practical-lane-card--${lane.highlightVariant}`}
                    key={lane.key}
                  >
                    <div className="list-item-card__content">
                      <div className="list-item-card__meta">
                        <span>{localizeReviewPayloadText(lane.badgeText, isKorean)}</span>
                        <span>{localizeReviewPayloadText(lane.readiness, isKorean)}</span>
                        <span>{isKorean ? `${lane.needsReviewCount}개 검토 필요` : `${lane.needsReviewCount} need review`}</span>
                      </div>
                      <h3 className="list-item-card__title">{localizeReviewPayloadText(lane.summaryText, isKorean)}</h3>
                      <p className="list-item-card__body">{localizeReviewPayloadText(lane.whyItMatters, isKorean)}</p>
                    </div>
                    <div className="list-item-card__actions">
                      {lane.primaryActionLabel ? (
                        <button
                          className="secondary-button"
                          onClick={() =>
                            applyTarget(lane.primaryActionTarget, lane.primaryActionTargetPayload)
                          }
                          type="button"
                        >
                          {localizeReviewPayloadText(lane.primaryActionLabel, isKorean)}
                        </button>
                      ) : null}
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section className="page-card page-card--inset practical-review-brief__card">
              <span className="page-card__label">{isKorean ? "출처" : "Provenance"}</span>
              <h3 className="page-card__title">{isKorean ? "규칙 생성 vs AI vs 확정본" : "Deterministic vs AI vs confirmed"}</h3>
              <div className="stack-list">
                <article className="list-item-card">
                  <div className="list-item-card__content">
                    <div className="list-item-card__meta">
                      <span>{isKorean ? "질문 출처" : "Question source"}</span>
                      <span>{localizeReviewPayloadText(review.provenanceComparisonSummary.currentQuestionSource, isKorean)}</span>
                    </div>
                    <p className="list-item-card__body">
                      {isKorean
                        ? `변경된 질문 ${review.provenanceComparisonSummary.changedQuestionCountFromDeterministic}`
                        : `Changed questions ${review.provenanceComparisonSummary.changedQuestionCountFromDeterministic}`}
                    </p>
                  </div>
                </article>
                <article className="list-item-card">
                  <div className="list-item-card__content">
                    <div className="list-item-card__meta">
                      <span>{isKorean ? "답변 출처" : "Answer source"}</span>
                      <span>{localizeReviewPayloadText(review.provenanceComparisonSummary.currentAnswerSource, isKorean)}</span>
                    </div>
                    <p className="list-item-card__body">
                      {isKorean
                        ? `변경된 답변 ${review.provenanceComparisonSummary.changedAnswerCountFromDeterministic}`
                        : `Changed answers ${review.provenanceComparisonSummary.changedAnswerCountFromDeterministic}`}
                    </p>
                  </div>
                </article>
              </div>
            </section>

            <section className="page-card page-card--inset practical-review-brief__card">
              <span className="page-card__label">{isKorean ? "보조 데이터 묶음" : "Supporting payloads"}</span>
              <h3 className="page-card__title">{isKorean ? "불러온 맥락" : "Loaded context"}</h3>
              <div className="stats-grid">
                <MetricCard label={isKorean ? "전사 행" : "Transcript rows"} value={String(transcript.segments.length)} />
                <MetricCard label={isKorean ? "구조화 질문" : "Structured questions"} value={String(questions.items.length)} />
                <MetricCard label={isKorean ? "주제" : "Topics"} tone="muted" value={String(analysis.topicTags.length)} />
                <MetricCard label={isKorean ? "면접관 프로필" : "Interviewer profile"} tone="accent" value={interviewerProfile ? (isKorean ? "준비됨" : "Ready") : isKorean ? "없음" : "Missing"} />
              </div>
              {interviewerProfile ? (
                <div className="chip-list">
                  {interviewerProfile.styleTags.map((tag) => (
                    <span className="detail-chip detail-chip--accent" key={tag}>
                      {localizeReviewPayloadText(tag, isKorean)}
                    </span>
                  ))}
                </div>
              ) : null}
            </section>
          </div>
        </section>

        {dirtyEditCount > 0 ? (
          <FeedbackNotice
            message={
              isKorean
                ? `저장하지 않은 전사 수정이 ${dirtyEditCount}개 있습니다. 리뷰를 확정하기 전에 적용하거나 정리하세요.`
                : `You have ${dirtyEditCount} unsaved transcript edit${dirtyEditCount > 1 ? "s" : ""}. Apply or clear them before confirming review.`
            }
            tone="info"
          />
        ) : null}

        <section className="page-card practical-review-tabs-card">
          <div className="section-heading">
            <div>
              <span className="page-card__label">{isKorean ? "레인 전환" : "Lane switcher"}</span>
              <h2 className="page-card__title">{isKorean ? "전사, 질문, 스레드 리뷰를 이동하며 점검하세요" : "Move through transcript, question, and thread review"}</h2>
            </div>
            <p className="page-card__body practical-review-tabs-card__summary">
              {isKorean ? "리플레이 컨텍스트와 선택된 근거를 유지한 채 현재 레인에만 집중하세요." : "Keep the active lane focused while preserving replay context and selected evidence."}
            </p>
          </div>
          <div className="page-card__actions practical-review-tabs-card__actions">
            {REVIEW_TABS.map((tab) => (
              <button
                className={activeTab === tab ? "primary-button" : "secondary-button"}
                key={tab}
                onClick={() => changeTab(tab)}
                type="button"
              >
                {tab === "transcript"
                  ? isKorean
                    ? "전사 리뷰"
                    : "Transcript review"
                  : tab === "question"
                    ? isKorean
                      ? "질문 리뷰"
                      : "Question review"
                    : isKorean
                      ? "스레드 리뷰"
                      : "Thread review"}
              </button>
            ))}
          </div>

          {activeTab === "transcript" ? (
            <div className="page-stack">
              <span className="page-card__label">{isKorean ? "전사" : "Transcript"}</span>
              <h2 className="page-card__title">{isKorean ? "전사 이슈와 세그먼트 수정" : "Transcript issues and segment edits"}</h2>
              <div className="stats-grid">
                <MetricCard label={isKorean ? "낮은 신뢰도" : "Low confidence"} value={String(review.transcriptIssueSummary.lowConfidenceSegmentCount)} />
                <MetricCard label={isKorean ? "화자 수정" : "Speaker overrides"} tone="muted" value={String(review.transcriptIssueSummary.speakerOverrideSegmentCount)} />
                <MetricCard label={isKorean ? "확정본 수정" : "Confirmed overrides"} tone="accent" value={String(review.transcriptIssueSummary.confirmedTextOverrideCount)} />
                <MetricCard label={isKorean ? "미해결" : "Unresolved"} tone="muted" value={String(review.transcriptIssueSummary.unresolvedIssueCount)} />
              </div>
              <div className="stack-list">
                {review.transcriptIssueSummary.topPrioritySegmentActions.map((action) => (
                  <button
                    className="list-item-card"
                    key={action.id}
                    onClick={() => {
                      jumpToSegment(action.sequence);
                      void playRange(action.seekRange, isKorean ? `${action.sequence}번 세그먼트` : `Segment ${action.sequence}`);
                      if (action.linkedQuestionId) {
                        setSelectedQuestionId(action.linkedQuestionId);
                      }
                      if (action.threadRootQuestionId) {
                        setSelectedThreadRootQuestionId(action.threadRootQuestionId);
                      }
                    }}
                    type="button"
                  >
                    <div className="list-item-card__content">
                      <div className="list-item-card__meta">
                        <span>{isKorean ? `${action.sequence}번 세그먼트` : `Segment ${action.sequence}`}</span>
                        <span>{localizeReviewPayloadText(action.severity, isKorean)}</span>
                        <span>{localizeReviewPayloadText(action.priority, isKorean)}</span>
                      </div>
                      <h3 className="list-item-card__title">{localizeReviewPayloadText(action.ctaLabel, isKorean)}</h3>
                      <p className="list-item-card__body">{localizeReviewPayloadText(action.triageReason, isKorean)}</p>
                    </div>
                  </button>
                ))}
              </div>
              <div className="page-card__actions">
                <button
                  className="secondary-button"
                  disabled={dirtyEditCount === 0 || updateReviewMutation.isPending}
                  onClick={() => {
                    void handleApplyBulkEdits(false);
                  }}
                  type="button"
                >
                  {updateReviewMutation.isPending ? (isKorean ? "적용 중..." : "Applying...") : isKorean ? "검토한 수정 적용" : "Apply reviewed edits"}
                </button>
              </div>
              <div className="stack-list">
                {transcript.segments.map((segment) => {
                  const draft = draftEdits[segment.id];
                  const cleanedText = draft?.cleanedText ?? segment.cleanedText;
                  const confirmedText = draft?.confirmedText ?? segment.confirmedText;
                  const speakerType = draft?.speakerType ?? segment.speakerType;
                  const isSelected = selectedSegmentSequence === segment.sequence;
                  const isPlaybackActive = activePlaybackSegmentSequence === segment.sequence;

                  return (
                    <article
                      aria-current={isPlaybackActive ? "true" : undefined}
                      className={`page-card page-card--inset practical-transcript-segment${isSelected ? " practical-transcript-segment--selected" : ""}${isPlaybackActive ? " practical-transcript-segment--active" : ""}`}
                      id={`practical-segment-${segment.sequence}`}
                      key={segment.id}
                    >
                      <div className="section-heading">
                        <div>
                          <p className="section-heading__eyebrow">
                            {isKorean ? `${segment.sequence}번 세그먼트` : `Segment ${segment.sequence}`}
                          </p>
                          <h3 className="page-card__title">
                            {localizeReviewPayloadText(segment.speakerLabel, isKorean)}
                            {segment.timestampLabel ? ` · ${segment.timestampLabel}` : ""}
                          </h3>
                        </div>
                        <div className="chip-list">
                          {isPlaybackActive ? (
                            <span className="detail-chip detail-chip--accent">{isKorean ? "현재 재생 중" : "Playing now"}</span>
                          ) : null}
                          {segment.confidenceLabel ? (
                            <span className="detail-chip">{segment.confidenceLabel}</span>
                          ) : null}
                          {segment.hasTextOverride ? (
                            <span className="detail-chip detail-chip--accent">{isKorean ? "수정됨" : "Edited"}</span>
                          ) : null}
                        </div>
                      </div>
                      {segment.rawText ? (
                        <div className="practical-transcript-segment__source">
                          <p className="practical-transcript-segment__source-label">
                            {isKorean ? "원본 전사" : "Original transcript"}
                          </p>
                          <p className="page-card__body practical-transcript-segment__source-body">
                            {segment.rawText}
                          </p>
                        </div>
                      ) : null}
                      <div className="form-grid">
                        <label className="form-field">
                          <span className="form-field__label">{isKorean ? "화자" : "Speaker"}</span>
                          <input
                            className="form-input"
                            onChange={(event) =>
                              setDraftEdits((current) => ({
                                ...current,
                                [segment.id]: {
                                  speakerType: event.target.value,
                                  cleanedText,
                                  confirmedText,
                                },
                              }))
                            }
                            type="text"
                            value={speakerType}
                          />
                        </label>
                        <label className="form-field practical-editor-field">
                          <span className="form-field__label">{isKorean ? "정리된 텍스트" : "Cleaned text"}</span>
                          <span className="practical-editor-field__helper">
                            {isKorean ? "명백한 음성 인식 잡음을 제거하되 화자의 의미는 유지하세요." : "Preserve the speaker meaning while removing obvious ASR noise."}
                          </span>
                          <textarea
                            className="form-input form-input--textarea"
                            onChange={(event) =>
                              setDraftEdits((current) => ({
                                ...current,
                                [segment.id]: {
                                  speakerType,
                                  cleanedText: event.target.value,
                                  confirmedText,
                                },
                              }))
                            }
                            rows={3}
                            value={cleanedText}
                          />
                        </label>
                        <label className="form-field practical-editor-field">
                          <span className="form-field__label">{isKorean ? "확정 텍스트" : "Confirmed text"}</span>
                          <span className="practical-editor-field__helper">
                            {isKorean ? "최종 검토 문구를 정리된 텍스트와 다르게 확정할 때만 사용하세요." : "Use only when you want the final reviewed wording to differ from cleaned text."}
                          </span>
                          <textarea
                            className="form-input form-input--textarea"
                            onChange={(event) =>
                              setDraftEdits((current) => ({
                                ...current,
                                [segment.id]: {
                                  speakerType,
                                  cleanedText,
                                  confirmedText: event.target.value,
                                },
                              }))
                            }
                            rows={3}
                            value={confirmedText}
                          />
                        </label>
                      </div>
                      <div className="page-card__actions">
                        <button
                          className="secondary-button"
                          disabled={!draft || updateSegmentMutation.isPending}
                          onClick={() => {
                            void handleSaveSegment(segment.id);
                          }}
                          type="button"
                        >
                          {isKorean ? "세그먼트 저장" : "Save segment"}
                        </button>
                        {review.timelineNavigation?.find(
                          (item) => item.questionSegmentStartSequence === segment.sequence,
                        )
                          ?.questionId ? (
                            <button
                              className="secondary-button"
                              onClick={() =>
                                jumpToQuestion(
                                  review.timelineNavigation?.find(
                                    (item) => item.questionSegmentStartSequence === segment.sequence,
                                  )?.questionId ?? null,
                                )
                              }
                              type="button"
                            >
                              {isKorean ? "질문으로 이동" : "Jump to question"}
                            </button>
                          ) : null}
                        <button
                          className="secondary-button"
                          onClick={() => {
                            void playRange(
                              {
                                startMs: segment.startMs,
                                endMs: segment.endMs,
                                durationMs: Math.max(0, segment.endMs - segment.startMs),
                                startTimestampLabel: segment.timestampLabel,
                                endTimestampLabel: null,
                              },
                              isKorean ? `${segment.sequence}번 세그먼트` : `Segment ${segment.sequence}`,
                            );
                          }}
                          type="button"
                        >
                          {isKorean ? "세그먼트 재생" : "Play segment"}
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          ) : null}

          {activeTab === "question" ? (
            <div className="page-stack">
              <span className="page-card__label">{isKorean ? "질문" : "Questions"}</span>
              <h2 className="page-card__title">{isKorean ? "질문 요약과 딥링크" : "Question summaries and deep links"}</h2>
              <div className="stats-grid">
                <MetricCard label={isKorean ? "이력서 연결" : "Resume-linked"} value={String(review.questionOriginSummary.resumeLinkedQuestions)} />
                <MetricCard label={isKorean ? "공고 연결" : "Job-posting linked"} tone="muted" value={String(review.questionOriginSummary.jobPostingLinkedQuestions)} />
                <MetricCard label={isKorean ? "혼합" : "Hybrid"} tone="accent" value={String(review.questionOriginSummary.hybridLinkedQuestions)} />
                <MetricCard label={isKorean ? "일반" : "General"} tone="muted" value={String(review.questionOriginSummary.generalQuestions)} />
              </div>
              <div className="page-card__actions">
                {questionFilterOptions.map((filter) => (
                  <button
                    className={activeQuestionFilter === filter.id ? "primary-button" : "secondary-button"}
                    key={filter.id}
                    onClick={() => setActiveQuestionFilter(filter.id)}
                    type="button"
                  >
                    {filter.label} ({filter.count})
                  </button>
                ))}
              </div>
              <div className="stack-list">
                {filteredQuestionSummaries.map((question) => {
                  const structuredQuestion = structuredQuestionById.get(question.id);
                  const heatmapAnchorPath = buildHeatmapAnchorPath({
                    versionId: detail.linkedResumeVersionId,
                    anchorType: structuredQuestion?.derivedFromResumeRecordType ?? null,
                    anchorRecordId: structuredQuestion?.derivedFromResumeRecordId ?? null,
                    isFollowUp: question.isFollowUp,
                    weakOnly: question.hasWeakAnswer,
                  });

                  return (
                  <article
                    className={`page-card page-card--inset practical-question-row${selectedQuestionId === question.id ? " practical-question-row--selected" : ""}`}
                    id={`practical-question-${question.id}`}
                    key={question.id}
                  >
                    <div className="section-heading">
                      <div>
                        <p className="section-heading__eyebrow">
                          #{question.orderIndex + 1} · {localizeReviewPayloadText(question.questionTypeLabel, isKorean)}
                        </p>
                        <h3 className="page-card__title">{question.text}</h3>
                      </div>
                      <div className="chip-list">
                        <span className="detail-chip">{localizeReviewPayloadText(question.originLabel, isKorean)}</span>
                        {question.isFollowUp ? (
                          <span className="detail-chip detail-chip--accent">{isKorean ? "꼬리질문" : "Follow-up"}</span>
                        ) : null}
                        {question.hasWeakAnswer ? (
                          <span className="detail-chip detail-chip--accent">{isKorean ? "약한 답변" : "Weak answer"}</span>
                        ) : null}
                      </div>
                    </div>
                    <div className="practical-review-meta">
                      {question.questionStructuringSource ? (
                        <div className="practical-review-meta__row">
                          <span className="practical-review-meta__label">{isKorean ? "질문 출처" : "Question source"}</span>
                          <span className="practical-review-meta__value">
                            {localizeReviewPayloadText(question.questionStructuringSource, isKorean)}
                          </span>
                        </div>
                      ) : null}
                      {question.answerStructuringSource ? (
                        <div className="practical-review-meta__row">
                          <span className="practical-review-meta__label">{isKorean ? "답변 출처" : "Answer source"}</span>
                          <span className="practical-review-meta__value">
                            {localizeReviewPayloadText(question.answerStructuringSource, isKorean)}
                          </span>
                        </div>
                      ) : null}
                      {question.derivedFromResumeSection ? (
                        <div className="practical-review-meta__row">
                          <span className="practical-review-meta__label">{isKorean ? "이력서 섹션" : "Resume section"}</span>
                          <span className="practical-review-meta__value">
                            {question.derivedFromResumeSection}
                          </span>
                        </div>
                      ) : null}
                      {question.derivedFromJobPostingSection ? (
                        <div className="practical-review-meta__row">
                          <span className="practical-review-meta__label">{isKorean ? "채용 공고 섹션" : "Job posting section"}</span>
                          <span className="practical-review-meta__value">
                            {question.derivedFromJobPostingSection}
                          </span>
                        </div>
                      ) : null}
                    </div>
                    {question.answerSummary ? <p className="page-card__body">{question.answerSummary}</p> : null}
                    <div className="chip-list">
                      {question.topicTags.map((tag) => (
                        <span className="detail-chip" key={tag}>
                          {tag}
                        </span>
                      ))}
                      {question.weaknessTags.map((tag) => (
                        <span className="detail-chip detail-chip--accent" key={tag}>
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className="page-card__actions">
                      {question.questionRange ? (
                        <button
                          className="secondary-button"
                          onClick={() =>
                            focusQuestionWithPlayback(question.id, question.questionRange, isKorean ? `${question.orderIndex + 1}번 질문` : `Question ${question.orderIndex + 1}`)
                          }
                          type="button"
                        >
                          {isKorean ? "질문 재생" : "Play question"}
                        </button>
                      ) : null}
                      {question.answerRange ? (
                        <button
                          className="secondary-button"
                          onClick={() =>
                            focusQuestionWithPlayback(question.id, question.answerRange, isKorean ? `${question.orderIndex + 1}번 답변` : `Answer ${question.orderIndex + 1}`)
                          }
                          type="button"
                        >
                          {isKorean ? "답변 재생" : "Play answer"}
                        </button>
                      ) : null}
                      {question.questionAnswerRange ? (
                        <button
                          className="secondary-button"
                          onClick={() =>
                            focusQuestionWithPlayback(question.id, question.questionAnswerRange, isKorean ? `${question.orderIndex + 1}번 문답` : `Q&A ${question.orderIndex + 1}`)
                          }
                          type="button"
                        >
                          {isKorean ? "문답 재생" : "Play Q&A"}
                        </button>
                      ) : null}
                      {question.linkedQuestionId ? (
                        <Link
                          className="secondary-button"
                          to={routeConfig.questionDetail.buildPath({
                            questionId: question.linkedQuestionId,
                          })}
                        >
                          {isKorean ? "질문 상세 열기" : "Open question detail"}
                        </Link>
                      ) : null}
                      {heatmapAnchorPath ? (
                        <Link className="secondary-button" to={heatmapAnchorPath}>
                          {isKorean ? "히트맵 앵커 열기" : "Open heatmap anchor"}
                        </Link>
                      ) : null}
                      {question.deepLink?.sourceInterviewQuestionId ? (
                        <Link
                          className="secondary-button"
                          to={`/archive?sourceInterviewRecordId=${recordId}&sourceInterviewQuestionId=${question.deepLink.sourceInterviewQuestionId}`}
                        >
                          {isKorean ? "아카이브 원본 열기" : "Open archive source"}
                        </Link>
                      ) : null}
                      {question.deepLink?.canStartReplayMock ? (
                        <button
                          className="secondary-button"
                          onClick={() =>
                            openReplayLauncher(
                              review.replayLaunchPreset
                                ? {
                                    ...review.replayLaunchPreset,
                                    seedQuestionIds: [question.id],
                                  }
                                : null,
                            )
                          }
                          type="button"
                        >
                          {isKorean ? "리플레이 모의면접 시작" : "Start replay mock"}
                        </button>
                      ) : null}
                    </div>
                  </article>
                  );
                })}
              </div>
            </div>
          ) : null}

          {activeTab === "thread" ? (
            <div className="page-stack">
              <span className="page-card__label">{isKorean ? "스레드" : "Threads"}</span>
              <h2 className="page-card__title">{isKorean ? "꼬리질문 체인과 리플레이 프리셋" : "Follow-up chains and replay presets"}</h2>
              <div className="stack-list">
                {review.followUpThreads.map((thread) => (
                  <article
                    className={`page-card page-card--inset practical-thread-row${selectedThreadRootQuestionId === thread.id ? " practical-thread-row--selected" : ""}`}
                    id={`practical-thread-${thread.id}`}
                    key={thread.id}
                  >
                    <div className="section-heading">
                      <div>
                        <p className="section-heading__eyebrow">
                          {isKorean ? `루트 #${thread.rootOrderIndex + 1}` : `Root #${thread.rootOrderIndex + 1}`}
                        </p>
                        <h3 className="page-card__title">{thread.rootText}</h3>
                      </div>
                      <div className="chip-list">
                        {thread.weakQuestionCount > 0 ? (
                          <span className="detail-chip detail-chip--accent">{isKorean ? "약한 체인" : "Weak chain"}</span>
                        ) : null}
                        {thread.quantifiedQuestionCount > 0 ? (
                          <span className="detail-chip">{isKorean ? "수치화됨" : "Quantified"}</span>
                        ) : null}
                        {thread.structuredQuestionCount > 0 ? (
                          <span className="detail-chip">{isKorean ? "구조화됨" : "Structured"}</span>
                        ) : null}
                        {thread.tradeoffAwareQuestionCount > 0 ? (
                          <span className="detail-chip">{isKorean ? "트레이드오프 인식" : "Tradeoff-aware"}</span>
                        ) : null}
                        {thread.uncertainQuestionCount > 0 ? (
                          <span className="detail-chip detail-chip--accent">{isKorean ? "불확실" : "Uncertain"}</span>
                        ) : null}
                      </div>
                    </div>
                    <div className="practical-review-meta">
                      <div className="practical-review-meta__row">
                        <span className="practical-review-meta__label">{isKorean ? "권장 동작" : "Recommended action"}</span>
                        <span className="practical-review-meta__value">
                          {thread.recommendedAction
                            ? localizeReviewPayloadText(thread.recommendedAction, isKorean)
                            : isKorean
                              ? "리뷰 계속"
                              : "Continue review"}
                        </span>
                      </div>
                      {thread.structuringSources.length > 0 ? (
                        <div className="practical-review-meta__row">
                          <span className="practical-review-meta__label">{isKorean ? "구조화 출처" : "Structuring sources"}</span>
                          <span className="practical-review-meta__value">
                            {thread.structuringSources.map((item) => localizeReviewPayloadText(item, isKorean)).join(" · ")}
                          </span>
                        </div>
                      ) : null}
                    </div>
                    <div className="stats-grid">
                      <MetricCard label={isKorean ? "질문" : "Questions"} value={String(thread.questionIds.length)} />
                      <MetricCard label={isKorean ? "꼬리질문" : "Follow-ups"} tone="muted" value={String(thread.followUpCount)} />
                      <MetricCard label={isKorean ? "답변 완료" : "Answered"} tone="accent" value={String(thread.answeredQuestionCount)} />
                    </div>
                    <div className="page-card__actions">
                      <button
                        className="secondary-button"
                        onClick={() => {
                          setSelectedThreadRootQuestionId(thread.id);
                          jumpToQuestion(thread.id);
                        }}
                        type="button"
                      >
                        {isKorean ? "루트 질문 집중" : "Focus root question"}
                      </button>
                      {thread.threadRange ? (
                        <button
                          className="secondary-button"
                          onClick={() => {
                            setSelectedThreadRootQuestionId(thread.id);
                            void playRange(thread.threadRange, isKorean ? `${thread.rootOrderIndex + 1}번 스레드` : `Thread ${thread.rootOrderIndex + 1}`);
                          }}
                          type="button"
                        >
                          {isKorean ? "스레드 재생" : "Play thread"}
                        </button>
                      ) : null}
                      {thread.replayLaunchPreset ? (
                        <button
                          className="primary-button"
                          onClick={() => openReplayLauncher(thread.replayLaunchPreset)}
                          type="button"
                        >
                          {localizeReviewPayloadText(thread.replayLaunchPreset.launchButtonLabel, isKorean)}
                        </button>
                      ) : null}
                    </div>
                  </article>
                ))}
              </div>
            </div>
          ) : null}
        </section>

        {replayPreset ? (
          <section className="page-card practical-replay-launch">
            <div className="practical-replay-launch__hero">
              <div>
                <span className="page-card__label">{isKorean ? "리플레이 시작" : "Replay launch"}</span>
                <h2 className="page-card__title">{localizeReviewPayloadText(replayPreset.presetTitle, isKorean)}</h2>
                <p className="page-card__body">{localizeReviewPayloadText(replayPreset.presetDescription, isKorean)}</p>
              </div>
              <div className="chip-list">
                <span className="question-status-badge question-status-badge--accent">
                  {localizeReviewPayloadText(review.replayReadiness.statusBadgeText, isKorean)}
                </span>
                {review.replayReadiness.ready ? (
                  <span className="question-status-badge question-status-badge--positive">
                    {isKorean ? "리플레이 준비 완료" : "Replay ready"}
                  </span>
                ) : (
                  <span className="question-status-badge question-status-badge--warning">
                    {isKorean ? "리뷰 차단 요인" : "Review blockers"}
                  </span>
                )}
              </div>
            </div>
            <div className="interview-session-layout">
              <div className="interview-session-layout__main">
                <section className="page-card page-card--inset">
                  <span className="page-card__label">{isKorean ? "프리셋" : "Preset"}</span>
                  <div className="stats-grid">
                    <MetricCard label={isKorean ? "권장 모드" : "Recommended mode"} value={localizeReplayModeLabel(replayPreset.recommendedReplayModeLabel ?? (isKorean ? "리플레이" : "Replay"), isKorean)} />
                    <MetricCard label={isKorean ? "시드 질문" : "Seed questions"} tone="accent" value={String(replayPreset.seedQuestionIds.length)} />
                    <MetricCard label={isKorean ? "리플레이 가능" : "Replayable"} tone="muted" value={String(review.replayReadiness.replayableQuestionCount)} />
                  </div>
                  <div className="form-grid">
                    <label className="form-field">
                      <span className="form-field__label">{isKorean ? "리플레이 모드" : "Replay mode"}</span>
                      <select
                        className="form-input"
                        onChange={(event) => setSelectedReplayMode(event.target.value)}
                        value={selectedReplayMode}
                      >
                        {replayPreset.availableReplayModes.map((mode) => (
                          <option key={mode} value={mode}>
                            {localizeReplayModeLabel(replayPreset.availableReplayModeLabels[mode] ?? mode, isKorean)}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="form-field">
                      <span className="form-field__label">{isKorean ? "질문 수" : "Question count"}</span>
                      <input
                        className="form-input"
                        max={10}
                        min={1}
                        onChange={(event) => setSelectedQuestionCount(Number(event.target.value))}
                        type="number"
                        value={selectedQuestionCount}
                      />
                    </label>
                  </div>
                </section>
              </div>
              <div className="interview-facet-panels">
                <section className="page-card page-card--inset">
                  <span className="page-card__label">{isKorean ? "준비 상태" : "Readiness"}</span>
                  <h3 className="page-card__title">{isKorean ? "서버 준비 상태 요약" : "Server readiness summary"}</h3>
                  <p className="page-card__body">{localizeReviewPayloadText(review.replayReadiness.statusSummary, isKorean)}</p>
                  {review.replayReadiness.blockerDetails.length > 0 && !review.replayReadiness.ready ? (
                    <div className="stack-list">
                      {review.replayReadiness.blockerDetails.map((detail) => (
                        <article className="list-item-card practical-blocker-card" key={detail.id}>
                          <div className="list-item-card__content">
                            <div className="list-item-card__meta">
                              <span>{localizeReviewPayloadText(detail.label, isKorean)}</span>
                              <span>{localizeReviewPayloadText(detail.severity, isKorean)}</span>
                            </div>
                            <p className="list-item-card__body">{detail.description}</p>
                          </div>
                        </article>
                      ))}
                    </div>
                  ) : null}
                </section>
              </div>
            </div>
            <div className="page-card__actions">
              <button
                className="primary-button"
                disabled={!review.actionRecommendations.canReplay || createReplayMutation.isPending}
                onClick={() => {
                  void handleStartReplay();
                }}
                type="button"
              >
                {createReplayMutation.isPending
                  ? isKorean
                    ? "리플레이 시작 중..."
                    : "Starting replay..."
                  : localizeReviewPayloadText(replayPreset.launchButtonLabel, isKorean)}
              </button>
              <button
                className="secondary-button"
                onClick={() => setReplayPreset(null)}
                type="button"
              >
                {isKorean ? "닫기" : "Close"}
              </button>
            </div>
          </section>
        ) : null}

        <section className="page-card">
          <span className="page-card__label">{isKorean ? "교차 링크" : "Cross-links"}</span>
          <h2 className="page-card__title">{isKorean ? "기존 질문과 아카이브 흐름을 유지하세요" : "Keep existing question and archive flows"}</h2>
          <div className="page-card__actions">
            <Link className="secondary-button" to={routeConfig.practicalInterviews.buildPath()}>
              {isKorean ? "기록 목록으로" : "Back to records"}
            </Link>
            <Link className="secondary-button" to={routeConfig.archive.buildPath()}>
              {isKorean ? "아카이브 열기" : "Open archive"}
            </Link>
            <Link className="secondary-button" to={routeConfig.interview.buildPath()}>
              {isKorean ? "면접 기록 열기" : "Open interview history"}
            </Link>
          </div>
        </section>
      </div>
    </PageContainer>
  );
}
