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
        <Route element={<ArchivePage />} path="/archive" />
      </Routes>,
      { route: "/archive" },
    );

    expect(screen.getByText("Archive is empty")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Back to practice" })).toHaveAttribute("href", "/practice");
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
        <Route element={<ArchivePage />} path="/archive" />
      </Routes>,
      { route: "/archive" },
    );

    expect(screen.getByText("Mastered questions")).toBeInTheDocument();
    expect(screen.getByText("Design a search index")).toBeInTheDocument();
    expect(screen.getByText("Best score 95")).toBeInTheDocument();
    expect(screen.getByText("Interview")).toBeInTheDocument();
    expect(screen.getByText("Follow-up")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "View session" })).toHaveAttribute(
      "href",
      "/interviews/session-4",
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
        <Route element={<ArchivePage />} path="/archive" />
      </Routes>,
      { route: "/archive" },
    );

    expect(screen.getByText("Design a search index")).toBeInTheDocument();
    expect(document.querySelector(".archive-layout--desktop")).not.toBeNull();
  });
});
