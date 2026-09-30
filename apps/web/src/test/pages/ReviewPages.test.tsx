import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useArchiveQuery } from "../../features/archive/api/useArchiveQuery";
import { useReviewQueueActionMutation } from "../../features/review-queue/api/useReviewQueueActionMutation";
import { useReviewQueueQuery } from "../../features/review-queue/api/useReviewQueueQuery";
import { ArchivePage } from "../../pages/review/ArchivePage";
import { daysUntil, weekLoad } from "../../pages/review/dueDates";
import { ReviewQueuePage } from "../../pages/review/ReviewQueuePage";
import { ApiClientError } from "../../shared/api/errors";
import { renderWithProviders } from "../utils";

vi.mock("../../features/review-queue/api/useReviewQueueQuery", () => ({ useReviewQueueQuery: vi.fn() }));
vi.mock("../../features/review-queue/api/useReviewQueueActionMutation", () => ({ useReviewQueueActionMutation: vi.fn() }));
vi.mock("../../features/archive/api/useArchiveQuery", () => ({ useArchiveQuery: vi.fn() }));

const NOW = new Date(2026, 8, 30, 10); // Wed 30 Sep 2026, local time
const at = (dayOffset: number) => new Date(2026, 8, 30 + dayOffset, 9).toISOString();

describe("due dates", () => {
  it("counts days relative to the local calendar day", () => {
    expect(daysUntil(at(-2), NOW)).toBe(-2);
    expect(daysUntil(at(0), NOW)).toBe(0);
    expect(daysUntil(at(3), NOW)).toBe(3);
    expect(daysUntil(null, NOW)).toBeNull();
  });

  it("builds a Monday-first week with per-day counts", () => {
    const week = weekLoad([at(0), at(0), at(1), at(-2), at(9)], NOW);
    expect(week.map((day) => day.count)).toEqual([1, 0, 2, 1, 0, 0, 0]);
    expect(week.findIndex((day) => day.isToday)).toBe(2);
  });
});

describe("ReviewQueuePage", () => {
  const mutateAsync = vi.fn();

  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(NOW);
    mutateAsync.mockReset().mockResolvedValue({});
    vi.mocked(useReviewQueueActionMutation).mockReturnValue({ mutateAsync, error: null } as never);
    vi.mocked(useReviewQueueQuery).mockReturnValue({
      isLoading: false,
      isError: false,
      data: {
        items: [
          { id: "q2", questionId: "12", questionTitle: "Redis 분산 락 만료", scheduledAt: at(3), difficulty: "MEDIUM", priority: 90, reasonTypeLabel: "전체 점수 낮음", relatedSkillLabels: [] },
          { id: "q1", questionId: "11", questionTitle: "Self-invocation 트랜잭션", scheduledAt: at(-1), difficulty: "HARD", priority: 40, reasonTypeLabel: "꼬리질문 깊이 부족", relatedSkillLabels: [] },
          { id: "q3", questionId: "13", questionTitle: "p99 지연 측정", scheduledAt: at(0), difficulty: "EASY", priority: 60, reasonTypeLabel: "예약된 복습", relatedSkillLabels: [] },
        ],
      },
    } as never);
  });

  afterEach(() => vi.useRealTimers());

  function renderQueue() {
    return renderWithProviders(
      <Routes>
        <Route element={<ReviewQueuePage />} path="/review" />
      </Routes>,
      { route: "/review", locale: "ko" },
    );
  }

  it("starts with the most urgent due question and lists items by due date", () => {
    renderQueue();

    expect(screen.getByRole("link", { name: "오늘 복습 시작 (2)" })).toHaveAttribute("href", "/questions/11/answer");
    const list = screen.getByRole("region", { name: /다시 답할 질문/ });
    const titles = within(list).getAllByText(/Redis|Self-invocation|p99/).map((node) => node.textContent);
    expect(titles).toEqual(["Self-invocation 트랜잭션", "p99 지연 측정", "Redis 분산 락 만료"]);
    expect(within(list).getByText("1일 지남")).toHaveClass("ui-badge--danger");
    expect(within(list).getByText("꼬리질문 깊이 부족 · 어려움")).toBeInTheDocument();
    expect(document.querySelectorAll(".ui-button--primary")).toHaveLength(1);
  });

  it("re-sorts by priority and shows the week load", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderQueue();

    await user.click(screen.getByRole("radio", { name: "우선순위" }));

    const list = screen.getByRole("region", { name: /다시 답할 질문/ });
    expect(within(list).getAllByText(/Redis|Self-invocation|p99/)[0]).toHaveTextContent("Redis 분산 락 만료");
    const week = screen.getByRole("list", { name: "이번 주 복습 일정" });
    expect(within(week).getAllByRole("listitem").map((day) => day.querySelector("strong")?.textContent)).toEqual(["0", "1", "1", "0", "0", "1", "0"]);
  });

  it("marks an item done and announces it", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderQueue();

    const row = screen.getByText("p99 지연 측정").closest(".ui-list-row") as HTMLElement;
    await user.click(within(row).getByRole("button", { name: "완료" }));

    expect(mutateAsync).toHaveBeenCalledWith("q3");
    expect(await screen.findByText("“p99 지연 측정”을(를) 완료로 표시했어요.")).toBeInTheDocument();
  });

  it("shows an empty state when nothing is due", () => {
    vi.mocked(useReviewQueueQuery).mockReturnValue({ isLoading: false, isError: false, data: { items: [] } } as never);
    renderQueue();

    expect(screen.getByText("지금 복습할 질문이 없어요")).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /복습 시작/ })).not.toBeInTheDocument();
  });

  it("offers a retry when loading fails", () => {
    vi.mocked(useReviewQueueQuery).mockReturnValue({ isLoading: false, isError: true, error: new ApiClientError(500, "boom"), refetch: vi.fn() } as never);
    renderQueue();

    expect(screen.getByRole("alert")).toHaveTextContent("복습 목록을 불러오지 못했어요.");
  });
});

