import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { routeConfig } from "../../../shared/config/routes";
import { useLocale } from "../../../shared/i18n";
import { FeedbackNotice } from "../../../shared/ui/FeedbackNotice";
import { PageContainer } from "../../../shared/ui/PageContainer";
import { SectionPanel } from "../../../shared/ui/layout";
import { QuestionReviewPanel } from "./components/QuestionReviewPanel";
import { RecordProcessingView } from "./components/RecordProcessingView";
import { ReplayLaunchPanel } from "./components/ReplayLaunchPanel";
import { ReplayPlayer } from "./components/ReplayPlayer";
import { ReviewBrief } from "./components/ReviewBrief";
import { ReviewCrossLinks } from "./components/ReviewCrossLinks";
import { ReviewLaneSwitcher } from "./components/ReviewLaneSwitcher";
import { ReviewOverview } from "./components/ReviewOverview";
import { MissingRecordView, ReviewLoadErrorView, ReviewLoadingView } from "./components/ReviewStatusViews";
import { ThreadReviewPanel } from "./components/ThreadReviewPanel";
import { TranscriptReviewPanel } from "./components/TranscriptReviewPanel";
import { useRecordAudio } from "./hooks/useRecordAudio";
import { useReviewWorkspace } from "./hooks/useReviewWorkspace";
import {
  mapLaneTab,
  normalizeTab,
  type PlaybackRange,
  type ReplayPresetModel,
  type ReviewRoute,
  type ReviewTab,
  type SegmentDraftEdits,
} from "./reviewModel";

/**
 * Shared review workspace for one interview record. Every record route renders the same
 * workspace; `route` only decides the initial lane (transcript/question) and whether the
 * replay launcher opens automatically (simulate).
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
  const [activeQuestionFilter, setActiveQuestionFilter] = useState("all");
  const [selectedReplayMode, setSelectedReplayMode] = useState<string>("");
  const [selectedQuestionCount, setSelectedQuestionCount] = useState(5);
  const [replayPreset, setReplayPreset] = useState<ReplayPresetModel>(null);
  const {
    detailQuery,
    isRecordReadyForReview,
    reviewQuery,
    transcriptQuery,
    questionsQuery,
    analysisQuery,
    interviewerProfileQuery,
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

  if (hasError || !detailQuery.data || (isRecordReadyForReview && (!reviewQuery.data || !transcriptQuery.data || !questionsQuery.data || !analysisQuery.data))) {
    const error =
      detailQuery.error ??
      reviewQuery.error ??
      transcriptQuery.error ??
      questionsQuery.error ??
      analysisQuery.error ??
      interviewerProfileQuery.error;

    return (
      <ReviewLoadErrorView
        error={error}
        onRetry={() => {
          void Promise.all([
            detailQuery.refetch(),
            reviewQuery.refetch(),
            transcriptQuery.refetch(),
            questionsQuery.refetch(),
            analysisQuery.refetch(),
            interviewerProfileQuery.refetch(),
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
  const analysis = analysisQuery.data!;
  const interviewerProfile = interviewerProfileQuery.data;
  const dirtyEditCount = Object.keys(draftEdits).length;
  const playback = review.playback ?? transcript.playback ?? questions.playback ?? null;


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

  return (
    <PageContainer
      description={t("practicalReview.pageDescription")}
      eyebrow={t("practicalReview.pageEyebrow")}
      title={detail.title}
    >
      <div className="page-stack practical-review-layout">
        <div className="practical-review-layout__hero">
          <ReviewOverview
            applyTarget={applyTarget}
            confirmMutation={confirmMutation}
            createReplayMutation={createReplayMutation}
            detail={detail}
            dirtyEditCount={dirtyEditCount}
            handleConfirm={handleConfirm}
            openReplayLauncher={openReplayLauncher}
            review={review}
            updateReviewMutation={updateReviewMutation}
          />

          <div className="practical-review-layout__hero-side">
            <SectionPanel className="workspace-note-card workspace-note-card--accent practical-review-layout__hero-note" variant="muted">
              <span className="page-card__label">{t("practicalReview.analysisFlowLabel")}</span>
              <h2 className="page-card__title">{t("practicalReview.analysisFlowTitle")}</h2>
              <p className="page-card__body">
                {t("practicalReview.analysisFlowBody")}
              </p>
            </SectionPanel>

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
          </div>
        </div>

        <ReviewBrief
          analysis={analysis}
          applyTarget={applyTarget}
          interviewerProfile={interviewerProfile}
          questions={questions}
          review={review}
          transcript={transcript}
        />

        {dirtyEditCount > 0 ? (
          <FeedbackNotice
            message={t(
              dirtyEditCount > 1 ? "practicalReview.unsavedEditsOther" : "practicalReview.unsavedEditsOne",
              { count: dirtyEditCount },
            )}
            tone="info"
          />
        ) : null}

        <ReviewLaneSwitcher activeTab={activeTab} changeTab={changeTab}>
          {activeTab === "transcript" ? (
            <TranscriptReviewPanel
              activePlaybackSegmentSequence={activePlaybackSegmentSequence}
              dirtyEditCount={dirtyEditCount}
              draftEdits={draftEdits}
              handleApplyBulkEdits={handleApplyBulkEdits}
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
              updateReviewMutation={updateReviewMutation}
              updateSegmentMutation={updateSegmentMutation}
            />
          ) : null}

          {activeTab === "question" ? (
            <QuestionReviewPanel
              activeQuestionFilter={activeQuestionFilter}
              detail={detail}
              focusQuestionWithPlayback={focusQuestionWithPlayback}
              openReplayLauncher={openReplayLauncher}
              recordId={recordId}
              review={review}
              selectedQuestionId={selectedQuestionId}
              setActiveQuestionFilter={setActiveQuestionFilter}
              structuredQuestionById={structuredQuestionById}
            />
          ) : null}

          {activeTab === "thread" ? (
            <ThreadReviewPanel
              jumpToQuestion={jumpToQuestion}
              openReplayLauncher={openReplayLauncher}
              playRange={playRange}
              review={review}
              selectedThreadRootQuestionId={selectedThreadRootQuestionId}
              setSelectedThreadRootQuestionId={setSelectedThreadRootQuestionId}
            />
          ) : null}
        </ReviewLaneSwitcher>

        {replayPreset ? (
          <ReplayLaunchPanel
            createReplayMutation={createReplayMutation}
            handleStartReplay={handleStartReplay}
            replayPreset={replayPreset}
            review={review}
            selectedQuestionCount={selectedQuestionCount}
            selectedReplayMode={selectedReplayMode}
            setReplayPreset={setReplayPreset}
            setSelectedQuestionCount={setSelectedQuestionCount}
            setSelectedReplayMode={setSelectedReplayMode}
          />
        ) : null}

        <ReviewCrossLinks />
      </div>
    </PageContainer>
  );
}
