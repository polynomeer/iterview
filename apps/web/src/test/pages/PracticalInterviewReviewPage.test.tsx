import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import { Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { PracticalInterviewOverviewPage } from "../../pages/practical-interviews/PracticalInterviewOverviewPage";
import { useCreateInterviewSessionMutation } from "../../features/interview/api/useCreateInterviewSessionMutation";
import { useConfirmInterviewRecordMutation } from "../../features/practical-interview/api/useConfirmInterviewRecordMutation";
import { useInterviewRecordDetailQuery } from "../../features/practical-interview/api/useInterviewRecordDetailQuery";
import { useInterviewRecordQuestionsQuery } from "../../features/practical-interview/api/useInterviewRecordQuestionsQuery";
import { useRetryInterviewRecordTranscriptionMutation } from "../../features/practical-interview/api/useRetryInterviewRecordTranscriptionMutation";
import { useInterviewRecordReviewQuery } from "../../features/practical-interview/api/useInterviewRecordReviewQuery";
import { useInterviewRecordTranscriptQuery } from "../../features/practical-interview/api/useInterviewRecordTranscriptQuery";
import { useUpdateInterviewReviewMutation } from "../../features/practical-interview/api/useUpdateInterviewReviewMutation";
import { useUpdateInterviewTranscriptSegmentMutation } from "../../features/practical-interview/api/useUpdateInterviewTranscriptSegmentMutation";
import { renderWithProviders } from "../utils";

vi.mock("../../features/interview/api/useCreateInterviewSessionMutation", () => ({
  useCreateInterviewSessionMutation: vi.fn(),
}));
vi.mock("../../features/practical-interview/api/useConfirmInterviewRecordMutation", () => ({
  useConfirmInterviewRecordMutation: vi.fn(),
}));
vi.mock("../../features/practical-interview/api/useInterviewRecordDetailQuery", () => ({
  useInterviewRecordDetailQuery: vi.fn(),
}));
vi.mock("../../features/practical-interview/api/useInterviewRecordQuestionsQuery", () => ({
  useInterviewRecordQuestionsQuery: vi.fn(),
}));
vi.mock("../../features/practical-interview/api/useRetryInterviewRecordTranscriptionMutation", () => ({
  useRetryInterviewRecordTranscriptionMutation: vi.fn(),
}));
vi.mock("../../features/practical-interview/api/useInterviewRecordReviewQuery", () => ({
  useInterviewRecordReviewQuery: vi.fn(),
}));
vi.mock("../../features/practical-interview/api/useInterviewRecordTranscriptQuery", () => ({
  useInterviewRecordTranscriptQuery: vi.fn(),
}));
vi.mock("../../features/practical-interview/api/useUpdateInterviewReviewMutation", () => ({
  useUpdateInterviewReviewMutation: vi.fn(),
}));
vi.mock("../../features/practical-interview/api/useUpdateInterviewTranscriptSegmentMutation", () => ({
  useUpdateInterviewTranscriptSegmentMutation: vi.fn(),
}));

function mockConfirmedReviewPayload() {
  vi.mocked(useInterviewRecordDetailQuery).mockReturnValue({
    data: {
      id: "record-1",
      title: "Datadog · Backend Engineer",
      linkedResumeVersionId: "resume-version-1",
      aiEnrichedSummary: "AI summary",
      overallSummary: "Overall summary",
      structuringStageLabel: "Reviewed",
      confirmedAtLabel: null,
      transcriptStatus: "confirmed",
      transcriptStatusLabel: "Confirmed",
      transcriptStatusTone: "positive",
      analysisStatus: "completed",
      analysisStatusLabel: "Completed",
      isTranscriptConfirmed: true,
      isTranscriptPending: false,
      isTranscriptProcessing: false,
      isTranscriptFailed: false,
      isAnalysisPending: false,
      isAnalysisCompleted: true,
    },
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
  } as never);
  vi.mocked(useInterviewRecordTranscriptQuery).mockReturnValue({
    data: {
      playback: {
        playbackAvailable: true,
        sourceAudioFileUrl: "/api/interview-records/record-1/audio",
        sourceAudioFileName: "interview.wav",
        audioDurationMs: 180000,
      },
      segments: [
        {
          id: "segment-1",
          sequence: 1,
          speakerType: "candidate",
          speakerLabel: "Candidate",
          startMs: 12000,
          endMs: 18000,
          timestampLabel: "00:12",
          rawText: "I used Redis for caching.",
          cleanedText: "I used Redis for caching.",
          confirmedText: "",
          confidenceLabel: "85%",
          hasTextOverride: false,
        },
      ],
    },
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
  } as never);
  vi.mocked(useInterviewRecordQuestionsQuery).mockReturnValue({
    data: {
      items: [
        {
          id: "question-1",
          derivedFromResumeRecordType: "project",
          derivedFromResumeRecordId: "31",
        },
      ],
    },
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
  } as never);
  vi.mocked(useInterviewRecordReviewQuery).mockReturnValue({
    data: {
      overallSummary: "Overall summary",
      requiresConfirmation: true,
      totalSegmentCount: 10,
      totalQuestionCount: 6,
      changedQuestionCount: 2,
      weakAnswerCount: 1,
      followUpQuestionCount: 3,
      actionRecommendations: {
        primaryActionLabel: "Review transcript lane",
        primaryActionTarget: "transcript",
        primaryActionTargetPayload: {},
        canConfirm: true,
        canReplay: true,
        blockingReasonDetails: [],
      },
      replayReadiness: {
        ready: true,
        statusBadgeText: "리플레이 준비 상태",
        statusSummary: "대부분의 질문이 리플레이 가능합니다.",
        replayableQuestionCount: 5,
        linkedQuestionCount: 4,
        unlinkedQuestionCount: 1,
        followUpThreadCount: 2,
        blockerDetails: [],
      },
      replayLaunchPreset: {
        sessionType: "replay_mock",
        sourceInterviewRecordId: "record-1",
        replayMode: "original_replay",
        recommendedReplayModeLabel: "Original replay",
        recommendedQuestionCount: 4,
        seedQuestionIds: ["q-1"],
        availableReplayModes: ["original_replay", "pressure_variant"],
        availableReplayModeLabels: {
          original_replay: "Original replay",
          pressure_variant: "Pressure variant",
        },
        presetTitle: "Replay this interview",
        presetDescription: "Use the reviewed practical interview as a replay seed.",
        launchButtonLabel: "Start replay",
      },
      provenanceComparisonSummary: {
        currentQuestionSource: "ai_enriched",
        currentAnswerSource: "confirmed",
        changedQuestionCountFromDeterministic: 2,
        changedAnswerCountFromDeterministic: 1,
      },
      transcriptIssueSummary: {
        lowConfidenceSegmentCount: 1,
        speakerOverrideSegmentCount: 0,
        confirmedTextOverrideCount: 0,
        unresolvedIssueCount: 1,
        topPrioritySegmentActions: [
          {
            id: "action-1",
            sequence: 1,
            ctaLabel: "Review segment 1",
            triageReason: "Low confidence words detected.",
            severity: "warning",
            priority: "high",
          },
        ],
      },
      questionFilterSummary: {
        allQuestions: 6,
        primaryQuestions: 3,
        followUpQuestions: 3,
        weakAnswerQuestions: 1,
      },
      questionOriginSummary: {
        resumeLinkedQuestions: 2,
        jobPostingLinkedQuestions: 1,
        hybridLinkedQuestions: 1,
        generalQuestions: 2,
      },
      laneItems: [
        {
          key: "question",
          sortOrder: 2,
          highlightVariant: "accent",
          badgeText: "Question lane",
          summaryText: "Review structured questions",
          whyItMatters: "Question structure is the replay backbone.",
          needsReviewCount: 1,
          readiness: "needs_review",
        },
        {
          key: "transcript",
          sortOrder: 1,
          highlightVariant: "warning",
          badgeText: "Transcript lane",
          summaryText: "Transcript needs final review",
          whyItMatters: "Transcript issues affect all downstream structuring.",
          needsReviewCount: 2,
          readiness: "needs_review",
        },
        {
          key: "thread",
          sortOrder: 3,
          highlightVariant: "neutral",
          badgeText: "Thread lane",
          summaryText: "Check follow-up chains",
          whyItMatters: "Thread quality affects realistic replay.",
          needsReviewCount: 1,
          readiness: "ready",
        },
      ],
      laneMap: {
        transcript: { helpText: "Transcript help" },
        question: { helpText: "Question help" },
        thread: { helpText: "Thread help" },
      },
      questionSummaries: [
        {
          id: "question-1",
          orderIndex: 0,
          text: "How did you validate cache invalidation safety?",
          questionTypeLabel: "Behavioral",
          questionType: "behavioral",
          originLabel: "Resume Linked",
          originType: "resume_linked",
          derivedFromResumeSection: "project",
          derivedFromJobPostingSection: null,
          isFollowUp: true,
          hasWeakAnswer: true,
          topicTags: ["Caching"],
          weaknessTags: ["Tradeoffs"],
          strengthTags: [],
          confidenceMarkers: [],
          questionStructuringSource: "ai_enriched",
          answerStructuringSource: "confirmed",
          answerSummary: "Talked about invalidation but skipped rollback detail.",
          questionRange: {
            startMs: 22000,
            endMs: 28000,
            durationMs: 6000,
            startTimestampLabel: "00:22",
            endTimestampLabel: "00:28",
          },
          answerRange: {
            startMs: 29000,
            endMs: 47000,
            durationMs: 18000,
            startTimestampLabel: "00:29",
            endTimestampLabel: "00:47",
          },
          questionAnswerRange: {
            startMs: 22000,
            endMs: 47000,
            durationMs: 25000,
            startTimestampLabel: "00:22",
            endTimestampLabel: "00:47",
          },
          deepLink: {
            canStartReplayMock: true,
            sourceInterviewQuestionId: "source-question-1",
          },
          linkedQuestionId: "catalog-question-1",
        },
      ],
      followUpThreads: [],
    },
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
  } as never);
  vi.mocked(useUpdateInterviewTranscriptSegmentMutation).mockReturnValue({
    mutateAsync: vi.fn(),
    isPending: false,
  } as never);
  vi.mocked(useUpdateInterviewReviewMutation).mockReturnValue({
    mutateAsync: vi.fn(),
    isPending: false,
    isSuccess: false,
    isError: false,
    error: null,
  } as never);
  vi.mocked(useConfirmInterviewRecordMutation).mockReturnValue({
    mutateAsync: vi.fn(),
    isPending: false,
    isSuccess: false,
    isError: false,
    error: null,
  } as never);
  vi.mocked(useCreateInterviewSessionMutation).mockReturnValue({
    mutateAsync: vi.fn(),
    isPending: false,
    isError: false,
    error: null,
  } as never);
  vi.mocked(useRetryInterviewRecordTranscriptionMutation).mockReturnValue({
    mutateAsync: vi.fn(),
    isPending: false,
    isError: false,
    error: null,
    reset: vi.fn(),
  } as never);

}

describe("PracticalInterviewReviewPage", () => {
  it("renders a processing state when transcript extraction is still pending", () => {
    vi.mocked(useInterviewRecordDetailQuery).mockReturnValue({
      data: {
        id: "record-2",
        title: "Imported interview",
        transcriptStatus: "pending",
        transcriptStatusLabel: "Pending",
        transcriptStatusTone: "neutral",
        analysisStatus: "pending",
        analysisStatusLabel: "Pending",
        isTranscriptConfirmed: false,
        isTranscriptPending: true,
        isTranscriptProcessing: false,
        isTranscriptFailed: false,
        isAnalysisPending: true,
        isAnalysisCompleted: false,
        structuringStageLabel: "Pending",
        questionCount: 0,
        transcriptRetryCount: 0,
        transcriptLastAttemptAtLabel: null,
        transcriptProcessingStartedAtLabel: "Mar 16, 2026, 10:00 AM",
        transcriptNextRetryAtLabel: null,
        sourceAudioFileName: "onsite.wav",
        overallSummary: null,
        aiEnrichedSummary: null,
        deterministicSummary: null,
      },
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as never);
    vi.mocked(useInterviewRecordTranscriptQuery).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as never);
    vi.mocked(useInterviewRecordQuestionsQuery).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as never);
    vi.mocked(useInterviewRecordReviewQuery).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as never);
    vi.mocked(useUpdateInterviewTranscriptSegmentMutation).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as never);
    vi.mocked(useUpdateInterviewReviewMutation).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
      isSuccess: false,
      isError: false,
      error: null,
    } as never);
    vi.mocked(useConfirmInterviewRecordMutation).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
      isSuccess: false,
      isError: false,
      error: null,
    } as never);
    vi.mocked(useCreateInterviewSessionMutation).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
      isError: false,
      error: null,
    } as never);
    vi.mocked(useRetryInterviewRecordTranscriptionMutation).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
      isError: false,
      error: null,
      reset: vi.fn(),
    } as never);

    renderWithProviders(
      <Routes>
        <Route element={<PracticalInterviewOverviewPage />} path="/interview/records/:recordId" />
      </Routes>,
      { route: "/interview/records/record-2?processing=1", locale: "ko" },
    );

    expect(screen.getByRole("heading", { level: 2, name: "녹음을 받아쓰는 중" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "상태 다시 확인" })).toBeInTheDocument();
    expect(screen.getByText("마지막 시도")).toBeInTheDocument();
    expect(screen.getByText("Mar 16, 2026, 10:00 AM")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "받아쓰기 다시 시도" })).not.toBeInTheDocument();
  });

  it("renders retry controls when transcript extraction failed", () => {
    const retryMutateAsync = vi.fn();
    vi.mocked(useInterviewRecordDetailQuery).mockReturnValue({
      data: {
        id: "record-3",
        title: "Imported interview",
        transcriptStatus: "failed",
        transcriptStatusLabel: "Failed",
        transcriptStatusTone: "warning",
        analysisStatus: "pending",
        analysisStatusLabel: "Pending",
        isTranscriptConfirmed: false,
        isTranscriptPending: false,
        isTranscriptProcessing: false,
        isTranscriptFailed: true,
        isAnalysisPending: true,
        isAnalysisCompleted: false,
        canRetryTranscription: true,
        transcriptErrorCode: "transcription_failed",
        transcriptErrorLabel: "Automatic transcription failed",
        transcriptErrorMessage: "The audio could not be transcribed.",
        structuringStageLabel: "Pending",
        questionCount: 0,
        transcriptRetryCount: 2,
        transcriptLastAttemptAtLabel: "Mar 16, 2026, 10:12 AM",
        transcriptProcessingStartedAtLabel: null,
        transcriptNextRetryAtLabel: "Mar 16, 2026, 10:20 AM",
        sourceAudioFileName: "onsite.wav",
        overallSummary: null,
        aiEnrichedSummary: null,
        deterministicSummary: null,
      },
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as never);
    vi.mocked(useInterviewRecordTranscriptQuery).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as never);
    vi.mocked(useInterviewRecordQuestionsQuery).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as never);
    vi.mocked(useInterviewRecordReviewQuery).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as never);
    vi.mocked(useUpdateInterviewTranscriptSegmentMutation).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as never);
    vi.mocked(useUpdateInterviewReviewMutation).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
      isSuccess: false,
      isError: false,
      error: null,
    } as never);
    vi.mocked(useConfirmInterviewRecordMutation).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
      isSuccess: false,
      isError: false,
      error: null,
    } as never);
    vi.mocked(useCreateInterviewSessionMutation).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
      isError: false,
      error: null,
    } as never);
    vi.mocked(useRetryInterviewRecordTranscriptionMutation).mockReturnValue({
      mutateAsync: retryMutateAsync,
      isPending: false,
      isError: false,
      error: null,
      reset: vi.fn(),
    } as never);

    renderWithProviders(
      <Routes>
        <Route element={<PracticalInterviewOverviewPage />} path="/interview/records/:recordId" />
      </Routes>,
      { route: "/interview/records/record-3", locale: "ko" },
    );

    expect(screen.getByRole("heading", { level: 2, name: "받아쓰기에 실패했어요" })).toBeInTheDocument();
    expect(screen.getByText("The audio could not be transcribed.")).toBeInTheDocument();
    expect(screen.getByText("녹음 파일은 보관되어 있어서 다시 올리지 않아도 재시도할 수 있어요.")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "받아쓰기 다시 시도" }));

    expect(retryMutateAsync).toHaveBeenCalledTimes(1);
  });

  function renderRecord() {
    return renderWithProviders(
      <Routes>
        <Route element={<PracticalInterviewOverviewPage />} path="/interview/records/:recordId" />
      </Routes>,
      { route: "/interview/records/record-1", locale: "ko" },
    );
  }

  it("opens on the questions with the interview facts and the recording beside them", () => {
    mockConfirmedReviewPayload();
    renderRecord();

    expect(screen.getByRole("heading", { level: 1, name: "Datadog · Backend Engineer" })).toBeInTheDocument();
    expect(screen.getByText("확정 전")).toBeInTheDocument();
    expect(screen.getByText("Overall summary")).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /질문/, selected: true })).toBeInTheDocument();
    // Internal lane narration is gone.
    expect(screen.queryByText(/레인/)).not.toBeInTheDocument();

    expect(screen.getByRole("heading", { level: 3, name: "How did you validate cache invalidation safety?" })).toBeInTheDocument();
    expect(within(screen.getByRole("tabpanel")).getByText("Talked about invalidation but skipped rollback detail.")).toBeInTheDocument();
    expect(screen.getByText("이력서 연결")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "압박 지도에서 보기" })).toHaveAttribute(
      "href",
      "/resume/resume-version-1/heatmap?selectedAnchor=project%3A31&scope=follow_up&weakOnly=true",
    );
    expect(screen.getByRole("link", { name: "답변 연습" })).toHaveAttribute("href", "/questions/catalog-question-1/answer");
    expect(screen.getByRole("button", { name: "질문 듣기" })).toBeInTheDocument();

    const player = screen.getByRole("region", { name: "녹음" });
    expect(within(player).getByRole("slider", { name: "재생 위치" })).toBeInTheDocument();
    expect(within(player).getByRole("button", { name: "재생" })).toBeInTheDocument();
    expect(within(player).getByRole("button", { name: /Q1\. How did you validate cache invalidation safety\?/ })).toBeInTheDocument();
    // Play and pause come from the <audio> element itself, whenever it mounted.
    const audio = player.querySelector("audio")!;
    fireEvent.play(audio);
    expect(within(player).getByRole("button", { name: "일시정지" })).toBeInTheDocument();
    fireEvent.pause(audio);
    expect(within(player).getByRole("button", { name: "재생" })).toBeInTheDocument();
    fireEvent.click(within(player).getByRole("radio", { name: "전사" }));
    expect(within(player).getByRole("button", { name: /1번 구간/ })).toBeInTheDocument();
  });

  it("checks the transcript and saves a corrected segment", async () => {
    mockConfirmedReviewPayload();
    const saveSegment = vi.fn().mockResolvedValue({});
    vi.mocked(useUpdateInterviewTranscriptSegmentMutation).mockReturnValue({ mutateAsync: saveSegment, isPending: false, isError: false } as never);
    renderRecord();

    fireEvent.click(screen.getByRole("tab", { name: "전사" }));
    expect(screen.getByRole("heading", { name: /먼저 확인할 구간/ })).toBeInTheDocument();
    expect(screen.getByText("알아듣기 어려운 단어가 있어요.")).toBeInTheDocument();
    expect(screen.getByText("I used Redis for caching.")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "수정" }));
    fireEvent.change(screen.getByLabelText("다듬은 문장"), { target: { value: "I used Redis as a cache-aside layer." } });
    expect(screen.getByText("저장하지 않은 전사 수정이 1개 있어요.")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "저장" }));
    await waitFor(() =>
      expect(saveSegment).toHaveBeenCalledWith({
        segmentId: "segment-1",
        payload: { speakerType: "candidate", cleanedText: "I used Redis as a cache-aside layer.", confirmedText: null },
      }),
    );
  });

  it("starts a replay graded against the resume version the interview is linked to", async () => {
    mockConfirmedReviewPayload();
    const createReplay = vi.fn().mockResolvedValue({ id: null });
    vi.mocked(useCreateInterviewSessionMutation).mockReturnValue({ mutateAsync: createReplay, isPending: false, isError: false, error: null } as never);
    renderRecord();

    fireEvent.click(screen.getByRole("button", { name: "이 면접 다시 연습" }));
    const dialog = screen.getByRole("dialog", { name: "이 면접 다시 연습" });
    expect(within(dialog).getByDisplayValue("원래 순서대로")).toBeInTheDocument();
    expect(within(dialog).getByText("이 면접에서 다시 쓸 수 있는 질문은 5개예요.")).toBeInTheDocument();
    fireEvent.click(within(dialog).getByRole("button", { name: "모의면접 시작" }));

    await waitFor(() => expect(createReplay).toHaveBeenCalled());
    expect(createReplay.mock.calls[0][0]).toMatchObject({
      sessionType: "replay_mock",
      sourceInterviewRecordId: "record-1",
      resumeVersionId: "resume-version-1",
      replayMode: "original_replay",
    });
  });

  it("keeps hook order stable when data arrives after the loading state", () => {
    mockConfirmedReviewPayload();
    const loadedDetail = vi.mocked(useInterviewRecordDetailQuery).getMockImplementation()!;
    vi.mocked(useInterviewRecordDetailQuery).mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
      error: null,
    } as never);

    const view = renderRecord();

    vi.mocked(useInterviewRecordDetailQuery).mockImplementation(loadedDetail);

    expect(() =>
      view.rerender(
        <Routes>
          <Route element={<PracticalInterviewOverviewPage />} path="/interview/records/:recordId" />
        </Routes>,
      ),
    ).not.toThrow();
    expect(screen.getByRole("heading", { level: 1, name: "Datadog · Backend Engineer" })).toBeInTheDocument();
  });
});
