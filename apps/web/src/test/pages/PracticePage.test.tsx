import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { PracticePage } from "../../pages/practice/PracticePage";
import { usePracticeQuestionsQuery } from "../../features/practice/api/usePracticeQuestionsQuery";
import { mapPracticeListResponseDtoToModel } from "../../entities/practice/model";
import { LocationDisplay, mockMatchMedia, renderWithProviders } from "../utils";

vi.mock("../../features/practice/api/usePracticeQuestionsQuery", () => ({
  usePracticeQuestionsQuery: vi.fn(),
}));

describe("PracticePage", () => {
  it("maps array responses from the questions API into visible practice items", () => {
    const model = mapPracticeListResponseDtoToModel([
      {
        id: "question-21",
        title: "Explain caching",
        prompt: "Discuss eviction and invalidation tradeoffs.",
        category: "System Design",
        company: "General",
        difficulty: "Intermediate",
        status: "new",
      },
    ]);

    expect(model.items).toHaveLength(1);
    expect(model.items[0]).toMatchObject({
      id: "question-21",
      title: "Explain caching",
      categoryLabel: "System Design",
    });
    expect(model.filters).toEqual({
      categories: [],
      companies: [],
      difficulties: [],
      statuses: [],
    });
    expect(model.page).toBe(1);
    expect(model.hasMore).toBe(false);
  });

  it("updates search params when the user searches and changes filters", async () => {
    vi.mocked(usePracticeQuestionsQuery).mockReturnValue({
      data: {
        items: [
          {
            id: "question-21",
            title: "Explain caching",
            prompt: "Discuss eviction and invalidation tradeoffs.",
            categoryLabel: "System Design",
            companyLabel: "General",
            difficultyLabel: "Intermediate",
            statusLabel: "new",
            progressSummaryLabel: null,
          },
        ],
        filters: {
          categories: [{ id: "system-design", label: "System Design" }],
          companies: [{ id: "meta", label: "Meta" }],
          difficulties: [{ id: "intermediate", label: "Intermediate" }],
          statuses: [{ id: "retry", label: "Retry" }],
        },
        page: 1,
        hasMore: false,
      },
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as never);

    const user = userEvent.setup();

    renderWithProviders(
      <Routes>
        <Route
          element={
            <>
              <PracticePage />
              <LocationDisplay />
            </>
          }
          path="/practice"
        />
      </Routes>,
      { route: "/practice", locale: "ko" },
    );

    await user.type(screen.getAllByRole("searchbox", { name: "질문 검색" })[0], "cache");
    expect(screen.getByTestId("location-display")).toHaveTextContent("/practice?search=cache");

    await user.click(screen.getByRole("button", { name: "System Design" }));
    expect(screen.getByTestId("location-display")).toHaveTextContent(
      "/practice?category=system-design&search=cache",
    );
  });

  it("renders the desktop browsing layout when wide mode is active", () => {
    mockMatchMedia(true);
    vi.mocked(usePracticeQuestionsQuery).mockReturnValue({
      data: {
        items: [
          {
            id: "question-21",
            title: "Explain caching",
            prompt: "Discuss eviction and invalidation tradeoffs.",
            categoryLabel: "System Design",
            companyLabel: "General",
            difficultyLabel: "Intermediate",
            statusLabel: "new",
            progressSummaryLabel: null,
          },
        ],
        filters: {
          categories: [{ id: "system-design", label: "System Design" }],
          companies: [],
          difficulties: [],
          statuses: [],
        },
        page: 1,
        hasMore: false,
      },
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as never);

    renderWithProviders(
      <Routes>
        <Route element={<PracticePage />} path="/practice" />
      </Routes>,
      { route: "/practice", locale: "ko" },
    );

    expect(screen.getAllByText("Explain caching")).toHaveLength(2);
    expect(screen.getByText("다음 면접 분기를 고르세요")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "선택 질문 트리 열기" })).toBeInTheDocument();
    expect(document.querySelector(".practice-layout--desktop")).not.toBeNull();
  });

  it("opens the first visible question tree when the user moves from browsing into DFS exploration", async () => {
    vi.mocked(usePracticeQuestionsQuery).mockReturnValue({
      data: {
        items: [
          {
            id: "question-21",
            title: "Explain caching",
            prompt: "Discuss eviction and invalidation tradeoffs.",
            categoryLabel: "System Design",
            companyLabel: "General",
            difficultyLabel: "Intermediate",
            statusLabel: "new",
            progressSummaryLabel: null,
          },
        ],
        filters: {
          categories: [],
          companies: [],
          difficulties: [],
          statuses: [],
        },
        page: 1,
        hasMore: false,
      },
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as never);

    const user = userEvent.setup();

    renderWithProviders(
      <Routes>
        <Route
          element={
            <>
              <PracticePage />
              <LocationDisplay />
            </>
          }
          path="/practice"
        />
        <Route element={<LocationDisplay />} path="/questions/:questionId/tree" />
      </Routes>,
      { route: "/practice", locale: "ko" },
    );

    await user.click(screen.getByRole("link", { name: "선택 질문 트리 열기" }));

    expect(screen.getByTestId("location-display")).toHaveTextContent("/questions/question-21/tree");
  });
});
