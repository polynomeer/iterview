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
      { route: "/skills", locale: "ko" },
    );

    expect(screen.getByText("스킬 신호를 다음 가지 선택으로 연결하세요")).toBeInTheDocument();
    expect(screen.getByText("이 신호 세트가 이끌어야 할 다음 행동")).toBeInTheDocument();
    expect(screen.getByText("가장 바로 행동 가능한 신호")).toBeInTheDocument();
    expect(screen.getByText("최대 격차: System Design")).toBeInTheDocument();
    expect(screen.getByText("약한 질문 부하: System Design")).toBeInTheDocument();
    expect(screen.getByText("오늘의 주 가지")).toBeInTheDocument();
    expect(screen.getByText("연습 워크스페이스 열기")).toBeInTheDocument();
    expect(screen.getByText("현재 스킬 프로필")).toBeInTheDocument();
    expect(screen.getByText("약한 스킬과 벤치마크 격차")).toBeInTheDocument();
    expect(screen.getByText("답변량과 약한 질문 부하")).toBeInTheDocument();
    expect(screen.getByText("총 약한 질문 수")).toBeInTheDocument();
  });
});
