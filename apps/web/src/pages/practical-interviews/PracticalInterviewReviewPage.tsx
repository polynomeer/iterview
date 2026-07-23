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
  const [navigatorMode, setNavigatorMode] = useState<"timeline" | "chapters">("timeline");

  if (!props.playback?.playbackAvailable || !props.playback.sourceAudioFileUrl) {
    return null;
  }

  const durationMs = props.playback.audioDurationMs ?? 0;
  const progress = durationMs > 0 ? Math.min(100, (props.currentTimeMs / durationMs) * 100) : 0;
  const playerItems = navigatorMode === "timeline" ? props.transcriptTimeline : props.chapters;

  return (
    <section className="page-card practical-audio-player">
      <span className="page-card__label">Audio replay</span>
      <div className="section-heading">
        <div>
          <h2 className="page-card__title">
            {props.playback.sourceAudioFileName ?? "Interview recording"}
          </h2>
          <p className="page-card__body">
            {props.activeRangeLabel ?? "Use transcript, question, or thread replay actions to jump to one clip."}
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
          aria-label="Replay position"
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
          {props.isPlaying ? "Pause" : "Play"}
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
          aria-label="Playback rate"
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
            Timeline
          </button>
          <button
            className={navigatorMode === "chapters" ? "primary-button" : "secondary-button"}
            onClick={() => setNavigatorMode("chapters")}
            type="button"
          >
            Chapters
          </button>
        </div>
        <div className="stack-list practical-audio-player__navigator-list">
          {playerItems.length === 0 ? (
            <p className="page-card__body">
              {navigatorMode === "timeline"
                ? "Transcript timestamps will appear here when segment replay data is available."
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
                        `Segment ${segment.sequence}`,
                      )
                    }
                    type="button"
                  >
                    <div className="list-item-card__content">
                      <div className="list-item-card__meta">
                        <span>{segment.timestampLabel ?? formatDurationLabel(segment.startMs)}</span>
                        <span>{segment.speakerLabel}</span>
                      </div>
                      <h3 className="list-item-card__title">Segment {segment.sequence}</h3>
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
                        <span>{chapter.isFollowUp ? "Follow-up" : "Main"}</span>
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
        description="Choose an imported interview record before opening the review workspace."
        eyebrow="Practical Interview"
        title="Review unavailable"
      >
        <EmptyStateCard
          action={{ label: "Open practical interviews", to: routeConfig.practicalInterviews.buildPath() }}
          body="The practical interview review route needs a record id."
          title="Missing interview record"
        />
      </PageContainer>
    );
  }

  if (isLoading) {
    return (
      <PageContainer
        description="Loading the review shell, transcript, question structuring, and replay guidance."
        eyebrow="Practical Interview"
        title="Preparing review workspace"
      >
        <LoadingStateCard
          body="Loading the backend review payload and linked practical interview data."
          title="Preparing practical interview review"
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
        description="The practical interview review could not be loaded."
        eyebrow="Practical Interview"
        title="Review unavailable"
      >
        <ErrorStateCard
          body={error instanceof Error ? error.message : "The practical interview review could not be loaded."}
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
          title="Unable to load practical interview review"
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
            ? "The uploaded interview record was created successfully, and transcript extraction or structuring is still in progress."
            : "The upload succeeded, but transcript extraction did not complete yet."
        }
        eyebrow="Practical Interview"
        title={detail.title}
      >
        <div className="page-stack">
          <section className="page-card">
            <span className="page-card__label">Processing</span>
            <h2 className="page-card__title">
              {detail.isTranscriptFailed
                ? "Transcript extraction needs attention"
                : "Transcript extraction in progress"}
            </h2>
            <p className="page-card__body">
              {detail.isTranscriptFailed
                ? detail.transcriptErrorMessage ??
                  detail.transcriptErrorLabel ??
                  "The upload succeeded, but the server could not prepare a transcript yet."
                : "The upload succeeded. If you did not paste a transcript, the server is now trying to extract one from the audio and run the structuring pipeline."}
            </p>
            <div className="stats-grid">
              <MetricCard label="Transcript" value={detail.transcriptStatusLabel} />
              <MetricCard label="Analysis" tone="accent" value={detail.analysisStatusLabel} />
              <MetricCard label="Questions" tone="muted" value={String(detail.questionCount)} />
              <MetricCard
                label="Retries"
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
                Refresh status
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
                    ? "Retrying..."
                    : "Retry transcription"}
                </button>
              ) : null}
              <Link
                className="secondary-button"
                to={routeConfig.practicalInterviews.buildPath()}
              >
                Back to practical interviews
              </Link>
            </div>
          </section>

          <FeedbackNotice
            message={
              detail.isTranscriptFailed
                ? "A failed transcript is not the same as a failed upload. Use retry transcription when available, or reopen the record after the server retry window."
                : "Pending transcript extraction is not an error. Re-open this record after processing completes and the review workspace will appear automatically."
            }
            tone={detail.isTranscriptFailed ? "error" : "info"}
          />

          {retryTranscriptionMutation.isError ? (
            <ErrorStateCard
              body={
                retryTranscriptionMutation.error instanceof Error
                  ? retryTranscriptionMutation.error.message
                  : "The transcript retry request failed."
              }
              details={getErrorDetails(retryTranscriptionMutation.error)}
              onAction={() => retryTranscriptionMutation.reset()}
              title="Unable to retry transcription"
            />
          ) : null}

          <section className="page-card">
            <span className="page-card__label">Current status</span>
            <h2 className="page-card__title">What happens next</h2>
            <div className="stack-list">
              <article className="list-item-card">
                <div className="list-item-card__content">
                  <div className="list-item-card__meta">
                    <span>Audio</span>
                    {detail.sourceAudioFileName ? <span>{detail.sourceAudioFileName}</span> : null}
                  </div>
                  <h3 className="list-item-card__title">Uploaded source is stored</h3>
                  <p className="list-item-card__body">
                    {detail.isTranscriptFailed
                      ? "The uploaded audio is still stored. You can retry transcription without re-uploading the file."
                      : "Once the transcript is confirmed, the transcript, question review, and thread review lanes will become available here."}
                  </p>
                </div>
              </article>
              <article className="list-item-card">
                <div className="list-item-card__content">
                  <div className="list-item-card__meta">
                    <span>Structuring stage</span>
                  </div>
                  <h3 className="list-item-card__title">{detail.structuringStageLabel}</h3>
                  <p className="list-item-card__body">
                    {detail.overallSummary ??
                      detail.aiEnrichedSummary ??
                      detail.deterministicSummary ??
                      (detail.isTranscriptFailed
                        ? "The backend did not finish transcript preparation. Review payloads will stay blocked until transcription succeeds."
                        : "The backend will continue processing this interview record and update the review payload when ready.")}
                  </p>
                  <p className="list-item-card__body">
                    {detail.transcriptLastAttemptAtLabel
                      ? `Last attempt ${detail.transcriptLastAttemptAtLabel}`
                      : detail.transcriptProcessingStartedAtLabel
                        ? `Processing started ${detail.transcriptProcessingStartedAtLabel}`
                        : "The transcript worker has not reported a completed attempt yet."}
                    {detail.transcriptNextRetryAtLabel
                      ? ` Next retry ${detail.transcriptNextRetryAtLabel}.`
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
    { id: "all", label: "All", count: review.questionFilterSummary.allQuestions },
    { id: "primary", label: "Primary", count: review.questionFilterSummary.primaryQuestions },
    { id: "follow-up", label: "Follow-up", count: review.questionFilterSummary.followUpQuestions },
    { id: "weak", label: "Weak answers", count: review.questionFilterSummary.weakAnswerQuestions },
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
      description="Use the server-provided review payload to inspect transcript issues, structured questions, follow-up threads, and replay readiness."
      eyebrow="Practical Interview"
      title={detail.title}
    >
      <div className="page-stack">
        <section className="page-card">
          <span className="page-card__label">Review overview</span>
          <h2 className="page-card__title">
            {review.overallSummary ?? detail.overallSummary ?? detail.title}
          </h2>
          <p className="page-card__body">
            {detail.aiEnrichedSummary ??
              detail.deterministicSummary ??
              "Use the lane dashboard below to review transcript quality, structured questions, and replay readiness."}
          </p>
          <div className="chip-list">
            <span className="question-status-badge question-status-badge--accent">
              {detail.structuringStageLabel}
            </span>
            <span
              className={`question-status-badge ${
                review.requiresConfirmation
                  ? "question-status-badge--warning"
                  : "question-status-badge--positive"
              }`}
            >
              {review.requiresConfirmation ? "Confirmation required" : "Ready to confirm"}
            </span>
            {detail.confirmedAtLabel ? (
              <span className="question-status-badge question-status-badge--neutral">
                Confirmed {detail.confirmedAtLabel}
              </span>
            ) : null}
          </div>
          <div className="stats-grid">
            <MetricCard label="Segments" value={String(review.totalSegmentCount)} />
            <MetricCard label="Questions" value={String(review.totalQuestionCount)} />
            <MetricCard label="Changed questions" tone="accent" value={String(review.changedQuestionCount)} />
            <MetricCard label="Weak answers" tone="muted" value={String(review.weakAnswerCount)} />
            <MetricCard label="Follow-ups" tone="muted" value={String(review.followUpQuestionCount)} />
          </div>
          {(updateReviewMutation.isSuccess || confirmMutation.isSuccess) && (
            <FeedbackNotice
              message={
                confirmMutation.isSuccess
                  ? "The practical interview review was confirmed."
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
                      : "The requested review action failed."
              }
              details={getErrorDetails(
                updateReviewMutation.error ?? confirmMutation.error ?? createReplayMutation.error,
              )}
              title="Unable to complete the review action"
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
              {review.actionRecommendations.primaryActionLabel ?? "Continue review"}
            </button>
            <button
              className="secondary-button"
              disabled={dirtyEditCount > 0 || !review.actionRecommendations.canConfirm || confirmMutation.isPending}
              onClick={() => {
                void handleConfirm();
              }}
              type="button"
            >
              {confirmMutation.isPending ? "Confirming..." : "Confirm review"}
            </button>
            {review.actionRecommendations.canReplay && review.replayLaunchPreset ? (
              <button
                className="secondary-button"
                onClick={() => openReplayLauncher(review.replayLaunchPreset)}
                type="button"
              >
                {review.replayLaunchPreset.launchButtonLabel}
              </button>
            ) : null}
          </div>
          {!review.actionRecommendations.canConfirm ? (
            <div className="stack-list">
              {review.actionRecommendations.blockingReasonDetails.map((detail) => (
                <article className="list-item-card" key={detail.id}>
                  <div className="list-item-card__content">
                    <div className="list-item-card__meta">
                      <span>{detail.label}</span>
                      <span>{detail.severity}</span>
                    </div>
                    <p className="list-item-card__body">{detail.description}</p>
                  </div>
                </article>
              ))}
            </div>
          ) : null}
        </section>

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

        <section className="page-card practical-review-brief">
          <div className="section-heading">
            <div>
              <span className="page-card__label">Review brief</span>
              <h2 className="page-card__title">Keep replay context above the transcript</h2>
            </div>
            <p className="page-card__body practical-review-brief__summary">
              Transcript stays primary. Replay readiness, lane priorities, provenance, and supporting payloads are grouped here so the rest of the review can focus on the interview itself.
            </p>
          </div>
          <div className="practical-review-brief__grid">
            <section className="page-card page-card--inset practical-review-brief__card">
              <span className="page-card__label">Replay readiness</span>
              <h3 className="page-card__title">{review.replayReadiness.statusBadgeText}</h3>
              <p className="page-card__body">{review.replayReadiness.statusSummary}</p>
              <div className="stats-grid">
                <MetricCard label="Replayable" value={String(review.replayReadiness.replayableQuestionCount)} />
                <MetricCard label="Linked" value={String(review.replayReadiness.linkedQuestionCount)} />
                <MetricCard label="Threads" tone="accent" value={String(review.replayReadiness.followUpThreadCount)} />
              </div>
              {review.replayReadiness.blockerDetails.length > 0 ? (
                <div className="stack-list">
                  {review.replayReadiness.blockerDetails.slice(0, 2).map((blocker) => (
                    <article className="list-item-card practical-blocker-card" key={blocker.id}>
                      <div className="list-item-card__content">
                        <div className="list-item-card__meta">
                          <span>{blocker.label}</span>
                          <span>{blocker.severity}</span>
                        </div>
                        <p className="list-item-card__body">{blocker.description}</p>
                      </div>
                    </article>
                  ))}
                </div>
              ) : null}
            </section>

            <section className="page-card page-card--inset practical-review-brief__card">
              <span className="page-card__label">Lane priorities</span>
              <h3 className="page-card__title">Server-prioritized lanes</h3>
              <div className="stack-list">
                {review.laneItems.map((lane) => (
                  <article
                    className={`list-item-card practical-lane-card practical-lane-card--${lane.highlightVariant}`}
                    key={lane.key}
                  >
                    <div className="list-item-card__content">
                      <div className="list-item-card__meta">
                        <span>{lane.badgeText}</span>
                        <span>{lane.readiness}</span>
                        <span>{lane.needsReviewCount} need review</span>
                      </div>
                      <h3 className="list-item-card__title">{lane.summaryText}</h3>
                      <p className="list-item-card__body">{lane.whyItMatters}</p>
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
                          {lane.primaryActionLabel}
                        </button>
                      ) : null}
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section className="page-card page-card--inset practical-review-brief__card">
              <span className="page-card__label">Provenance</span>
              <h3 className="page-card__title">Deterministic vs AI vs confirmed</h3>
              <div className="stack-list">
                <article className="list-item-card">
                  <div className="list-item-card__content">
                    <div className="list-item-card__meta">
                      <span>Question source</span>
                      <span>{review.provenanceComparisonSummary.currentQuestionSource}</span>
                    </div>
                    <p className="list-item-card__body">
                      Changed questions {review.provenanceComparisonSummary.changedQuestionCountFromDeterministic}
                    </p>
                  </div>
                </article>
                <article className="list-item-card">
                  <div className="list-item-card__content">
                    <div className="list-item-card__meta">
                      <span>Answer source</span>
                      <span>{review.provenanceComparisonSummary.currentAnswerSource}</span>
                    </div>
                    <p className="list-item-card__body">
                      Changed answers {review.provenanceComparisonSummary.changedAnswerCountFromDeterministic}
                    </p>
                  </div>
                </article>
              </div>
            </section>

            <section className="page-card page-card--inset practical-review-brief__card">
              <span className="page-card__label">Supporting payloads</span>
              <h3 className="page-card__title">Loaded context</h3>
              <div className="stats-grid">
                <MetricCard label="Transcript rows" value={String(transcript.segments.length)} />
                <MetricCard label="Structured questions" value={String(questions.items.length)} />
                <MetricCard label="Topics" tone="muted" value={String(analysis.topicTags.length)} />
                <MetricCard label="Interviewer profile" tone="accent" value={interviewerProfile ? "Ready" : "Missing"} />
              </div>
              {interviewerProfile ? (
                <div className="chip-list">
                  {interviewerProfile.styleTags.map((tag) => (
                    <span className="detail-chip detail-chip--accent" key={tag}>
                      {tag}
                    </span>
                  ))}
                </div>
              ) : null}
            </section>
          </div>
        </section>

        {dirtyEditCount > 0 ? (
          <FeedbackNotice
            message={`You have ${dirtyEditCount} unsaved transcript edit${dirtyEditCount > 1 ? "s" : ""}. Apply or clear them before confirming review.`}
            tone="info"
          />
        ) : null}

        <section className="page-card">
          <div className="page-card__actions">
            {REVIEW_TABS.map((tab) => (
              <button
                className={activeTab === tab ? "primary-button" : "secondary-button"}
                key={tab}
                onClick={() => changeTab(tab)}
                type="button"
              >
                {tab === "transcript"
                  ? "Transcript review"
                  : tab === "question"
                    ? "Question review"
                    : "Thread review"}
              </button>
            ))}
          </div>

          {activeTab === "transcript" ? (
            <div className="page-stack">
              <span className="page-card__label">Transcript</span>
              <h2 className="page-card__title">Transcript issues and segment edits</h2>
              <div className="stats-grid">
                <MetricCard label="Low confidence" value={String(review.transcriptIssueSummary.lowConfidenceSegmentCount)} />
                <MetricCard label="Speaker overrides" tone="muted" value={String(review.transcriptIssueSummary.speakerOverrideSegmentCount)} />
                <MetricCard label="Confirmed overrides" tone="accent" value={String(review.transcriptIssueSummary.confirmedTextOverrideCount)} />
                <MetricCard label="Unresolved" tone="muted" value={String(review.transcriptIssueSummary.unresolvedIssueCount)} />
              </div>
              <div className="stack-list">
                {review.transcriptIssueSummary.topPrioritySegmentActions.map((action) => (
                  <button
                    className="list-item-card"
                    key={action.id}
                    onClick={() => {
                      jumpToSegment(action.sequence);
                      void playRange(action.seekRange, `Segment ${action.sequence}`);
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
                        <span>Segment {action.sequence}</span>
                        <span>{action.severity}</span>
                        <span>{action.priority}</span>
                      </div>
                      <h3 className="list-item-card__title">{action.ctaLabel}</h3>
                      <p className="list-item-card__body">{action.triageReason}</p>
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
                  {updateReviewMutation.isPending ? "Applying..." : "Apply reviewed edits"}
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
                            Segment {segment.sequence}
                          </p>
                          <h3 className="page-card__title">
                            {segment.speakerLabel}
                            {segment.timestampLabel ? ` · ${segment.timestampLabel}` : ""}
                          </h3>
                        </div>
                        <div className="chip-list">
                          {isPlaybackActive ? (
                            <span className="detail-chip detail-chip--accent">Playing now</span>
                          ) : null}
                          {segment.confidenceLabel ? (
                            <span className="detail-chip">{segment.confidenceLabel}</span>
                          ) : null}
                          {segment.hasTextOverride ? (
                            <span className="detail-chip detail-chip--accent">Edited</span>
                          ) : null}
                        </div>
                      </div>
                      {segment.rawText ? (
                        <div className="practical-transcript-segment__source">
                          <p className="practical-transcript-segment__source-label">
                            Original transcript
                          </p>
                          <p className="page-card__body practical-transcript-segment__source-body">
                            {segment.rawText}
                          </p>
                        </div>
                      ) : null}
                      <div className="form-grid">
                        <label className="form-field">
                          <span className="form-field__label">Speaker</span>
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
                          <span className="form-field__label">Cleaned text</span>
                          <span className="practical-editor-field__helper">
                            Preserve the speaker meaning while removing obvious ASR noise.
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
                          <span className="form-field__label">Confirmed text</span>
                          <span className="practical-editor-field__helper">
                            Use only when you want the final reviewed wording to differ from cleaned text.
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
                          Save segment
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
                              Jump to question
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
                              `Segment ${segment.sequence}`,
                            );
                          }}
                          type="button"
                        >
                          Play segment
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
              <span className="page-card__label">Questions</span>
              <h2 className="page-card__title">Question summaries and deep links</h2>
              <div className="stats-grid">
                <MetricCard label="Resume-linked" value={String(review.questionOriginSummary.resumeLinkedQuestions)} />
                <MetricCard label="Job-posting linked" tone="muted" value={String(review.questionOriginSummary.jobPostingLinkedQuestions)} />
                <MetricCard label="Hybrid" tone="accent" value={String(review.questionOriginSummary.hybridLinkedQuestions)} />
                <MetricCard label="General" tone="muted" value={String(review.questionOriginSummary.generalQuestions)} />
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
                          #{question.orderIndex + 1} · {question.questionTypeLabel}
                        </p>
                        <h3 className="page-card__title">{question.text}</h3>
                      </div>
                      <div className="chip-list">
                        <span className="detail-chip">{question.originLabel}</span>
                        {question.isFollowUp ? (
                          <span className="detail-chip detail-chip--accent">Follow-up</span>
                        ) : null}
                        {question.hasWeakAnswer ? (
                          <span className="detail-chip detail-chip--accent">Weak answer</span>
                        ) : null}
                      </div>
                    </div>
                    <div className="practical-review-meta">
                      {question.questionStructuringSource ? (
                        <div className="practical-review-meta__row">
                          <span className="practical-review-meta__label">Question source</span>
                          <span className="practical-review-meta__value">
                            {question.questionStructuringSource}
                          </span>
                        </div>
                      ) : null}
                      {question.answerStructuringSource ? (
                        <div className="practical-review-meta__row">
                          <span className="practical-review-meta__label">Answer source</span>
                          <span className="practical-review-meta__value">
                            {question.answerStructuringSource}
                          </span>
                        </div>
                      ) : null}
                      {question.derivedFromResumeSection ? (
                        <div className="practical-review-meta__row">
                          <span className="practical-review-meta__label">Resume section</span>
                          <span className="practical-review-meta__value">
                            {question.derivedFromResumeSection}
                          </span>
                        </div>
                      ) : null}
                      {question.derivedFromJobPostingSection ? (
                        <div className="practical-review-meta__row">
                          <span className="practical-review-meta__label">Job posting section</span>
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
                            focusQuestionWithPlayback(question.id, question.questionRange, `Question ${question.orderIndex + 1}`)
                          }
                          type="button"
                        >
                          Play question
                        </button>
                      ) : null}
                      {question.answerRange ? (
                        <button
                          className="secondary-button"
                          onClick={() =>
                            focusQuestionWithPlayback(question.id, question.answerRange, `Answer ${question.orderIndex + 1}`)
                          }
                          type="button"
                        >
                          Play answer
                        </button>
                      ) : null}
                      {question.questionAnswerRange ? (
                        <button
                          className="secondary-button"
                          onClick={() =>
                            focusQuestionWithPlayback(question.id, question.questionAnswerRange, `Q&A ${question.orderIndex + 1}`)
                          }
                          type="button"
                        >
                          Play Q&amp;A
                        </button>
                      ) : null}
                      {question.linkedQuestionId ? (
                        <Link
                          className="secondary-button"
                          to={routeConfig.questionDetail.buildPath({
                            questionId: question.linkedQuestionId,
                          })}
                        >
                          Open question detail
                        </Link>
                      ) : null}
                      {heatmapAnchorPath ? (
                        <Link className="secondary-button" to={heatmapAnchorPath}>
                          Open heatmap anchor
                        </Link>
                      ) : null}
                      {question.deepLink?.sourceInterviewQuestionId ? (
                        <Link
                          className="secondary-button"
                          to={`/archive?sourceInterviewRecordId=${recordId}&sourceInterviewQuestionId=${question.deepLink.sourceInterviewQuestionId}`}
                        >
                          Open archive source
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
                          Start replay mock
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
              <span className="page-card__label">Threads</span>
              <h2 className="page-card__title">Follow-up chains and replay presets</h2>
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
                          Root #{thread.rootOrderIndex + 1}
                        </p>
                        <h3 className="page-card__title">{thread.rootText}</h3>
                      </div>
                      <div className="chip-list">
                        {thread.weakQuestionCount > 0 ? (
                          <span className="detail-chip detail-chip--accent">Weak chain</span>
                        ) : null}
                        {thread.quantifiedQuestionCount > 0 ? (
                          <span className="detail-chip">Quantified</span>
                        ) : null}
                        {thread.structuredQuestionCount > 0 ? (
                          <span className="detail-chip">Structured</span>
                        ) : null}
                        {thread.tradeoffAwareQuestionCount > 0 ? (
                          <span className="detail-chip">Tradeoff-aware</span>
                        ) : null}
                        {thread.uncertainQuestionCount > 0 ? (
                          <span className="detail-chip detail-chip--accent">Uncertain</span>
                        ) : null}
                      </div>
                    </div>
                    <div className="practical-review-meta">
                      <div className="practical-review-meta__row">
                        <span className="practical-review-meta__label">Recommended action</span>
                        <span className="practical-review-meta__value">
                          {thread.recommendedAction || "Continue review"}
                        </span>
                      </div>
                      {thread.structuringSources.length > 0 ? (
                        <div className="practical-review-meta__row">
                          <span className="practical-review-meta__label">Structuring sources</span>
                          <span className="practical-review-meta__value">
                            {thread.structuringSources.join(" · ")}
                          </span>
                        </div>
                      ) : null}
                    </div>
                    <div className="stats-grid">
                      <MetricCard label="Questions" value={String(thread.questionIds.length)} />
                      <MetricCard label="Follow-ups" tone="muted" value={String(thread.followUpCount)} />
                      <MetricCard label="Answered" tone="accent" value={String(thread.answeredQuestionCount)} />
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
                        Focus root question
                      </button>
                      {thread.threadRange ? (
                        <button
                          className="secondary-button"
                          onClick={() => {
                            setSelectedThreadRootQuestionId(thread.id);
                            void playRange(thread.threadRange, `Thread ${thread.rootOrderIndex + 1}`);
                          }}
                          type="button"
                        >
                          Play thread
                        </button>
                      ) : null}
                      {thread.replayLaunchPreset ? (
                        <button
                          className="primary-button"
                          onClick={() => openReplayLauncher(thread.replayLaunchPreset)}
                          type="button"
                        >
                          {thread.replayLaunchPreset.launchButtonLabel}
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
                <span className="page-card__label">Replay launch</span>
                <h2 className="page-card__title">{replayPreset.presetTitle}</h2>
                <p className="page-card__body">{replayPreset.presetDescription}</p>
              </div>
              <div className="chip-list">
                <span className="question-status-badge question-status-badge--accent">
                  {review.replayReadiness.statusBadgeText}
                </span>
                {review.replayReadiness.ready ? (
                  <span className="question-status-badge question-status-badge--positive">
                    Replay ready
                  </span>
                ) : (
                  <span className="question-status-badge question-status-badge--warning">
                    Review blockers
                  </span>
                )}
              </div>
            </div>
            <div className="interview-session-layout">
              <div className="interview-session-layout__main">
                <section className="page-card page-card--inset">
                  <span className="page-card__label">Preset</span>
                  <div className="stats-grid">
                    <MetricCard label="Recommended mode" value={replayPreset.recommendedReplayModeLabel ?? "Replay"} />
                    <MetricCard label="Seed questions" tone="accent" value={String(replayPreset.seedQuestionIds.length)} />
                    <MetricCard label="Replayable" tone="muted" value={String(review.replayReadiness.replayableQuestionCount)} />
                  </div>
                  <div className="form-grid">
                    <label className="form-field">
                      <span className="form-field__label">Replay mode</span>
                      <select
                        className="form-input"
                        onChange={(event) => setSelectedReplayMode(event.target.value)}
                        value={selectedReplayMode}
                      >
                        {replayPreset.availableReplayModes.map((mode) => (
                          <option key={mode} value={mode}>
                            {replayPreset.availableReplayModeLabels[mode] ?? mode}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="form-field">
                      <span className="form-field__label">Question count</span>
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
                  <span className="page-card__label">Readiness</span>
                  <h3 className="page-card__title">Server readiness summary</h3>
                  <p className="page-card__body">{review.replayReadiness.statusSummary}</p>
                  {review.replayReadiness.blockerDetails.length > 0 && !review.replayReadiness.ready ? (
                    <div className="stack-list">
                      {review.replayReadiness.blockerDetails.map((detail) => (
                        <article className="list-item-card practical-blocker-card" key={detail.id}>
                          <div className="list-item-card__content">
                            <div className="list-item-card__meta">
                              <span>{detail.label}</span>
                              <span>{detail.severity}</span>
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
                  ? "Starting replay..."
                  : replayPreset.launchButtonLabel}
              </button>
              <button
                className="secondary-button"
                onClick={() => setReplayPreset(null)}
                type="button"
              >
                Close
              </button>
            </div>
          </section>
        ) : null}

        <section className="page-card">
          <span className="page-card__label">Cross-links</span>
          <h2 className="page-card__title">Keep existing question and archive flows</h2>
          <div className="page-card__actions">
            <Link className="secondary-button" to={routeConfig.practicalInterviews.buildPath()}>
              Back to records
            </Link>
            <Link className="secondary-button" to={routeConfig.archive.buildPath()}>
              Open archive
            </Link>
            <Link className="secondary-button" to={routeConfig.interview.buildPath()}>
              Open interview history
            </Link>
          </div>
        </section>
      </div>
    </PageContainer>
  );
}
