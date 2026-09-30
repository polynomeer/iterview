import { screen, within } from "@testing-library/react";
import { Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { useInterviewSessionCoverageQuery } from "../../features/interview/api/useInterviewSessionCoverageQuery";
import { useInterviewSessionDetailQuery } from "../../features/interview/api/useInterviewSessionDetailQuery";
import { InterviewResultPage } from "../../pages/interview-result/InterviewResultPage";
import { renderWithProviders } from "../utils";

vi.mock("../../features/interview/api/useInterviewSessionDetailQuery", () => ({ useInterviewSessionDetailQuery: vi.fn() }));
vi.mock("../../features/interview/api/useInterviewSessionCoverageQuery", () => ({ useInterviewSessionCoverageQuery: vi.fn() }));

function q(id: string, overrides: Record<string, unknown> = {}) {
  return {
    id,
    questionId: `question-${id}`,
    title: `Question ${id}`,
    status: "answered",
    isFollowUp: false,
    depth: 0,
    categoryName: "Backend",
    answerAttemptId: `attempt-${id}`,
    resumeEvidence: [],
    ...overrides,
  };
}

function mockSession(overrides: Record<string, unknown> = {}) {
  vi.mocked(useInterviewSessionDetailQuery).mockReturnValue({
    data: {
      id: "session-14",
      endedAt: "Mar 12, 11:00 AM",
      sessionType: "resume_mock",
      interviewMode: "full_coverage",
      interviewModeLabel: "Full Coverage",
      status: "completed",
      resumeVersionId: "resume-version-1",
      currentQuestion: null,
      questions: [q("1"), q("2", { isFollowUp: true, depth: 1 }), q("3", { status: "skipped", answerAttemptId: null })],
      summary: { totalQuestions: 3, answeredQuestions: 2, skippedQuestions: 1, remainingQuestions: 0, averageScoreLabel: "68", weakFacetSummaries: [], skippedFacetSummaries: [], facetSummaries: [] },
      ...overrides,
    },
    isLoading: false,
    isError: false,
  } as never);
}

function renderPage() {
  renderWithProviders(
    <Routes>
      <Route element={<InterviewResultPage />} path="/interview/sessions/:sessionId/result" />
    </Routes>,
    { route: "/interview/sessions/session-14/result", locale: "ko" },
  );
}

describe("InterviewResultPage", () => {
  it("summarises the session and links each question to its feedback and a retry", () => {
    vi.mocked(useInterviewSessionCoverageQuery).mockReturnValue({
      data: {
        overallCoveragePercent: 60,
        defendedCoveragePercent: 40,
        weakFacetSummaries: [{ id: "f1", sectionLabel: "프로젝트", label: "결제 안정화", weakFacets: [], skippedFacets: [] }],
        skippedFacetSummaries: [],
      },
      isError: false,
    } as never);
    mockSession();
    renderPage();

    expect(screen.getByRole("heading", { level: 1, name: "면접 결과" })).toBeInTheDocument();
    expect(screen.getByText("68")).toBeInTheDocument();
    expect(screen.getByText("2 / 3")).toBeInTheDocument();
    expect(screen.getByText("답하지 못한 질문 1개부터 다시 연습하세요.")).toBeInTheDocument();

    const questions = screen.getByRole("region", { name: "질문 3" });
    expect(within(questions).getAllByRole("link", { name: "평가 보기" })[0]).toHaveAttribute("href", "/attempts/attempt-1");
    expect(within(questions).getByText("꼬리질문 · 깊이 2")).toBeInTheDocument();
    expect(within(questions).getByText("건너뜀")).toBeInTheDocument();

    const coverage = screen.getByRole("region", { name: "이력서 점검 범위" });
    expect(within(coverage).getByText("결제 안정화")).toBeInTheDocument();
  });

  it("offers to continue an unfinished session", () => {
    vi.mocked(useInterviewSessionCoverageQuery).mockReturnValue({ data: null, isError: false } as never);
    mockSession({ status: "in_progress", interviewMode: "mock_30" });
    renderPage();

    expect(screen.getByRole("link", { name: "면접 이어서 하기" })).toHaveAttribute("href", "/interview/sessions/session-14");
    expect(screen.queryByRole("region", { name: "이력서 점검 범위" })).not.toBeInTheDocument();
  });
});
