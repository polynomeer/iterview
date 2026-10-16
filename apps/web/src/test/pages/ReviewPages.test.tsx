import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route, Routes } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useArchiveQuery } from "../../features/archive/api/useArchiveQuery";
import { useHomeQuery } from "../../features/home/api/useHomeQuery";
import { useReviewQueueActionMutation } from "../../features/review-queue/api/useReviewQueueActionMutation";
import { useReviewQueueQuery } from "../../features/review-queue/api/useReviewQueueQuery";
import { ArchivePage } from "../../pages/review/ArchivePage";
import { countDue, daysUntil, weekLoad } from "../../entities/review-queue/dueDates";
import { ReviewQueuePage } from "../../pages/review/ReviewQueuePage";
import { ApiClientError } from "../../shared/api/errors";
import { renderWithProviders } from "../utils";

vi.mock("../../features/review-queue/api/useReviewQueueQuery", () => ({ useReviewQueueQuery: vi.fn() }));
vi.mock("../../features/review-queue/api/useReviewQueueActionMutation", () => ({ useReviewQueueActionMutation: vi.fn() }));
vi.mock("../../features/archive/api/useArchiveQuery", () => ({ useArchiveQuery: vi.fn() }));
vi.mock("../../features/home/api/useHomeQuery", () => ({ useHomeQuery: vi.fn() }));

const NOW = new Date(2026, 8, 30, 10); // Wed 30 Sep 2026, local time
const at = (dayOffset: number) => new Date(2026, 8, 30 + dayOffset, 9).toISOString();

const QUEUE_ITEMS = [
  { id: "q2", questionId: "12", questionTitle: "Redis 분산 락 만료", scheduledAt: at(3), difficulty: "MEDIUM", priority: 80, reasonTypeLabel: "전체 점수 낮음", relatedSkillLabels: [] },
  { id: "q1", questionId: "11", questionTitle: "Self-invocation 트랜잭션", scheduledAt: at(-1), difficulty: "HARD", priority: 80, reasonTypeLabel: "꼬리질문 깊이 부족", relatedSkillLabels: [] },
  { id: "q3", questionId: "13", questionTitle: "p99 지연 측정", scheduledAt: at(0), difficulty: "EASY", priority: 100, reasonTypeLabel: "예약된 복습", relatedSkillLabels: [] },
];

const ARCHIVE_ITEMS = [
  { id: "a1", questionId: "3", questionTitle: "40% 지연 개선 측정", sourceType: "interview", sourceBadgeLabel: "면접", difficulty: "MEDIUM", totalAttemptCount: 2, bestScore: 88, archivedAtLabel: "8월 26일", sourceSessionId: "1", sourceInterviewRecordId: null, sourceInterviewQuestionId: null },
  { id: "a2", questionId: "2", questionTitle: "Poison message 처리", sourceType: "practice", sourceBadgeLabel: "연습", difficulty: "HARD", totalAttemptCount: 1, bestScore: null, archivedAtLabel: "8월 26일", sourceSessionId: null, sourceInterviewRecordId: "9", sourceInterviewQuestionId: "4" },
];

beforeEach(() => {
  vi.mocked(useReviewQueueQuery).mockReturnValue({ isLoading: false, isError: false, data: { items: QUEUE_ITEMS } } as never);
  vi.mocked(useArchiveQuery).mockReturnValue({ isLoading: false, isError: false, data: { items: ARCHIVE_ITEMS } } as never);
  vi.mocked(useHomeQuery).mockReturnValue({
    isLoading: false,
    isError: false,
    data: {
      skillReadiness: [
        { code: "BACKEND", score: 61 },
        { code: "DATABASE", score: 48 },
        { code: "CS", score: 90 },
        { code: "TESTING", score: 0 },
      ],
    },
  } as never);
});

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

  it("counts only items due today or overdue", () => {
    const items = [at(-1), at(0), at(1), at(5)].map((scheduledAt) => ({ scheduledAt }));
    expect(countDue(items, NOW)).toBe(2);
  });
});

