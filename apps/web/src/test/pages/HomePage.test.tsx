import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import type { HomeModel } from "../../entities/home/model";
import { useCurrentUserQuery } from "../../features/auth/api/useCurrentUserQuery";
import { useHomeQuery } from "../../features/home/api/useHomeQuery";
import { HomePage } from "../../pages/home/HomePage";
import { ApiClientError } from "../../shared/api/errors";
import { renderWithProviders } from "../utils";

vi.mock("../../features/home/api/useHomeQuery", () => ({ useHomeQuery: vi.fn() }));
vi.mock("../../features/auth/api/useCurrentUserQuery", () => ({ useCurrentUserQuery: vi.fn() }));

const HOME: HomeModel = {
  todayQuestion: {
    id: "question-1",
    title: "Tell me about a scaling issue you fixed",
    status: "retry",
    cardType: "daily",
    difficulty: "MEDIUM",
    scheduledLabel: "2026. 9. 30.",
  },
  retryQuestions: [{ id: "question-2", title: "Design a rate limiter", difficulty: "HARD", scheduledLabel: "2026. 9. 29." }],
  learningMaterials: [{ id: "material-1", title: "Scaling playbook", sourceName: "Iterview Editorial", materialType: "article", url: "https://example.com/scaling" }],
  summary: { dailyQuestionCount: 1, retryQuestionCount: 1, pendingReviewCount: 1, archivedQuestionCount: 5 },
  skillReadiness: [{ code: "SYSTEM_DESIGN", score: 42 }],
  weakSkills: [],
  resumeRisks: [{ id: "q-9", questionId: "9", title: "How did you measure the 40% latency win?", severity: "high" }],
};

function renderHome(query: Partial<ReturnType<typeof useHomeQuery>>) {
  vi.mocked(useHomeQuery).mockReturnValue({ isLoading: false, isError: false, error: null, refetch: vi.fn(), ...query } as never);
  vi.mocked(useCurrentUserQuery).mockReturnValue({ data: { profile: { nickname: "민준" } } } as never);
  return renderWithProviders(
    <Routes>
      <Route element={<HomePage />} path="/" />
    </Routes>,
    { locale: "ko" },
  );
}

describe("HomePage", () => {
  it("leads with one next question and a single primary action", () => {
    renderHome({ data: HOME });

    expect(screen.getByRole("heading", { level: 1, name: "민준님, 오늘도 한 질문씩" })).toBeInTheDocument();
    expect(screen.getByText("오늘 할 일 2개")).toBeInTheDocument();
    const next = screen.getByRole("region", { name: "Tell me about a scaling issue you fixed" });
    expect(within(next).getByText("보통")).toBeInTheDocument();
    expect(within(next).getByText("지난 답변이 약해서 다시 배정됐어요.")).toBeInTheDocument();
    expect(within(next).getByRole("link", { name: "답변 시작" })).toHaveAttribute("href", "/questions/question-1/answer");
    expect(document.querySelectorAll(".ui-button--primary")).toHaveLength(1);
  });

  it("lists due reviews, resume risks, progress, and reading with real values only", () => {
    renderHome({ data: HOME });

    const review = screen.getByRole("region", { name: "복습할 질문" });
    expect(within(review).getByText("Design a rate limiter")).toBeInTheDocument();
    expect(within(review).getByRole("link", { name: "다시 답하기" })).toHaveAttribute("href", "/questions/question-2/answer");
    const risks = screen.getByRole("region", { name: "근거를 보강할 이력서 항목" });
    expect(risks).toHaveTextContent("How did you measure the 40% latency win?");
    expect(within(risks).getByText("위험도 높음")).toHaveClass("ui-badge--danger");
    expect(screen.getByRole("progressbar", { name: "시스템 설계 준비도" })).toHaveAttribute("aria-valuenow", "42");
    expect(screen.getByRole("link", { name: "열기" })).toHaveAttribute("href", "https://example.com/scaling");
    // No invented metrics from the previous design.
    expect(screen.queryByText("진행률")).not.toBeInTheDocument();
    expect(screen.queryByText("~25분")).not.toBeInTheDocument();
  });

  it("does not chart skills that are not measured yet", () => {
    renderHome({ data: { ...HOME, skillReadiness: [{ code: "CS", score: 0 }, { code: "BACKEND", score: null }] } });

    expect(screen.getByText("질문에 답하면 영역별 준비도가 보여요.")).toBeInTheDocument();
    expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
  });

  it("shows empty states instead of blank sections", () => {
    renderHome({ data: { ...HOME, todayQuestion: null, retryQuestions: [], resumeRisks: [], learningMaterials: [] } });

    expect(screen.getByText("오늘 배정된 질문이 없어요")).toBeInTheDocument();
    expect(screen.getByText("지금 복습할 질문이 없어요")).toBeInTheDocument();
    expect(screen.queryByRole("region", { name: "근거를 보강할 이력서 항목" })).not.toBeInTheDocument();
    expect(screen.getByText("오늘 할 일을 모두 끝냈어요")).toBeInTheDocument();
  });

  it("shows a sign-in state instead of a generic error for 401 responses", () => {
    renderHome({ isError: true, error: new ApiClientError(401, "You need to sign in to continue.") });

    expect(screen.getByRole("heading", { level: 1, name: "이력서 기반 면접 연습" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "로그인" })).toHaveAttribute("href", "/login");
    expect(screen.getByRole("link", { name: "질문 둘러보기" })).toHaveAttribute("href", "/questions");
  });

  it("offers a retry when loading fails", async () => {
    const refetch = vi.fn();
    renderHome({ isError: true, error: new ApiClientError(500, "boom"), refetch });

    expect(screen.getByRole("alert")).toHaveTextContent("오늘 할 일을 불러오지 못했어요.");
    await userEvent.setup().click(screen.getByRole("button", { name: "다시 시도" }));
    expect(refetch).toHaveBeenCalled();
  });

  it("shows a skeleton while loading", () => {
    renderHome({ isLoading: true });

    expect(screen.getByRole("status")).toHaveAttribute("aria-busy", "true");
  });
});
