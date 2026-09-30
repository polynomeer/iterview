import userEvent from "@testing-library/user-event";
import { screen, waitFor, within } from "@testing-library/react";
import { Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { InterviewSessionPage } from "../../pages/interview-session/InterviewSessionPage";
import { useAdvanceInterviewSessionMutation } from "../../features/interview/api/useAdvanceInterviewSessionMutation";
import { useInterviewSessionCoverageQuery } from "../../features/interview/api/useInterviewSessionCoverageQuery";
import { useInterviewSessionDetailQuery } from "../../features/interview/api/useInterviewSessionDetailQuery";
import { useSkipInterviewSessionQuestionMutation } from "../../features/interview/api/useSkipInterviewSessionQuestionMutation";
import { useSubmitInterviewSessionAnswerMutation } from "../../features/interview/api/useSubmitInterviewSessionAnswerMutation";
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

vi.mock("../../features/interview/api/useSubmitInterviewSessionAnswerMutation", () => ({
  useSubmitInterviewSessionAnswerMutation: vi.fn(),
}));

vi.mock("../../features/interview/api/useSkipInterviewSessionQuestionMutation", () => ({
  useSkipInterviewSessionQuestionMutation: vi.fn(),
}));

function question(overrides: Record<string, unknown> = {}) {
  return {
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
    tags: [],
    focusSkillNames: [],
    resumeContextSummary: "Tied to your backend platform project.",
    resumeEvidence: [{ id: "e1", type: "resume_project", section: "Projects", sectionLabel: "Projects", label: "Backend platform", snippet: "Led the migration.", confidenceLabel: null }],
    generationRationale: null,
    generationStatus: "generated",
    generationStatusLabel: "Generated",
    revisitLabel: null,
    llmModel: null,
    llmPromptVersion: null,
    answerAttemptId: null,
    threadLabel: "Follow-up",
    ...overrides,
  };
}

function session(current: ReturnType<typeof question>, overrides: Record<string, unknown> = {}) {
  return {
    id: "session-1",
    startedAt: null,
    endedAt: null,
    sessionType: "resume_mock",
    interviewMode: "mock_30",
    interviewModeLabel: "Mock 30",
    status: "in_progress",
    resumeVersionId: "resume-7",
    currentQuestion: current,
    questions: [question({ id: "sq-1", title: "Describe your architecture", status: "answered", isFollowUp: false, depth: 0, orderIndex: 0 }), current],
    summary: { totalQuestions: 3, answeredQuestions: 1, skippedQuestions: 0, remainingQuestions: 1, averageScoreLabel: null, weakFacetSummaries: [], skippedFacetSummaries: [], facetSummaries: [] },
    ...overrides,
  };
}

const submit = vi.fn();
const skip = vi.fn();
const advance = vi.fn();
const refetch = vi.fn();

function mockSession(data: unknown) {
  vi.mocked(useInterviewSessionDetailQuery).mockReturnValue({ data, isLoading: false, isError: false, error: null, refetch } as never);
}

beforeEach(() => {
  mockNavigate.mockReset();
  submit.mockReset().mockResolvedValue({ status: "in_progress" });
  skip.mockReset().mockResolvedValue({});
  advance.mockReset().mockResolvedValue({});
  refetch.mockReset();
  vi.mocked(useSubmitInterviewSessionAnswerMutation).mockReturnValue({ mutateAsync: submit, isPending: false, error: null } as never);
  vi.mocked(useSkipInterviewSessionQuestionMutation).mockReturnValue({ mutateAsync: skip, isPending: false, error: null } as never);
  vi.mocked(useAdvanceInterviewSessionMutation).mockReturnValue({ mutateAsync: advance, isPending: false, error: null } as never);
  vi.mocked(useInterviewSessionCoverageQuery).mockReturnValue({ data: null } as never);
});

function renderSession() {
  renderWithProviders(
    <Routes>
      <Route element={<InterviewSessionPage />} path="/interview/sessions/:sessionId" />
    </Routes>,
    { route: "/interview/sessions/session-1" },
  );
}

describe("InterviewSessionPage", () => {
  it("shows one question with its place in the flow and the resume part it probes", () => {
    mockSession(session(question()));
    renderSession();

    expect(screen.getByRole("heading", { level: 1, name: "Explain the scaling trade-off" })).toBeInTheDocument();
    expect(screen.getByText(/Follow-up · depth 2/)).toBeInTheDocument();
    expect(screen.getByText("2 / 3")).toBeInTheDocument();
    expect(screen.getByText("Tied to your backend platform project.")).toBeInTheDocument();
    const flow = screen.getByRole("region", { name: "Question flow" });
    expect(within(flow).getAllByRole("listitem")).toHaveLength(2);
    expect(within(flow).getByText("Answered")).toBeInTheDocument();
  });

  it("grades the answer against the session's own resume version and stays in the session", async () => {
    mockSession(session(question()));
    renderSession();

    await userEvent.type(screen.getByRole("textbox", { name: "Your answer" }), "I would talk through the rollback path.");
    await userEvent.click(screen.getByRole("button", { name: "Submit answer" }));

    await waitFor(() => expect(refetch).toHaveBeenCalled());
    expect(submit).toHaveBeenCalledWith({
      sessionId: "session-1",
      payload: { sessionQuestionId: "sq-2", answerMode: "text", contentText: "I would talk through the rollback path.", resumeVersionId: "resume-7" },
    });
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("goes to the result when the last answer completes the session", async () => {
    submit.mockResolvedValue({ status: "completed" });
    mockSession(session(question()));
    renderSession();

    await userEvent.type(screen.getByRole("textbox", { name: "Your answer" }), "Final answer.");
    await userEvent.click(screen.getByRole("button", { name: "Submit answer" }));

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith("/interview/sessions/session-1/result"));
  });

  it("skips a question and moves on once it is answered", async () => {
    mockSession(session(question()));
    renderSession();
    await userEvent.click(screen.getByRole("button", { name: "Skip" }));
    expect(skip).toHaveBeenCalledWith({ sessionId: "session-1", payload: { sessionQuestionId: "sq-2" } });
  });

  it("offers the next question after the current one is answered", async () => {
    mockSession(session(question({ status: "answered" })));
    renderSession();

    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Next question" }));
    expect(advance).toHaveBeenCalledWith("session-1");
  });
});