describe("ReviewQueuePage", () => {
  const mutateAsync = vi.fn();

  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(NOW);
    mutateAsync.mockReset().mockResolvedValue({});
    vi.mocked(useReviewQueueActionMutation).mockReturnValue({ mutateAsync, error: null } as never);
  });

  afterEach(() => vi.useRealTimers());

  function renderQueue(route = "/review") {
    return renderWithProviders(
      <Routes>
        <Route element={<ReviewQueuePage />} path="/review" />
      </Routes>,
      { route, locale: "ko" },
    );
  }

  it("starts today's reviews and lists only what is due, most urgent first", () => {
    renderQueue();

    expect(screen.getByRole("heading", { level: 1, name: "복습" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "오늘 복습 시작 · 2문제" })).toHaveAttribute("href", "/questions/11/answer");
    expect(document.querySelectorAll(".ui-button--primary")).toHaveLength(1);

    const list = screen.getByRole("region", { name: "오늘 다시 볼 질문" });
    const titles = within(list).getAllByRole("link").map((node) => node.textContent);
    expect(titles).toEqual(["Self-invocation 트랜잭션", "p99 지연 측정"]);
    expect(within(list).getByRole("link", { name: "Self-invocation 트랜잭션" })).toHaveAttribute("href", "/questions/11/answer");
    expect(within(list).getByText("1일 지남")).toHaveClass("review-item__due--overdue");
    expect(within(list).getByText("꼬리질문 깊이 부족 · 어려움")).toBeInTheDocument();

    const urgent = within(list).getByText("Self-invocation 트랜잭션").closest(".ui-list-row") as HTMLElement;
    expect(within(urgent).getByText("보완")).toHaveClass("ui-badge--warning");
    const scheduled = within(list).getByText("p99 지연 측정").closest(".ui-list-row") as HTMLElement;
    expect(within(scheduled).getByText("약점")).toHaveClass("ui-badge--danger");
  });

  it("shows tab counts and keeps 오늘/예정/약한 영역 on /review and 완료 on its own route", () => {
    renderQueue();

    const tabs = screen.getByRole("navigation", { name: "복습 보기" });
    const links = within(tabs).getAllByRole("link");
    expect(links.map((link) => link.textContent)).toEqual(["오늘2", "예정1", "약한 영역2", "완료2"]);
    expect(links.map((link) => link.getAttribute("href"))).toEqual(["/review", "/review?view=upcoming", "/review?view=weak", "/review/done"]);
    expect(links[0]).toHaveAttribute("aria-current", "page");
  });

  it("re-sorts by priority", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderQueue();

    await user.click(screen.getByRole("radio", { name: "우선순위" }));
    const list = screen.getByRole("region", { name: "오늘 다시 볼 질문" });
    expect(within(list).getAllByRole("link").map((node) => node.textContent)).toEqual(["p99 지연 측정", "Self-invocation 트랜잭션"]);
  });

  it("lists upcoming reviews on the 예정 tab", () => {
    renderQueue("/review?view=upcoming");

    expect(screen.getByRole("link", { name: /예정/ })).toHaveAttribute("aria-current", "page");
    const list = screen.getByRole("region", { name: "예정된 복습" });
    expect(within(list).getAllByRole("link").map((node) => node.textContent)).toEqual(["Redis 분산 락 만료"]);
  });

  it("shows the week load and filters the list to a picked day", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderQueue();

    const week = screen.getByRole("region", { name: "이번 주 복습 일정" });
    const days = within(week).getAllByRole("button");
    expect(days.map((day) => day.querySelector(".review-week__count")?.textContent)).toEqual(["0", "1", "1", "0", "0", "1", "0"]);
    expect(days[2]).toHaveTextContent("오늘");

    await user.click(days[5]);
    expect(days[5]).toHaveAttribute("aria-pressed", "true");
    const list = screen.getByRole("region", { name: /복습$/ });
    expect(within(list).getAllByRole("link").map((node) => node.textContent)).toEqual(["Redis 분산 락 만료"]);

    await user.click(days[5]);
    expect(screen.getByRole("region", { name: "오늘 다시 볼 질문" })).toBeInTheDocument();
  });

  it("shows measured weak areas weakest first, linking to the skill map, and the real review spacing", () => {
    renderQueue();

    const aside = screen.getByRole("complementary", { name: "약한 영역과 복습 간격" });
    const weak = within(aside).getByRole("region", { name: "약한 영역" });
    const links = within(weak).getAllByRole("link");
    expect(links.map((link) => link.textContent)).toEqual(["데이터베이스48", "백엔드61"]);
    expect(links[0]).toHaveAttribute("href", "/questions/skills");
    expect(within(links[0]).getByRole("progressbar")).toHaveClass("review-weak__track--danger");
    expect(within(links[1]).getByRole("progressbar")).toHaveClass("review-weak__track--warning");
    expect(within(aside).getByRole("region", { name: "복습 간격" })).toHaveTextContent("60점 미만이면 2일 뒤");
  });

  it("moves weak areas into the main column on the 약한 영역 tab", () => {
    renderQueue("/review?view=weak");

    expect(screen.queryByRole("region", { name: "오늘 다시 볼 질문" })).not.toBeInTheDocument();
    expect(screen.getAllByRole("region", { name: "약한 영역" })).toHaveLength(1);
    expect(screen.getByRole("link", { name: /약한 영역/ })).toHaveAttribute("aria-current", "page");
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

    const tabs = screen.getByRole("navigation", { name: "복습 보기" });
    expect(within(tabs).getByRole("link", { name: /완료/ })).toHaveAttribute("aria-current", "page");

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
