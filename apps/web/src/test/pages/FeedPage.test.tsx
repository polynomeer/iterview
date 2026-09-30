import { screen } from "@testing-library/react";
import { Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { FeedPage } from "../../pages/feed/FeedPage";
import { useFeedQuery } from "../../features/feed/api/useFeedQuery";
import { mockMatchMedia, renderWithProviders } from "../utils";
import { ApiClientError } from "../../shared/api/errors";

vi.mock("../../features/feed/api/useFeedQuery", () => ({
  useFeedQuery: vi.fn(),
}));

describe("FeedPage", () => {
  it("renders the available feed sections and cards", () => {
    vi.mocked(useFeedQuery).mockReturnValue({
      data: {
        sections: [
          {
            id: "popular",
            title: "Popular",
            items: [
              {
                id: "question-31",
                title: "Describe your incident response process",
                categoryLabel: "Behavioral",
                difficultyLabel: "Intermediate",
                companyLabels: ["Amazon"],
                tagLabels: ["incident"],
                progressSummaryLabel: "2 attempts · Best 88",
              },
            ],
          },
          {
            id: "trending",
            title: "Trending",
            items: [
              {
                id: "question-32",
                title: "Build a metrics pipeline",
                categoryLabel: "System Design",
                difficultyLabel: "Advanced",
                companyLabels: ["Datadog"],
                tagLabels: ["metrics"],
                progressSummaryLabel: null,
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

    renderWithProviders(
      <Routes>
        <Route element={<FeedPage />} path="/explore" />
      </Routes>,
      { route: "/explore", locale: "ko" },
    );

    expect(screen.getByText("Popular")).toBeInTheDocument();
    expect(screen.getByText("Trending")).toBeInTheDocument();
    expect(screen.getByText("Describe your incident response process")).toBeInTheDocument();
    expect(screen.getByText("Build a metrics pipeline")).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: "답변 시작" })).toHaveLength(2);
  });

  it("shows a sign-in state instead of a generic error for 401 responses", () => {
    vi.mocked(useFeedQuery).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new ApiClientError(401, "You need to sign in to continue."),
      refetch: vi.fn(),
    } as never);

    renderWithProviders(
      <Routes>
        <Route element={<FeedPage />} path="/explore" />
      </Routes>,
      { route: "/explore", locale: "ko" },
    );

    expect(screen.getByText("로그인하면 가지 피드를 사용할 수 있습니다")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "로그인" })).toHaveAttribute("href", "/login");
    expect(screen.getByRole("link", { name: "연습 질문 둘러보기" })).toHaveAttribute(
      "href",
      "/questions",
    );
  });

  it("renders the desktop feed layout when wide mode is active", () => {
    mockMatchMedia(true);
    vi.mocked(useFeedQuery).mockReturnValue({
      data: {
        sections: [
          { id: "popular", title: "Popular", items: [] },
          { id: "trending", title: "Trending", items: [] },
        ],
      },
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as never);

    renderWithProviders(
      <Routes>
        <Route element={<FeedPage />} path="/explore" />
      </Routes>,
      { route: "/explore", locale: "ko" },
    );

    expect(
      screen.getByText("외부 시그널은 끝없는 탐색이 아니라 다음 질문을 좁히는 용도로 사용하세요"),
    ).toBeInTheDocument();
    expect(document.querySelector(".feed-layout--desktop")).not.toBeNull();
  });
});
