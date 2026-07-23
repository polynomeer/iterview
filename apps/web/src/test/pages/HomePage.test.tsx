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
          companyLabel: "Stripe",
        },
        retryQuestions: [
          {
            id: "question-2",
            title: "Design a rate limiter",
            prompt: "Explain the tradeoffs.",
            status: "improving",
            categoryLabel: "Backend",
            companyLabel: "Meta",
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
    );

    expect(screen.getByText("Tell me about a scaling issue you fixed")).toBeInTheDocument();
    expect(screen.getByText("Design a rate limiter")).toBeInTheDocument();
    expect(screen.getByText("Scaling playbook")).toBeInTheDocument();
    expect(screen.getByText("Weekly score")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Open review queue" })).toBeInTheDocument();
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
    );

    expect(screen.getByText("Your personalized home is available after sign-in")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Login" })).toHaveAttribute("href", "/login");
    expect(screen.getByRole("link", { name: "Browse practice questions" })).toHaveAttribute(
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
          companyLabel: "Stripe",
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
    );

    expect(screen.getByText("Tell me about a scaling issue you fixed")).toBeInTheDocument();
    expect(screen.getByText("Weekly score")).toBeInTheDocument();
    expect(document.querySelector(".home-layout--desktop")).not.toBeNull();
  });
});
