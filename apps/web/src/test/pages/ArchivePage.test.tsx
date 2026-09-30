import { screen } from "@testing-library/react";
import { Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { ArchivePage } from "../../pages/archive/ArchivePage";
import { useArchiveQuery } from "../../features/archive/api/useArchiveQuery";
import { mockMatchMedia, renderWithProviders } from "../utils";

vi.mock("../../features/archive/api/useArchiveQuery", () => ({
  useArchiveQuery: vi.fn(),
}));

describe("ArchivePage", () => {
  it("renders the empty archive state", () => {
    vi.mocked(useArchiveQuery).mockReturnValue({
      data: {
        items: [],
        filters: {
          categories: [],
          companies: [],
          tags: [],
        },
      },
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as never);

    renderWithProviders(
      <Routes>
        <Route element={<ArchivePage />} path="/review/done" />
      </Routes>,
      { route: "/review/done", locale: "ko" },
    );

    expect(screen.getByText("아카이브가 비어 있습니다")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "연습으로 돌아가기" })).toHaveAttribute("href", "/questions");
  });

  it("renders archived questions when data exists", () => {
    vi.mocked(useArchiveQuery).mockReturnValue({
      data: {
        items: [
          {
            id: "archive-4",
            questionId: "question-4",
            questionTitle: "Design a search index",
            summary: "You explained indexing and ranking tradeoffs clearly.",
            difficultyLabel: "System Design",
            archivedAtLabel: "Mar 13, 9:00 AM",
            totalAttemptCountLabel: "4 attempts",
            bestScoreLabel: "Best score 95",
            archivedStatusLabel: "Archived",
            sourceType: "interview",
            sourceLabel: "Mock interview",
            sourceBadgeLabel: "Interview",
            sourceSessionId: "session-4",
            sourceSessionQuestionId: "sq-4",
            isFollowUp: true,
          },
        ],
        filters: {
          categories: [],
          companies: [],
          tags: [],
        },
      },
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as never);

    renderWithProviders(
      <Routes>
        <Route element={<ArchivePage />} path="/review/done" />
      </Routes>,
      { route: "/review/done", locale: "ko" },
    );

    expect(screen.getByText("정리된 질문")).toBeInTheDocument();
    expect(screen.getAllByText("Design a search index")).toHaveLength(3);
    expect(screen.getAllByText("Best score 95")).toHaveLength(2);
    expect(screen.getByText("Interview")).toBeInTheDocument();
    expect(screen.getAllByText("후속 질문")).toHaveLength(2);
    expect(screen.getByRole("link", { name: "세션 보기" })).toHaveAttribute(
      "href",
      "/interview/sessions/session-4",
    );
  });

  it("renders the desktop archive layout when wide mode is active", () => {
    mockMatchMedia(true);
    vi.mocked(useArchiveQuery).mockReturnValue({
      data: {
        items: [
          {
            id: "archive-4",
            questionId: "question-4",
            questionTitle: "Design a search index",
            summary: "You explained indexing and ranking tradeoffs clearly.",
            difficultyLabel: "System Design",
            archivedAtLabel: "Mar 13, 9:00 AM",
            totalAttemptCountLabel: "4 attempts",
            bestScoreLabel: "Best score 95",
            archivedStatusLabel: "Archived",
            sourceType: "practice",
            sourceLabel: "Practice loop",
            sourceBadgeLabel: "Practice",
            sourceSessionId: null,
            sourceSessionQuestionId: null,
            isFollowUp: false,
          },
        ],
        filters: {
          categories: [],
          companies: [],
          tags: [],
        },
      },
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as never);

    renderWithProviders(
      <Routes>
        <Route element={<ArchivePage />} path="/review/done" />
      </Routes>,
      { route: "/review/done", locale: "ko" },
    );

    expect(screen.getAllByText("Design a search index")).toHaveLength(3);
    expect(document.querySelector(".archive-layout--desktop")).not.toBeNull();
  });
});