describe("ArchivePage", () => {
  beforeEach(() => {
    vi.mocked(useArchiveQuery).mockReturnValue({
      isLoading: false,
      isError: false,
      data: {
        items: [
          { id: "a1", questionId: "3", questionTitle: "40% 지연 개선 측정", sourceType: "interview", sourceBadgeLabel: "면접", difficulty: "MEDIUM", totalAttemptCount: 2, bestScore: 88, archivedAtLabel: "8월 26일", sourceSessionId: "1", sourceInterviewRecordId: null, sourceInterviewQuestionId: null },
          { id: "a2", questionId: "2", questionTitle: "Poison message 처리", sourceType: "practice", sourceBadgeLabel: "연습", difficulty: "HARD", totalAttemptCount: 1, bestScore: null, archivedAtLabel: "8월 26일", sourceSessionId: null, sourceInterviewRecordId: "9", sourceInterviewQuestionId: "4" },
        ],
      },
    } as never);
  });

  function renderArchive(route = "/review/done") {
    return renderWithProviders(
      <Routes>
        <Route element={<ArchivePage />} path="/review/done" />
      </Routes>,
      { route, locale: "ko" },
    );
  }

  it("lists finished questions with source, attempts, best score, and a way back", () => {
    renderArchive();

    const row = screen.getByText("40% 지연 개선 측정").closest(".ui-list-row") as HTMLElement;
    expect(within(row).getByText("면접 · 보통 · 시도 2회 · 8월 26일")).toBeInTheDocument();
    expect(within(row).getByText("최고 88점")).toHaveClass("ui-badge--success");
    expect(within(row).getByRole("link", { name: "면접 결과" })).toHaveAttribute("href", "/interview/sessions/1/result");
    expect(within(row).getByRole("link", { name: "다시 보기" })).toHaveAttribute("href", "/questions/3");
  });

  it("filters by source and title", async () => {
    const user = userEvent.setup();
    renderArchive();

    await user.click(screen.getByRole("radio", { name: "연습" }));
    expect(screen.queryByText("40% 지연 개선 측정")).not.toBeInTheDocument();
    expect(screen.getByText("Poison message 처리")).toBeInTheDocument();

    await user.type(screen.getByLabelText("제목 검색"), "없는 제목");
    expect(screen.getByText("조건에 맞는 질문이 없어요")).toBeInTheDocument();
  });

  it("honours the deep link from a real interview record and can clear it", async () => {
    const user = userEvent.setup();
    renderArchive("/review/done?sourceInterviewRecordId=9&sourceInterviewQuestionId=4");

    expect(screen.getByText("실전 면접 기록에서 온 질문만 보고 있어요.")).toBeInTheDocument();
    expect(screen.queryByText("40% 지연 개선 측정")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "전체 보기" }));
    expect(screen.getByText("40% 지연 개선 측정")).toBeInTheDocument();
  });
});
