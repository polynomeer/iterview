import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { routeConfig } from "../../../shared/config/routes";
import { useLocale } from "../../../shared/i18n";
import { Button, Callout, Tabs } from "../../../shared/ui/primitives";
import { QuestionReviewPanel, type QuestionFilter } from "./components/QuestionReviewPanel";
import { RecordProcessingView } from "./components/RecordProcessingView";
import { ReplayLaunchDialog } from "./components/ReplayLaunchDialog";
import { ReplayPlayer } from "./components/ReplayPlayer";
import { MissingRecordView, ReviewLoadErrorView, ReviewLoadingView } from "./components/ReviewStatusViews";
import { ReviewSummary } from "./components/ReviewSummary";
import { ThreadReviewPanel } from "./components/ThreadReviewPanel";
import { TranscriptReviewPanel } from "./components/TranscriptReviewPanel";
import { useRecordAudio } from "./hooks/useRecordAudio";
import { useReviewWorkspace } from "./hooks/useReviewWorkspace";
import {
  normalizeTab,
  type PlaybackRange,
  type ReplayPresetModel,
  type ReviewRoute,
  type ReviewTab,
  type SegmentDraftEdits,
} from "./reviewModel";
import "./review.css";

/**
 * 실전 면접 복기 for one record: the facts, then questions, follow-up chains, and the transcript as tabs,
 * with the recording beside them. Every record route renders this; `route` picks the opening tab and
 * whether the replay dialog opens (simulate).
 */
