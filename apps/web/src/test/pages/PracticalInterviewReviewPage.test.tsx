import { fireEvent, screen, within } from "@testing-library/react";
import { Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { PracticalInterviewReviewPage } from "../../pages/practical-interviews/PracticalInterviewReviewPage";
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
import { renderWithProviders } from "../utils";

vi.mock("../../features/interview/api/useCreateInterviewSessionMutation", () => ({
  useCreateInterviewSessionMutation: vi.fn(),
}));
vi.mock("../../features/practical-interview/api/useConfirmInterviewRecordMutation", () => ({
  useConfirmInterviewRecordMutation: vi.fn(),
}));
vi.mock("../../features/practical-interview/api/useInterviewRecordAnalysisQuery", () => ({
  useInterviewRecordAnalysisQuery: vi.fn(),
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
vi.mock("../../features/practical-interview/api/useInterviewerProfileQuery", () => ({
  useInterviewerProfileQuery: vi.fn(),
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
  vi.mocked(useInterviewRecordAnalysisQuery).mockReturnValue({
    data: { topicTags: ["Caching"] },
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
  } as never);
  vi.mocked(useInterviewerProfileQuery).mockReturnValue({
    data: {
      styleTags: ["deep_dive"],
      toneProfile: "Skeptical",
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
    vi.mocked(useInterviewRecordAnalysisQuery).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as never);
    vi.mocked(useInterviewerProfileQuery).mockReturnValue({
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
        <Route element={<PracticalInterviewReviewPage />} path="/practical-interviews/:recordId" />
      </Routes>,
      { route: "/practical-interviews/record-2?processing=1", locale: "ko" },
    );

    expect(screen.getByText("전사 추출 진행 중")).toBeInTheDocument();
    expect(screen.getByText("상태 새로고침")).toBeInTheDocument();
    expect(screen.getByText("업로드한 원본이 보관되었습니다")).toBeInTheDocument();
    expect(screen.getByText(/처리 시작 Mar 16, 2026, 10:00 AM/)).toBeInTheDocument();
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
    vi.mocked(useInterviewRecordAnalysisQuery).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as never);
    vi.mocked(useInterviewerProfileQuery).mockReturnValue({
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
        <Route element={<PracticalInterviewReviewPage />} path="/practical-interviews/:recordId" />
      </Routes>,
      { route: "/practical-interviews/record-3", locale: "ko" },
    );

    expect(screen.getByText("전사 추출에 확인이 필요합니다")).toBeInTheDocument();
    expect(screen.getByText("The audio could not be transcribed.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "전사 다시 시도" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "전사 다시 시도" }));

    expect(retryMutateAsync).toHaveBeenCalledTimes(1);
  });

  it("renders lane dashboard, transcript actions, and replay launcher from review payload", () => {
    mockConfirmedReviewPayload();

    renderWithProviders(
      <Routes>
        <Route element={<PracticalInterviewReviewPage />} path="/practical-interviews/:recordId" />
      </Routes>,
      { route: "/practical-interviews/record-1", locale: "ko" },
    );

    expect(screen.getByText("리뷰 원칙")).toBeInTheDocument();
    expect(screen.getByText("먼저 열기")).toBeInTheDocument();
    expect(screen.getByText("서버 우선순위 레인")).toBeInTheDocument();
    expect(screen.getAllByText("리플레이 준비 상태").length).toBeGreaterThan(0);
    expect(screen.getByText("전사 위에 리플레이 컨텍스트를 유지하세요")).toBeInTheDocument();
    const replaySection = screen.getByText("오디오 리플레이").closest("section");
    expect(replaySection).not.toBeNull();
    const replayScope = within(replaySection!);
    expect(replayScope.getByRole("button", { name: "재생" })).toBeInTheDocument();
    expect(replayScope.getByRole("slider", { name: "리플레이 위치" })).toBeInTheDocument();
    expect(replayScope.getByRole("button", { name: "타임라인" })).toBeInTheDocument();
    expect(replayScope.getByRole("button", { name: "챕터" })).toBeInTheDocument();
    expect(replayScope.getByText("1번 세그먼트")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "전사 리뷰" }));

    expect(screen.getAllByText("I used Redis for caching.").length).toBeGreaterThan(0);
    expect(screen.getByRole("button", { name: "세그먼트 재생" })).toBeInTheDocument();
    fireEvent.click(replayScope.getByRole("button", { name: "챕터" }));
    expect(replayScope.getByRole("button", { name: /Q1\. How did you validate cache invalidation safety\?/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "리플레이 시작" }));

    expect(screen.getByText("이 면접 리플레이")).toBeInTheDocument();
    expect(screen.getByDisplayValue("원본 리플레이")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "질문 리뷰" }));
    expect(screen.getByRole("button", { name: "문답 재생" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "히트맵 앵커 열기" })).toHaveAttribute(
      "href",
      "/resume-versions/resume-version-1/heatmap?selectedAnchor=project%3A31&scope=follow_up&weakOnly=true",
    );
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

    const view = renderWithProviders(
      <Routes>
        <Route element={<PracticalInterviewReviewPage />} path="/practical-interviews/:recordId" />
      </Routes>,
      { route: "/practical-interviews/record-1", locale: "ko" },
    );

    vi.mocked(useInterviewRecordDetailQuery).mockImplementation(loadedDetail);

    expect(() =>
      view.rerender(
        <Routes>
          <Route element={<PracticalInterviewReviewPage />} path="/practical-interviews/:recordId" />
        </Routes>,
      ),
    ).not.toThrow();
    expect(screen.getByText("리뷰 원칙")).toBeInTheDocument();
  });
});
