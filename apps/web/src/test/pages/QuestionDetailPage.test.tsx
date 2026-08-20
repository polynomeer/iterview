import { screen } from "@testing-library/react";
import { Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { QuestionDetailPage } from "../../pages/question-detail/QuestionDetailPage";
import { useQuestionAnswerHistoryQuery } from "../../features/question/api/useQuestionAnswerHistoryQuery";
import { useCreateQuestionLearningMaterialMutation } from "../../features/question/api/useCreateQuestionLearningMaterialMutation";
import { useCreateQuestionReferenceAnswerMutation } from "../../features/question/api/useCreateQuestionReferenceAnswerMutation";
import { useQuestionDetailQuery } from "../../features/question/api/useQuestionDetailQuery";
import { useQuestionLearningMaterialsQuery } from "../../features/question/api/useQuestionLearningMaterialsQuery";
import { useQuestionReferenceAnswersQuery } from "../../features/question/api/useQuestionReferenceAnswersQuery";
import { useRecommendedFollowupsQuery } from "../../features/question/api/useRecommendedFollowupsQuery";
import { useResumeBasedQuestionsQuery } from "../../features/question/api/useResumeBasedQuestionsQuery";
import { useAuth } from "../../shared/auth/useAuth";
import { mockMatchMedia, renderWithProviders } from "../utils";

vi.mock("../../features/question/api/useQuestionDetailQuery", () => ({
  useQuestionDetailQuery: vi.fn(),
}));

vi.mock("../../features/question/api/useQuestionAnswerHistoryQuery", () => ({
  useQuestionAnswerHistoryQuery: vi.fn(),
}));

vi.mock("../../features/question/api/useCreateQuestionReferenceAnswerMutation", () => ({
  useCreateQuestionReferenceAnswerMutation: vi.fn(),
}));

vi.mock("../../features/question/api/useCreateQuestionLearningMaterialMutation", () => ({
  useCreateQuestionLearningMaterialMutation: vi.fn(),
}));

vi.mock("../../features/question/api/useQuestionReferenceAnswersQuery", () => ({
  useQuestionReferenceAnswersQuery: vi.fn(),
}));

vi.mock("../../features/question/api/useQuestionLearningMaterialsQuery", () => ({
  useQuestionLearningMaterialsQuery: vi.fn(),
}));

vi.mock("../../features/question/api/useRecommendedFollowupsQuery", () => ({
  useRecommendedFollowupsQuery: vi.fn(),
}));

vi.mock("../../features/question/api/useResumeBasedQuestionsQuery", () => ({
  useResumeBasedQuestionsQuery: vi.fn(),
}));

vi.mock("../../shared/auth/useAuth", () => ({
  useAuth: vi.fn(),
}));

describe("QuestionDetailPage", () => {
  it("renders question content, metadata, progress, and materials", () => {
    vi.mocked(useAuth).mockReturnValue({
      accessToken: "token",
      isAuthenticated: true,
      setAccessToken: vi.fn(),
      clearSession: vi.fn(),
    });
    vi.mocked(useQuestionDetailQuery).mockReturnValue({
      data: {
        id: "question-12",
        title: "Walk through a difficult migration",
        body: "Explain how you planned the rollout and managed risk.",
        category: "Behavioral",
        difficulty: "Advanced",
        tags: ["migration", "leadership"],
        companies: ["Airbnb", "Uber"],
        roles: ["Backend"],
        relatedSkills: [],
        learningMaterials: [
          {
            id: "material-1",
            title: "Migration notes",
            description: "Examples of phased rollout narratives.",
            resourceTypeLabel: "Note",
            url: "https://example.com/migrations",
          },
        ],
        referenceAnswers: [
          {
            id: "reference-1",
            title: "STAR answer pattern",
            answerText: "Situation, task, action, result.",
            answerFormat: "STAR",
            sourceLabel: "Curated",
            isOfficial: true,
          },
        ],
        userProgressSummary: {
          status: "retry",
          attemptsCount: 3,
          bestScoreLabel: "84",
          lastReviewedLabel: "Mar 8, 2026",
          nextReviewLabel: null,
          masteryLevelLabel: null,
        },
        recommendedQuestions: [],
      },
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as never);
    vi.mocked(useQuestionAnswerHistoryQuery).mockReturnValue({
      data: {
        items: [
          {
            answerAttemptId: "attempt-1",
            submittedAtLabel: "Mar 9, 2:00 PM",
            totalScoreLabel: "Score 84",
            evaluationResultLabel: "Good direction",
            progressStatusLabel: "retry",
          },
        ],
      },
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as never);
    vi.mocked(useQuestionReferenceAnswersQuery).mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as never);
    vi.mocked(useQuestionLearningMaterialsQuery).mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as never);
    vi.mocked(useRecommendedFollowupsQuery).mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as never);
    vi.mocked(useResumeBasedQuestionsQuery).mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as never);
    vi.mocked(useCreateQuestionReferenceAnswerMutation).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as never);
    vi.mocked(useCreateQuestionLearningMaterialMutation).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as never);

    renderWithProviders(
      <Routes>
        <Route element={<QuestionDetailPage />} path="/questions/:questionId" />
      </Routes>,
      { route: "/questions/question-12" },
    );

    expect(screen.getByText("Walk through a difficult migration")).toBeInTheDocument();
    expect(screen.getAllByText("Behavioral")).toHaveLength(2);
    expect(screen.getByText("migration")).toBeInTheDocument();
    expect(screen.getByText("Airbnb")).toBeInTheDocument();
    expect(screen.getByText("Migration notes")).toBeInTheDocument();
    expect(screen.getByText("Model and reference answers")).toBeInTheDocument();
    expect(screen.getByText("STAR answer pattern")).toBeInTheDocument();
    expect(screen.getByText("Your recent attempts on this question")).toBeInTheDocument();
    expect(screen.getByText("Score 84")).toBeInTheDocument();
    expect(screen.getByText("Add your note")).toBeInTheDocument();
    expect(screen.getByText("Add your material")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Start answer" })).toHaveAttribute(
      "href",
      "/questions/question-12/answer",
    );
  });

  it("renders the desktop question detail layout when wide mode is active", () => {
    mockMatchMedia(true);
    vi.mocked(useAuth).mockReturnValue({
      accessToken: "token",
      isAuthenticated: true,
      setAccessToken: vi.fn(),
      clearSession: vi.fn(),
    });
    vi.mocked(useQuestionDetailQuery).mockReturnValue({
      data: {
        id: "question-12",
        title: "Walk through a difficult migration",
        body: "Explain how you planned the rollout and managed risk.",
        category: "Behavioral",
        difficulty: "Advanced",
        tags: ["migration"],
        companies: ["Airbnb"],
        roles: [],
        relatedSkills: [],
        learningMaterials: [],
        referenceAnswers: [],
        userProgressSummary: null,
        recommendedQuestions: [],
      },
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as never);
    vi.mocked(useQuestionAnswerHistoryQuery).mockReturnValue({
      data: { items: [] },
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as never);
    vi.mocked(useQuestionReferenceAnswersQuery).mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as never);
    vi.mocked(useQuestionLearningMaterialsQuery).mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as never);
    vi.mocked(useRecommendedFollowupsQuery).mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as never);
    vi.mocked(useResumeBasedQuestionsQuery).mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as never);
    vi.mocked(useCreateQuestionReferenceAnswerMutation).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as never);
    vi.mocked(useCreateQuestionLearningMaterialMutation).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as never);

    renderWithProviders(
      <Routes>
        <Route element={<QuestionDetailPage />} path="/questions/:questionId" />
      </Routes>,
      { route: "/questions/question-12" },
    );

    expect(screen.getByText("Walk through a difficult migration")).toBeInTheDocument();
    expect(document.querySelector(".question-detail-layout--desktop")).not.toBeNull();
  });
});
