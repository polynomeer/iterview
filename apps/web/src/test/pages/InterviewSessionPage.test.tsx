import userEvent from "@testing-library/user-event";
import { screen, waitFor } from "@testing-library/react";
import { Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { InterviewSessionPage } from "../../pages/interview-session/InterviewSessionPage";
import { useAdvanceInterviewSessionMutation } from "../../features/interview/api/useAdvanceInterviewSessionMutation";
import { useInterviewSessionCoverageQuery } from "../../features/interview/api/useInterviewSessionCoverageQuery";
import { useInterviewSessionDetailQuery } from "../../features/interview/api/useInterviewSessionDetailQuery";
import { useInterviewSessionResumeMapQuery } from "../../features/interview/api/useInterviewSessionResumeMapQuery";
import { useSkipInterviewSessionQuestionMutation } from "../../features/interview/api/useSkipInterviewSessionQuestionMutation";
import { useSubmitInterviewSessionAnswerMutation } from "../../features/interview/api/useSubmitInterviewSessionAnswerMutation";
import { useResumeListQuery } from "../../features/resume/api/useResumeListQuery";
import { renderWithProviders } from "../utils";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");

  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock("../../features/interview/api/useAdvanceInterviewSessionMutation", () => ({
  useAdvanceInterviewSessionMutation: vi.fn(),
}));

vi.mock("../../features/interview/api/useInterviewSessionDetailQuery", () => ({
  useInterviewSessionDetailQuery: vi.fn(),
}));

vi.mock("../../features/interview/api/useInterviewSessionCoverageQuery", () => ({
  useInterviewSessionCoverageQuery: vi.fn(),
}));

vi.mock("../../features/interview/api/useInterviewSessionResumeMapQuery", () => ({
  useInterviewSessionResumeMapQuery: vi.fn(),
}));

vi.mock("../../features/interview/api/useSubmitInterviewSessionAnswerMutation", () => ({
  useSubmitInterviewSessionAnswerMutation: vi.fn(),
}));

vi.mock("../../features/interview/api/useSkipInterviewSessionQuestionMutation", () => ({
  useSkipInterviewSessionQuestionMutation: vi.fn(),
}));

vi.mock("../../features/resume/api/useResumeListQuery", () => ({
  useResumeListQuery: vi.fn(),
}));

describe("InterviewSessionPage", () => {
  it("renders threaded session questions and AI follow-up metadata", () => {
    mockNavigate.mockReset();
    const refetch = vi.fn();
    vi.mocked(useResumeListQuery).mockReturnValue({
      data: { items: [] },
      isLoading: false,
      isError: false,
      error: null,
    } as never);
    vi.mocked(useInterviewSessionDetailQuery).mockReturnValue({
      data: {
        id: "session-1",
        startedAt: "Mar 12, 3:00 PM",
        endedAt: null,
        sessionType: "resume_mock",
        interviewMode: "full_coverage",
        interviewModeLabel: "Full Coverage",
        status: "in_progress",
        resumeVersionId: "resume-1",
        currentQuestion: {
          id: "sq-2",
          questionId: null,
          title: "Explain the scaling trade-off",
          promptText: null,
          bodyText: "Interviewer follow-up context.",
          contentLocale: "en",
          difficultyLabel: "Hard",
          orderIndex: 1,
          status: "current",
          sourceType: "ai_follow_up",
          sourceLabel: "AI follow-up",
          parentSessionQuestionId: "sq-1",
          isFollowUp: true,
          depth: 1,
          categoryName: "System Design",
          tags: ["scaling"],
          focusSkillNames: ["System Design"],
          resumeContextSummary: "Tied to your backend platform project.",
          resumeEvidence: [
            {
              id: "evidence-1",
              type: "resume_project",
              section: "Projects",
              label: "Backend platform",
              snippet: "Led phased rollout of the backend platform migration with rollback safeguards.",
              confidenceLabel: "92% match",
            },
            {
              id: "evidence-2",
              type: "resume_experience",
              section: "Experience",
              label: "Platform engineer",
              snippet: "Scaled traffic handling by redesigning queue backpressure.",
              confidenceLabel: null,
            },
          ],
          generationRationale: "Weak facet re-validation on trade-offs after the first answer.",
          generationStatus: "coverage_extended",
          generationStatusLabel: "Coverage Extended",
          revisitLabel: "Revisiting a weakly defended point",
          llmModel: "gpt",
          llmPromptVersion: "v2",
          answerAttemptId: null,
          threadLabel: "Follow-up · Depth 1",
        },
        questions: [
          {
            id: "sq-1",
            questionId: "q-1",
            title: "Describe your architecture",
            promptText: null,
            bodyText: "Seed question",
            contentLocale: "ko",
            difficultyLabel: "Medium",
            orderIndex: 0,
            status: "answered",
            sourceType: "seeded",
            sourceLabel: "Seeded",
            parentSessionQuestionId: null,
            isFollowUp: false,
            depth: 0,
            categoryName: "System Design",
            tags: ["architecture"],
            focusSkillNames: [],
            resumeContextSummary: null,
            resumeEvidence: [],
            generationRationale: null,
            generationStatus: "not_requested",
            generationStatusLabel: "Not Requested",
            revisitLabel: null,
            llmModel: null,
            llmPromptVersion: null,
            answerAttemptId: "attempt-1",
            threadLabel: "Seeded question",
          },
          {
            id: "sq-2",
            questionId: null,
            title: "Explain the scaling trade-off",
            promptText: null,
            bodyText: "Interviewer follow-up context.",
            contentLocale: "en",
            difficultyLabel: "Hard",
            orderIndex: 1,
            status: "current",
            sourceType: "ai_follow_up",
            sourceLabel: "AI follow-up",
            parentSessionQuestionId: "sq-1",
            isFollowUp: true,
            depth: 1,
            categoryName: "System Design",
            tags: ["scaling"],
            focusSkillNames: ["System Design"],
            resumeContextSummary: "Tied to your backend platform project.",
            resumeEvidence: [
              {
                id: "evidence-1",
                type: "resume_project",
                section: "Projects",
                label: "Backend platform",
                snippet: "Led phased rollout of the backend platform migration with rollback safeguards.",
                confidenceLabel: "92% match",
              },
              {
                id: "evidence-2",
                type: "resume_experience",
                section: "Experience",
                label: "Platform engineer",
                snippet: "Scaled traffic handling by redesigning queue backpressure.",
                confidenceLabel: null,
              },
            ],
            generationRationale: "Weak facet re-validation on trade-offs after the first answer.",
            generationStatus: "coverage_extended",
            generationStatusLabel: "Coverage Extended",
            revisitLabel: "Revisiting a weakly defended point",
            llmModel: "gpt",
            llmPromptVersion: "v2",
            answerAttemptId: null,
            threadLabel: "Follow-up · Depth 1",
          },
        ],
        summary: {
          totalQuestions: 2,
          answeredQuestions: 1,
          skippedQuestions: 0,
          remainingQuestions: 1,
          averageScoreLabel: "80",
          weakFacetSummaries: [
            {
              id: "facet-1",
              section: "project",
              sectionLabel: "Project",
              label: "Backend platform",
              sourceRecordType: "resume_project_snapshot",
              sourceRecordId: "1",
              sourceJoinKey: "project:1",
              defendedFacets: ["scope"],
              weakFacets: ["tradeoffs"],
              skippedFacets: [],
              unaskedFacets: [],
              weakFacetCount: 1,
              skippedFacetCount: 0,
              defendedFacetCount: 1,
              unaskedFacetCount: 0,
            },
          ],
          skippedFacetSummaries: [
            {
              id: "facet-2",
              section: "experience",
              sectionLabel: "Experience",
              label: "Platform engineer",
              sourceRecordType: "resume_experience_snapshot",
              sourceRecordId: "2",
              sourceJoinKey: "experience:2",
              defendedFacets: [],
              weakFacets: [],
              skippedFacets: ["failure mode"],
              unaskedFacets: [],
              weakFacetCount: 0,
              skippedFacetCount: 1,
              defendedFacetCount: 0,
              unaskedFacetCount: 0,
            },
          ],
          facetSummaries: [],
        },
      },
      isLoading: false,
      isError: false,
      error: null,
      refetch,
    } as never);
    vi.mocked(useInterviewSessionCoverageQuery).mockReturnValue({
      data: {
        sessionId: "session-1",
        interviewMode: "full_coverage",
        interviewModeLabel: "Full Coverage",
        overallCoveragePercent: 84,
        defendedCoveragePercent: 61,
        weakFacetSummaries: [],
        skippedFacetSummaries: [],
        facetSummaries: [],
        evidenceItems: [
          {
            id: "coverage-1",
            section: "Projects",
            label: "Backend platform",
            snippet: "Led phased rollout of the backend platform migration with rollback safeguards.",
            coverageStatus: "defended",
            coverageStatusLabel: "Defended",
            linkedQuestionIds: ["sq-2"],
          },
        ],
      },
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as never);
    vi.mocked(useInterviewSessionResumeMapQuery).mockReturnValue({
      data: {
        sessionId: "session-1",
        resumeVersionId: "resume-1",
        weakFacetSummaries: [],
        skippedFacetSummaries: [],
        facetSummaries: [],
        evidenceItems: [
          {
            id: "resume-map-1",
            section: "Projects",
            label: "Backend platform",
            snippet: "Led phased rollout of the backend platform migration with rollback safeguards.",
            sourceRecordType: "resume_project_snapshot",
            sourceRecordId: "1",
            coverageStatus: "defended",
            coverageStatusLabel: "Defended",
            relatedQuestions: [
              {
                sessionQuestionId: "sq-2",
                title: "Explain the scaling trade-off",
                sourceType: "ai_follow_up",
                sourceLabel: "Ai Follow Up",
              },
            ],
          },
        ],
      },
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as never);
    vi.mocked(useSubmitInterviewSessionAnswerMutation).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
      isError: false,
      error: null,
    } as never);
    vi.mocked(useSkipInterviewSessionQuestionMutation).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
      isError: false,
      error: null,
    } as never);
    vi.mocked(useAdvanceInterviewSessionMutation).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
      isError: false,
      error: null,
    } as never);

    renderWithProviders(
      <Routes>
        <Route element={<InterviewSessionPage />} path="/interview/sessions/:sessionId" />
      </Routes>,
      { route: "/interview/sessions/session-1" },
    );

    expect(screen.getByText("Session question flow")).toBeInTheDocument();
    expect(screen.getByText("One connected preparation loop")).toBeInTheDocument();
    expect(screen.getByText("AI follow-up")).toBeInTheDocument();
    expect(screen.getAllByText("Tied to your backend platform project.")).toHaveLength(3);
    expect(screen.getAllByText("Explain the scaling trade-off").length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText("Based on your resume")).toHaveLength(2);
    expect(screen.getAllByText("English generated").length).toBeGreaterThanOrEqual(1);
    expect(
      screen.getAllByText('"Led phased rollout of the backend platform migration with rollback safeguards."'),
    ).toHaveLength(3);
    expect(screen.getByText("Project and experience interview coverage")).toBeInTheDocument();
    expect(screen.getAllByText("Revisiting a weakly defended point").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Needs more defense")).toBeInTheDocument();
    expect(screen.getByText("Skipped recovery")).toBeInTheDocument();
    expect(screen.getByText(/Weak facets: tradeoffs/i)).toBeInTheDocument();
    expect(screen.getByText("Overall coverage 84%")).toBeInTheDocument();
    expect(screen.getAllByText("Skipped").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByRole("button", { name: "Skip question" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Next question" })).toBeDisabled();
    expect(screen.getByText("Answer or skip the current question before moving on.")).toBeInTheDocument();
    expect(screen.getByText("Start with the exact claim.")).toBeInTheDocument();
    expect(screen.getByText("2 source-of-truth snippets attached")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Explain the scaling trade-off" })).toBeInTheDocument();
  });

  it("keeps the user in the session after submitting an in-progress answer", async () => {
    mockNavigate.mockReset();
    const refetch = vi.fn().mockResolvedValue({
      data: {
        status: "in_progress",
      },
    });
    const coverageRefetch = vi.fn().mockResolvedValue({});
    const resumeMapRefetch = vi.fn().mockResolvedValue({});
    const mutateAsync = vi.fn().mockResolvedValue({
      status: "in_progress",
      nextQuestion: {
        id: "sq-3",
        title: "What changed after the rollout?",
      },
      summary: {
        totalQuestions: 2,
        answeredQuestions: 2,
        skippedQuestions: 0,
        remainingQuestions: 0,
      },
    });

    vi.mocked(useResumeListQuery).mockReturnValue({
      data: { items: [] },
      isLoading: false,
      isError: false,
      error: null,
    } as never);
    vi.mocked(useInterviewSessionDetailQuery).mockReturnValue({
      data: {
        id: "session-1",
        startedAt: "Mar 12, 3:00 PM",
        endedAt: null,
        sessionType: "resume_mock",
        interviewMode: "full_coverage",
        interviewModeLabel: "Full Coverage",
        status: "in_progress",
        resumeVersionId: "resume-1",
        currentQuestion: {
          id: "sq-2",
          questionId: null,
          title: "Explain the scaling trade-off",
          promptText: null,
          bodyText: "Interviewer follow-up context.",
          contentLocale: "en",
          difficultyLabel: "Hard",
          orderIndex: 1,
          status: "current",
          sourceType: "ai_follow_up",
          sourceLabel: "AI follow-up",
          parentSessionQuestionId: "sq-1",
          isFollowUp: true,
          depth: 1,
          categoryName: "System Design",
          tags: ["scaling"],
          focusSkillNames: ["System Design"],
          resumeContextSummary: "Tied to your backend platform project.",
          resumeEvidence: [],
          generationRationale: null,
          generationStatus: "completed",
          generationStatusLabel: "Completed",
          revisitLabel: null,
          llmModel: null,
          llmPromptVersion: null,
          answerAttemptId: null,
          threadLabel: "Follow-up · Depth 1",
        },
        questions: [],
        summary: {
          totalQuestions: 2,
          answeredQuestions: 1,
          skippedQuestions: 0,
          remainingQuestions: 1,
          averageScoreLabel: "80",
          weakFacetSummaries: [],
          skippedFacetSummaries: [],
          facetSummaries: [],
        },
      },
      isLoading: false,
      isError: false,
      error: null,
      refetch,
    } as never);
    vi.mocked(useInterviewSessionCoverageQuery).mockReturnValue({
      data: null,
      isLoading: false,
      isError: false,
      error: null,
      refetch: coverageRefetch,
    } as never);
    vi.mocked(useInterviewSessionResumeMapQuery).mockReturnValue({
      data: null,
      isLoading: false,
      isError: false,
      error: null,
      refetch: resumeMapRefetch,
    } as never);
    vi.mocked(useSubmitInterviewSessionAnswerMutation).mockReturnValue({
      mutateAsync,
      isPending: false,
      isError: false,
      error: null,
    } as never);
    vi.mocked(useSkipInterviewSessionQuestionMutation).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
      isError: false,
      error: null,
    } as never);
    vi.mocked(useAdvanceInterviewSessionMutation).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
      isError: false,
      error: null,
    } as never);

    const user = userEvent.setup();

    renderWithProviders(
      <Routes>
        <Route element={<InterviewSessionPage />} path="/interview/sessions/:sessionId" />
      </Routes>,
      { route: "/interview/sessions/session-1" },
    );

    await user.type(
      screen.getByRole("textbox"),
      "I would talk through the migration trade-offs and rollback path.",
    );
    await user.click(screen.getByRole("button", { name: "Submit answer" }));

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalled();
      expect(refetch).toHaveBeenCalled();
    });

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("navigates to the final result route when answer submission completes the session", async () => {
    mockNavigate.mockReset();
    const mutateAsync = vi.fn().mockResolvedValue({
      status: "completed",
      summary: {
        totalQuestions: 2,
        answeredQuestions: 2,
        skippedQuestions: 0,
        remainingQuestions: 0,
      },
    });

    vi.mocked(useResumeListQuery).mockReturnValue({
      data: { items: [] },
      isLoading: false,
      isError: false,
      error: null,
    } as never);
    vi.mocked(useInterviewSessionDetailQuery).mockReturnValue({
      data: {
        id: "session-1",
        startedAt: "Mar 12, 3:00 PM",
        endedAt: null,
        sessionType: "resume_mock",
        interviewMode: "mock_30",
        interviewModeLabel: "Mock 30",
        status: "in_progress",
        resumeVersionId: "resume-1",
        currentQuestion: {
          id: "sq-2",
          questionId: null,
          title: "Explain the scaling trade-off",
          promptText: null,
          bodyText: "Interviewer follow-up context.",
          contentLocale: "en",
          difficultyLabel: "Hard",
          orderIndex: 1,
          status: "current",
          sourceType: "ai_follow_up",
          sourceLabel: "AI follow-up",
          parentSessionQuestionId: "sq-1",
          isFollowUp: true,
          depth: 1,
          categoryName: "System Design",
          tags: ["scaling"],
          focusSkillNames: ["System Design"],
          resumeContextSummary: "Tied to your backend platform project.",
          resumeEvidence: [],
          generationRationale: null,
          generationStatus: "completed",
          generationStatusLabel: "Completed",
          revisitLabel: null,
          llmModel: null,
          llmPromptVersion: null,
          answerAttemptId: null,
          threadLabel: "Follow-up · Depth 1",
        },
        questions: [],
        summary: {
          totalQuestions: 2,
          answeredQuestions: 1,
          skippedQuestions: 0,
          remainingQuestions: 1,
          averageScoreLabel: "80",
          weakFacetSummaries: [],
          skippedFacetSummaries: [],
          facetSummaries: [],
        },
      },
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as never);
    vi.mocked(useInterviewSessionCoverageQuery).mockReturnValue({
      data: null,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as never);
    vi.mocked(useInterviewSessionResumeMapQuery).mockReturnValue({
      data: null,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as never);
    vi.mocked(useSubmitInterviewSessionAnswerMutation).mockReturnValue({
      mutateAsync,
      isPending: false,
      isError: false,
      error: null,
    } as never);
    vi.mocked(useSkipInterviewSessionQuestionMutation).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
      isError: false,
      error: null,
    } as never);
    vi.mocked(useAdvanceInterviewSessionMutation).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
      isError: false,
      error: null,
    } as never);

    const user = userEvent.setup();

    renderWithProviders(
      <Routes>
        <Route element={<InterviewSessionPage />} path="/interview/sessions/:sessionId" />
      </Routes>,
      { route: "/interview/sessions/session-1" },
    );

    await user.type(screen.getByRole("textbox"), "Final answer for the session.");
    await user.click(screen.getByRole("button", { name: "Submit answer" }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith(
        "/interview/sessions/session-1/result",
      );
    });
  });
});
