import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { ResultAnalysisPage } from "../../pages/result-analysis/ResultAnalysisPage";
import { useResultAnalysisQuery } from "../../features/result/api/useResultAnalysisQuery";
import { ApiClientError } from "../../shared/api/errors";
import { mockMatchMedia, renderWithProviders } from "../utils";

vi.mock("../../features/result/api/useResultAnalysisQuery", () => ({
  useResultAnalysisQuery: vi.fn(),
}));

describe("ResultAnalysisPage", () => {
  it("renders score, dimension breakdown, feedback, and next action", () => {
    vi.mocked(useResultAnalysisQuery).mockReturnValue({
      data: {
        answerAttemptId: "attempt-1",
        questionId: "question-3",
        questionTitle: "Explain your architecture review process",
        totalScore: "91",
        evaluationResult: "Strong pass",
        dimensions: [
          { id: "structure", label: "Structure", value: "92" },
          { id: "specificity", label: "Specificity", value: "89" },
        ],
        detailedFeedback: "Your answer was well structured but needed more tradeoff detail.",
        strengthSummary: "Clear framing and strong context setting.",
        weaknessSummary: "The tradeoff discussion stayed shallow.",
        recommendedNextStep: "Rehearse a version that contrasts two alternatives directly.",
        narrativeLocale: "en",
        narrativeModelLabel: "gpt-test",
        strengthPoints: ["You framed the problem early."],
        improvementPoints: ["Add explicit tradeoff comparisons."],
        missedPoints: ["Call out failure modes."],
        modelAnswer: {
          text: "A stronger answer would explain the review goals, alternatives, tradeoffs, and rollout risks.",
          sourceType: "ai_generated",
          contentLocale: "en",
          llmModel: "gpt-test",
        },
        feedbackItems: [
          {
            id: "feedback-1",
            title: "Strong framing",
            description: "You set context before diving into details.",
            tone: "positive",
          },
        ],
        progressStatusLabel: "improving",
        archiveDecisionLabel: "Keep practicing",
        nextReviewLabel: "Mar 10, 2026",
        skillImpact: [],
        weakPatterns: [],
        followUpRecommendations: [],
      },
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as never);

    renderWithProviders(
      <Routes>
        <Route element={<ResultAnalysisPage />} path="/attempts/:answerAttemptId" />
      </Routes>,
      { route: "/attempts/attempt-1" },
    );

    expect(screen.getByText("91")).toBeInTheDocument();
    expect(screen.getByText("Strong pass")).toBeInTheDocument();
    expect(screen.getByText("Structure")).toBeInTheDocument();
    expect(screen.getByText("How to improve this answer")).toBeInTheDocument();
    expect(screen.getByText("Suggested strong answer")).toBeInTheDocument();
    expect(screen.getByText("Strong framing")).toBeInTheDocument();
    expect(screen.getAllByText("Decision Keep practicing").length).toBeGreaterThan(0);
    expect(screen.getByRole("link", { name: "Try this question again" })).toHaveAttribute(
      "href",
      "/questions/question-3/answer",
    );
  });

  it("renders the desktop result layout when wide mode is active", () => {
    mockMatchMedia(true);
    vi.mocked(useResultAnalysisQuery).mockReturnValue({
      data: {
        answerAttemptId: "attempt-1",
        questionId: "question-3",
        questionTitle: "Explain your architecture review process",
        totalScore: "91",
        evaluationResult: "Strong pass",
        dimensions: [{ id: "structure", label: "Structure", value: "92" }],
        detailedFeedback: null,
        strengthSummary: null,
        weaknessSummary: null,
        recommendedNextStep: null,
        narrativeLocale: null,
        narrativeModelLabel: null,
        strengthPoints: [],
        improvementPoints: [],
        missedPoints: [],
        modelAnswer: null,
        feedbackItems: [],
        progressStatusLabel: "improving",
        archiveDecisionLabel: "Keep practicing",
        nextReviewLabel: null,
        skillImpact: [],
        weakPatterns: [],
        followUpRecommendations: [],
      },
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as never);

    renderWithProviders(
      <Routes>
        <Route element={<ResultAnalysisPage />} path="/attempts/:answerAttemptId" />
      </Routes>,
      { route: "/attempts/attempt-1" },
    );

    expect(screen.getByText("Strong pass")).toBeInTheDocument();
    expect(document.querySelector(".result-analysis-layout--desktop")).not.toBeNull();
  });

  it("explains a missing evaluation instead of showing the raw backend message", () => {
    vi.mocked(useResultAnalysisQuery).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new ApiClientError(404, "Answer attempt not found: 1"),
      refetch: vi.fn(),
    } as never);

    renderWithProviders(
      <Routes>
        <Route element={<ResultAnalysisPage />} path="/attempts/:answerAttemptId" />
      </Routes>,
      { route: "/attempts/1", locale: "ko" },
    );

    expect(screen.getByRole("alert")).toHaveTextContent("평가 결과를 찾을 수 없어요");
    expect(screen.queryByText(/Answer attempt not found/)).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "연습으로 돌아가기" })).toHaveAttribute("href", "/questions");
  });

  it("offers a retry for server failures", async () => {
    const refetch = vi.fn();
    vi.mocked(useResultAnalysisQuery).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new ApiClientError(500, "NullPointerException at ResultService"),
      refetch,
    } as never);

    renderWithProviders(
      <Routes>
        <Route element={<ResultAnalysisPage />} path="/attempts/:answerAttemptId" />
      </Routes>,
      { route: "/attempts/1", locale: "ko" },
    );

    expect(screen.getByRole("alert")).toHaveTextContent("답변 결과를 불러오지 못했습니다.");
    expect(screen.queryByText(/NullPointerException/)).not.toBeInTheDocument();
    await userEvent.setup().click(screen.getByRole("button", { name: "다시 시도" }));
    expect(refetch).toHaveBeenCalled();
  });
});
