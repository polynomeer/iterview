import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { usePracticeQuestionsQuery } from "../../features/practice/api/usePracticeQuestionsQuery";
import { useSkillProgressQuery } from "../../features/skills/api/useSkillProgressQuery";
import { useSkillRadarQuery } from "../../features/skills/api/useSkillRadarQuery";
import { SkillMapPage } from "../../pages/skills/SkillMapPage";
import { ApiClientError } from "../../shared/api/errors";
import { renderWithProviders } from "../utils";

vi.mock("../../features/skills/api/useSkillProgressQuery", () => ({ useSkillProgressQuery: vi.fn() }));
vi.mock("../../features/skills/api/useSkillRadarQuery", () => ({ useSkillRadarQuery: vi.fn() }));
vi.mock("../../features/practice/api/usePracticeQuestionsQuery", () => ({ usePracticeQuestionsQuery: vi.fn() }));

beforeEach(() => {
  vi.mocked(useSkillProgressQuery).mockReturnValue({
    isLoading: false,
    isError: false,
    data: {
      items: [
        { id: "SYSTEM_DESIGN", code: "SYSTEM_DESIGN", label: "System Design", score: 58, benchmarkScore: 70, gapScore: 12, answeredQuestionCount: 6, weakQuestionCount: 3 },
        { id: "BACKEND", code: "BACKEND", label: "Backend", score: 82, benchmarkScore: 75, gapScore: -7, answeredQuestionCount: 9, weakQuestionCount: 0 },
      ],
    },
  } as never);
  vi.mocked(useSkillRadarQuery).mockReturnValue({
    isLoading: false,
    isError: false,
    data: {
      categories: [
        { id: "DATABASE", code: "DATABASE", label: "Database", score: 40, benchmarkScore: 65, gapScore: 25 },
        { id: "BACKEND", code: "BACKEND", label: "Backend", score: 80, benchmarkScore: 75, gapScore: -5 },
      ],
    },
  } as never);
  vi.mocked(usePracticeQuestionsQuery).mockReturnValue({
    data: { filters: { categories: [{ id: "2", label: "System Design" }] } },
  } as never);
});

function renderSkills() {
  return renderWithProviders(
    <Routes>
      <Route element={<SkillMapPage />} path="/questions/skills" />
    </Routes>,
    { route: "/questions/skills", locale: "ko" },
  );
}

describe("SkillMapPage", () => {
  it("merges progress and radar data and lists the weakest area first", () => {
    renderSkills();

    const list = screen.getByRole("region", { name: /영역별 준비도/ });
    const names = within(list).getAllByRole("listitem").map((row) => row.querySelector("strong")?.textContent);
    expect(names).toEqual(["데이터베이스", "시스템 설계", "백엔드"]);
    expect(within(list).getByText("목표까지 25")).toHaveClass("ui-badge--warning");
    expect(within(list).getByText("목표 달성")).toHaveClass("ui-badge--success");
    expect(within(list).getByText("답변 6 · 약한 답변 3")).toBeInTheDocument();
  });

  it("summarises totals and names the weakest area", () => {
    renderSkills();

    const summary = screen.getByRole("region", { name: "스킬 요약" });
    expect(within(summary).getByText("15")).toBeInTheDocument();
    expect(within(summary).getByText("데이터베이스")).toBeInTheDocument();
  });

  it("links an area to its questions when a category with the same name exists", () => {
    renderSkills();

    const row = screen.getByText("시스템 설계").closest("li") as HTMLElement;
    expect(within(row).getByRole("link", { name: "관련 질문" })).toHaveAttribute("href", "/questions?category=2");
    const database = screen.getByText("데이터베이스", { selector: "strong" }).closest("li") as HTMLElement;
    expect(within(database).queryByRole("link")).not.toBeInTheDocument();
  });

  it("treats a zero score without answers as unmeasured, not weakest", () => {
    vi.mocked(useSkillRadarQuery).mockReturnValue({
      isLoading: false,
      isError: false,
      data: { categories: [{ id: "TESTING", code: "TESTING", label: "Testing", score: 0, benchmarkScore: 55, gapScore: 55 }] },
    } as never);
    renderSkills();

    const names = screen.getAllByRole("listitem").map((row) => row.querySelector("strong")?.textContent);
    expect(names[names.length - 1]).toBe("테스트");
    expect(screen.getByText("미측정")).toBeInTheDocument();
    expect(within(screen.getByRole("region", { name: "스킬 요약" })).getByText("시스템 설계")).toBeInTheDocument();
  });

  it("re-sorts by name", async () => {
    renderSkills();
    await userEvent.setup().click(screen.getByRole("radio", { name: "이름 순" }));

    const names = screen.getAllByRole("listitem").map((row) => row.querySelector("strong")?.textContent);
    expect(names).toEqual(["데이터베이스", "백엔드", "시스템 설계"]);
  });

  it("explains an empty map before any answers", () => {
    vi.mocked(useSkillProgressQuery).mockReturnValue({ isLoading: false, isError: false, data: { items: [] } } as never);
    vi.mocked(useSkillRadarQuery).mockReturnValue({ isLoading: false, isError: false, data: { categories: [] } } as never);
    renderSkills();

    expect(screen.getByText("아직 계산된 스킬이 없어요")).toBeInTheDocument();
  });

  it("offers a retry when both sources fail", () => {
    vi.mocked(useSkillProgressQuery).mockReturnValue({ isLoading: false, isError: true, error: new ApiClientError(500, "boom"), refetch: vi.fn() } as never);
    vi.mocked(useSkillRadarQuery).mockReturnValue({ isLoading: false, isError: true, error: new ApiClientError(500, "boom"), refetch: vi.fn() } as never);
    renderSkills();

    expect(screen.getByRole("alert")).toHaveTextContent("스킬 준비도를 불러오지 못했어요.");
  });
});
