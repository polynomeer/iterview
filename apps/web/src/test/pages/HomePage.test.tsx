import { screen } from "@testing-library/react";
import { Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { HomePage } from "../../pages/home/HomePage";
import { mockMatchMedia, renderWithProviders } from "../utils";
import { useHomeQuery } from "../../features/home/api/useHomeQuery";
import { ApiClientError } from "../../shared/api/errors";

vi.mock("../../features/home/api/useHomeQuery", () => ({
  useHomeQuery: vi.fn(),
}));

describe("HomePage", () => {
  it("renders the main home payload sections", () => {
    vi.mocked(useHomeQuery).mockReturnValue({
      data: {
        todayQuestion: {
          id: "question-1",
          title: "Tell me about a scaling issue you fixed",
          prompt: "Describe the issue, the investigation, and the outcome.",
          status: "retry",
          categoryLabel: "System Design",
          difficultyLabel: "MEDIUM",
        },
        retryQuestions: [
          {
            id: "question-2",
            title: "Design a rate limiter",
            prompt: "Explain the tradeoffs.",
            status: "improving",
            categoryLabel: "Backend",
            difficultyLabel: "HARD",
          },
        ],
        learningMaterials: [
          {
            id: "material-1",
            title: "Scaling playbook",
            description: "A review guide for diagnosing production bottlenecks.",
            resourceTypeLabel: "Guide",
            url: "https://example.com/scaling-playbook",
          },
        ],
        summaryStats: [
          {
            id: "stat-1",
            label: "Weekly score",
            value: "87",
            helperText: "Up 6 points",
          },
        ],
        skillRadarPreview: [],
        skillGapPreview: [],
        resumeRiskPreview: [],
      },
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as never);

    renderWithProviders(
      <Routes>
        <Route element={<HomePage />} path="/" />
      </Routes>,
      { locale: "ko" },
    );

    expect(screen.getAllByText("Tell me about a scaling issue you fixed")).toHaveLength(2);
    expect(screen.getByText("Design a rate limiter")).toBeInTheDocument();
    expect(screen.getByText("Scaling playbook")).toBeInTheDocument();
    expect(screen.getByText("Weekly score")).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: "답변 시작" }).length).toBeGreaterThan(0);
  });

  it("shows a sign-in state instead of a generic error for 401 responses", () => {
    vi.mocked(useHomeQuery).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new ApiClientError(401, "You need to sign in to continue."),
      refetch: vi.fn(),
    } as never);

    renderWithProviders(
      <Routes>
        <Route element={<HomePage />} path="/" />
      </Routes>,
      { locale: "ko" },
    );

    expect(screen.getByText("모든 이력서 주장을 DFS 꼬리질문에도 버틸 때까지 점검하세요")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "로그인" })).toHaveAttribute("href", "/login");
    expect(screen.getByRole("link", { name: "연습 질문 둘러보기" })).toHaveAttribute(
      "href",
      "/practice",
    );
  });

  it("renders the desktop dashboard variant when the layout mode is desktop", () => {
    mockMatchMedia(true);
    vi.mocked(useHomeQuery).mockReturnValue({
      data: {
        todayQuestion: {
          id: "question-1",
          title: "Tell me about a scaling issue you fixed",
          prompt: "Describe the issue, the investigation, and the outcome.",
          status: "retry",
          categoryLabel: "System Design",
          difficultyLabel: "MEDIUM",
        },
        retryQuestions: [],
        learningMaterials: [],
        summaryStats: [
          {
            id: "stat-1",
            label: "Weekly score",
            value: "87",
            helperText: "Up 6 points",
          },
        ],
        skillRadarPreview: [],
        skillGapPreview: [],
        resumeRiskPreview: [],
      },
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as never);

    renderWithProviders(
      <Routes>
        <Route element={<HomePage />} path="/" />
      </Routes>,
      { locale: "ko" },
    );

    expect(screen.getAllByText("Tell me about a scaling issue you fixed")).toHaveLength(2);
    expect(screen.getByText("Weekly score")).toBeInTheDocument();
    expect(document.querySelector(".home-layout--desktop")).not.toBeNull();
  });
});
