import { screen } from "@testing-library/react";
import { Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { QuestionTreePage } from "../../pages/question-tree/QuestionTreePage";
import { useQuestionDetailQuery } from "../../features/question/api/useQuestionDetailQuery";
import { useQuestionTreeQuery } from "../../features/question/api/useQuestionTreeQuery";

vi.mock("../../features/question/api/useQuestionDetailQuery", () => ({
  useQuestionDetailQuery: vi.fn(),
}));

vi.mock("../../features/question/api/useQuestionTreeQuery", () => ({
  useQuestionTreeQuery: vi.fn(),
}));

import { renderWithProviders } from "../utils";

describe("QuestionTreePage", () => {
  it("renders the question tree workspace and hierarchy", () => {
    vi.mocked(useQuestionDetailQuery).mockReturnValue({
      data: {
        id: "question-42",
        title: "Explain your migration rollback strategy",
        body: "Describe how you limited blast radius and restored service.",
        category: "System Design",
        difficulty: "Advanced",
        tags: [],
        companies: [],
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

    vi.mocked(useQuestionTreeQuery).mockReturnValue({
      data: {
        rootQuestionId: "question-42",
        nodes: [
          {
            id: "question-42",
            title: "Explain your migration rollback strategy",
            depth: 0,
            difficulty: "Advanced",
            relationshipType: null,
            parentQuestionId: null,
            status: "new",
            isRoot: true,
          },
          {
            id: "question-43",
            title: "How did you decide when to trigger rollback?",
            depth: 1,
            difficulty: "Hard",
            relationshipType: "follow_up",
            parentQuestionId: "question-42",
            status: "weak",
            isRoot: false,
          },
        ],
      },
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as never);

    renderWithProviders(
      <Routes>
        <Route element={<QuestionTreePage />} path="/questions/:questionId/tree" />
      </Routes>,
      { route: "/questions/question-42/tree", locale: "ko" },
    );

    expect(screen.getByRole("heading", { name: "루트에서 가장 약한 가지까지 바로 읽으세요" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "질문 트리를 깊이우선으로 읽는 맵 작업공간" })).toBeInTheDocument();
    expect(screen.getAllByText("Explain your migration rollback strategy").length).toBeGreaterThanOrEqual(2);
    expect(screen.getAllByText("How did you decide when to trigger rollback?").length).toBeGreaterThan(0);
    expect(screen.getByText("DFS 준비됨")).toBeInTheDocument();
  });
});
