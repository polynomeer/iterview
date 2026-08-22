import { screen } from "@testing-library/react";
import { Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { useSkillGapQuery } from "../../features/skills/api/useSkillGapQuery";
import { useSkillProgressQuery } from "../../features/skills/api/useSkillProgressQuery";
import { useSkillRadarQuery } from "../../features/skills/api/useSkillRadarQuery";
import { SkillsPage } from "../../pages/skills/SkillsPage";
import { renderWithProviders } from "../utils";

vi.mock("../../features/skills/api/useSkillRadarQuery", () => ({
  useSkillRadarQuery: vi.fn(),
}));

vi.mock("../../features/skills/api/useSkillGapQuery", () => ({
  useSkillGapQuery: vi.fn(),
}));

vi.mock("../../features/skills/api/useSkillProgressQuery", () => ({
  useSkillProgressQuery: vi.fn(),
}));

vi.mock("../../shared/api/homeApi", () => ({
  getHomeRequest: vi.fn(),
}));

describe("SkillsPage", () => {
  it("renders the skills workspace summary and readiness signals", () => {
    vi.mocked(useSkillRadarQuery).mockReturnValue({
      data: {
        updatedAtLabel: "Aug 22, 2026",
        categories: [
          {
            id: "db",
            label: "Database",
            score: 72,
            scoreLabel: "72",
            benchmarkLabel: "Target 80",
            helperText: "Need deeper anomaly recall",
          },
          {
            id: "system",
            label: "System Design",
            score: 64,
            scoreLabel: "64",
            benchmarkLabel: "Target 78",
            helperText: "Trade-off clarity needed",
          },
          {
            id: "java",
            label: "Java",
            score: 81,
            scoreLabel: "81",
            benchmarkLabel: "Target 82",
            helperText: "Stable strength",
          },
        ],
      },
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as never);
    vi.mocked(useSkillGapQuery).mockReturnValue({
      data: {
        items: [
          {
            id: "gap-1",
            label: "System Design",
            gapScoreLabel: "-14",
            priorityLabel: "High priority",
            benchmarkLabel: "Backend target",
            recommendedAction: "Practice one failure-isolation branch today.",
          },
        ],
      },
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as never);
    vi.mocked(useSkillProgressQuery).mockReturnValue({
      data: {
        items: [
          {
            id: "progress-1",
            label: "Database",
            scoreLabel: "72",
            benchmarkLabel: "Target 80",
            gapLabel: "-8",
            answeredQuestionCountLabel: "12",
            weakQuestionCountLabel: "4",
          },
          {
            id: "progress-2",
            label: "System Design",
            scoreLabel: "64",
            benchmarkLabel: "Target 78",
            gapLabel: "-14",
            answeredQuestionCountLabel: "8",
            weakQuestionCountLabel: "5",
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
        <Route element={<SkillsPage />} path="/skills" />
      </Routes>,
      { route: "/skills" },
    );

    expect(screen.getByText("Turn raw skill signals into the next practice target")).toBeInTheDocument();
    expect(screen.getByText("What this signal set should drive")).toBeInTheDocument();
    expect(screen.getByText("Most actionable signal")).toBeInTheDocument();
    expect(screen.getByText("Top gap: System Design")).toBeInTheDocument();
    expect(screen.getByText("Weak-question load: System Design")).toBeInTheDocument();
    expect(screen.getByText("Current skill profile")).toBeInTheDocument();
    expect(screen.getByText("Weak skills and benchmark gaps")).toBeInTheDocument();
    expect(screen.getByText("Answered volume and weak-question load")).toBeInTheDocument();
  });
});