export function PracticalInterviewReviewWorkspace({ route }: { route: ReviewRoute }) {
  const { t } = useLocale();
  const navigate = useNavigate();
  const { recordId, questionId } = useParams<{ recordId: string; questionId?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [draftEdits, setDraftEdits] = useState<SegmentDraftEdits>({});
  const [selectedSegmentSequence, setSelectedSegmentSequence] = useState<number | null>(null);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(questionId ?? null);
  const [selectedThreadRootQuestionId, setSelectedThreadRootQuestionId] = useState<string | null>(
    null,
  );
  const [activeQuestionFilter, setActiveQuestionFilter] = useState<QuestionFilter>("all");
  const [selectedReplayMode, setSelectedReplayMode] = useState<string>("");
  const [selectedQuestionCount, setSelectedQuestionCount] = useState(5);
  const [replayPreset, setReplayPreset] = useState<ReplayPresetModel>(null);
  const {
    detailQuery,
    isRecordReadyForReview,
    reviewQuery,
    transcriptQuery,
    questionsQuery,
    structuredQuestionById,
    updateSegmentMutation,
    updateReviewMutation,
    confirmMutation,
    retryTranscriptionMutation,
    createReplayMutation,
    isLoading,
    hasError,
    transcriptTimeline,
    chapterItems,
  } = useReviewWorkspace(recordId);
  const playbackSourceAudioFileUrl = (
    reviewQuery.data?.playback ?? transcriptQuery.data?.playback ?? questionsQuery.data?.playback ?? null
  )?.sourceAudioFileUrl;
  const {
    audioRef,
    currentTimeMs,
    playbackRate,
    setPlaybackRate,
    isPlayingAudio,
    audioSourceUrl,
    activeReplayLabel,
    playRange,
    seekToMs,
    toggleAudioPlayback,
  } = useRecordAudio(recordId, playbackSourceAudioFileUrl);
  const activeTab = useMemo(() => {
    if (route === "transcript") {
      return "transcript";
    }

    if (route === "question") {
      return "question";
    }

    return normalizeTab(searchParams.get("tab"));
  }, [route, searchParams]);

  useEffect(() => {
    if (questionId && searchParams.get("tab") !== "question") {
      setSelectedQuestionId(questionId);
      const next = new URLSearchParams(searchParams);
      next.set("tab", "question");
      setSearchParams(next, { replace: true });
    }
  }, [questionId, searchParams, setSearchParams]);

  useEffect(() => {
    if (route === "simulate" && reviewQuery.data?.replayLaunchPreset) {
      setReplayPreset(reviewQuery.data.replayLaunchPreset);
    }
  }, [route, reviewQuery.data?.replayLaunchPreset]);

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

  const activePlaybackSegmentSequence = useMemo(
    () =>
      (transcriptQuery.data?.segments ?? []).find(
        (segment) => currentTimeMs >= segment.startMs && currentTimeMs <= segment.endMs,
      )?.sequence ?? null,
    [currentTimeMs, transcriptQuery.data?.segments],
  );

  if (!recordId) {
    return <MissingRecordView />;
  }

  if (isLoading) {
    return <ReviewLoadingView />;
  }

  if (hasError || !detailQuery.data || (isRecordReadyForReview && (!reviewQuery.data || !transcriptQuery.data || !questionsQuery.data))) {
    const error = detailQuery.error ?? reviewQuery.error ?? transcriptQuery.error ?? questionsQuery.error;

    return (
      <ReviewLoadErrorView
        error={error}
        onRetry={() => {
          void Promise.all([
            detailQuery.refetch(),
            reviewQuery.refetch(),
            transcriptQuery.refetch(),
            questionsQuery.refetch(),
          ]);
        }}
      />
    );
  }

  const detail = detailQuery.data;
  if (!detail.isTranscriptConfirmed) {
    return (
      <RecordProcessingView
        detail={detail}
        onRefresh={() => {
          void detailQuery.refetch();
        }}
        retryTranscriptionMutation={retryTranscriptionMutation}
      />
    );
  }

  const review = reviewQuery.data!;
  const transcript = transcriptQuery.data!;
  const questions = questionsQuery.data!;
  const dirtyEditCount = Object.keys(draftEdits).length;
  const playback = review.playback ?? transcript.playback ?? questions.playback ?? null;
  const canPlay = Boolean(playback?.playbackAvailable && playback.sourceAudioFileUrl);


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
    range: PlaybackRange | null | undefined,
    label: string,
  ) {
    jumpToQuestion(targetQuestionId);
    void playRange(range, label);
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
      sessionType: "replay_mock",
      sourceInterviewRecordId: replayPreset.sourceInterviewRecordId,
      // Grade replay answers against the resume this interview was linked to, when there is one.
      resumeVersionId: detail.linkedResumeVersionId,
      replayMode: selectedReplayMode,
      questionCount: selectedQuestionCount,
      seedQuestionIds: replayPreset.seedQuestionIds,
    });

    if (session.id) {
      navigate(routeConfig.interviewSession.buildPath({ sessionId: String(session.id) }));
    }
  }

  const tabs: Array<{ id: ReviewTab; label: string; count?: number }> = [
    { id: "question", label: t("recordReview.tabQuestions"), count: review.totalQuestionCount },
    { id: "thread", label: t("recordReview.tabThreads"), count: review.followUpThreads.length },
    { id: "transcript", label: t("recordReview.tabTranscript") },
  ];

  return (
    <div className="ui-page record-review">
      <ReviewSummary
        confirmMutation={confirmMutation}
        createReplayMutation={createReplayMutation}
        detail={detail}
        dirtyEditCount={dirtyEditCount}
        handleConfirm={handleConfirm}
        openReplayLauncher={openReplayLauncher}
        review={review}
        updateReviewMutation={updateReviewMutation}
      />

      {dirtyEditCount > 0 ? (
        <Callout className="record-review__dirty" tone="accent">
          <p>{t(dirtyEditCount > 1 ? "recordReview.unsavedEditsOther" : "recordReview.unsavedEditsOne", { count: dirtyEditCount })}</p>
          <Button loading={updateReviewMutation.isPending} onClick={() => void handleApplyBulkEdits(false).catch(() => undefined)} size="sm" variant="primary">
            {t("recordReview.saveAllEdits")}
          </Button>
        </Callout>
      ) : null}

      <div className={canPlay ? "record-review__grid" : "record-review__grid record-review__grid--single"}>
        <div className="record-review__main">
          <Tabs items={tabs} label={t("recordReview.views")} onChange={changeTab} value={activeTab}>
            {activeTab === "question" ? (
              <QuestionReviewPanel
                activeQuestionFilter={activeQuestionFilter}
                canPlay={canPlay}
                detail={detail}
                focusQuestionWithPlayback={focusQuestionWithPlayback}
                openReplayLauncher={openReplayLauncher}
                review={review}
                selectedQuestionId={selectedQuestionId}
                setActiveQuestionFilter={setActiveQuestionFilter}
                structuredQuestionById={structuredQuestionById}
              />
            ) : null}

            {activeTab === "thread" ? (
              <ThreadReviewPanel
                canPlay={canPlay}
                jumpToQuestion={jumpToQuestion}
                openReplayLauncher={openReplayLauncher}
                playRange={playRange}
                review={review}
                selectedThreadRootQuestionId={selectedThreadRootQuestionId}
                setSelectedThreadRootQuestionId={setSelectedThreadRootQuestionId}
              />
            ) : null}

            {activeTab === "transcript" ? (
              <TranscriptReviewPanel
                activePlaybackSegmentSequence={activePlaybackSegmentSequence}
                canPlay={canPlay}
                draftEdits={draftEdits}
                handleSaveSegment={handleSaveSegment}
                jumpToQuestion={jumpToQuestion}
                jumpToSegment={jumpToSegment}
                playRange={playRange}
                review={review}
                selectedSegmentSequence={selectedSegmentSequence}
                setDraftEdits={setDraftEdits}
                setSelectedQuestionId={setSelectedQuestionId}
                setSelectedThreadRootQuestionId={setSelectedThreadRootQuestionId}
                transcript={transcript}
                updateSegmentMutation={updateSegmentMutation}
              />
            ) : null}
          </Tabs>
        </div>

        {canPlay ? (
          <aside className="record-review__aside">
            <ReplayPlayer
              activeRangeLabel={activeReplayLabel}
              audioRef={audioRef}
              audioSourceUrl={audioSourceUrl}
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
          </aside>
        ) : null}
      </div>

      <ReplayLaunchDialog
        createReplayMutation={createReplayMutation}
        handleStartReplay={handleStartReplay}
        onClose={() => setReplayPreset(null)}
        replayPreset={replayPreset}
        review={review}
        selectedQuestionCount={selectedQuestionCount}
        selectedReplayMode={selectedReplayMode}
        setSelectedQuestionCount={setSelectedQuestionCount}
        setSelectedReplayMode={setSelectedReplayMode}
      />
    </div>
  );
}
