import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import type { HomeModel } from "../../entities/home/model";
import { useCurrentUserQuery } from "../../features/auth/api/useCurrentUserQuery";
import { useHomeQuery } from "../../features/home/api/useHomeQuery";
import { useQuestionAnswerHistoryQuery } from "../../features/question/api/useQuestionAnswerHistoryQuery";
import { useQuestionDetailQuery } from "../../features/question/api/useQuestionDetailQuery";
import { useQuestionTreeQuery } from "../../features/question/api/useQuestionTreeQuery";
import { useReviewQueueQuery } from "../../features/review-queue/api/useReviewQueueQuery";
import { HomePage } from "../../pages/home/HomePage";
import { ApiClientError } from "../../shared/api/errors";
import { renderWithProviders } from "../utils";

vi.mock("../../features/home/api/useHomeQuery", () => ({ useHomeQuery: vi.fn() }));
vi.mock("../../features/auth/api/useCurrentUserQuery", () => ({ useCurrentUserQuery: vi.fn() }));
vi.mock("../../features/question/api/useQuestionDetailQuery", () => ({ useQuestionDetailQuery: vi.fn() }));
vi.mock("../../features/question/api/useQuestionAnswerHistoryQuery", () => ({ useQuestionAnswerHistoryQuery: vi.fn() }));
vi.mock("../../features/question/api/useQuestionTreeQuery", () => ({ useQuestionTreeQuery: vi.fn() }));
vi.mock("../../features/review-queue/api/useReviewQueueQuery", () => ({ useReviewQueueQuery: vi.fn() }));

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

const DETAIL = { category: "Backend", tags: ["Scaling", "Caching"], companies: ["Kakao", "Toss"] };
const HISTORY = { items: [{ answerAttemptId: "a-2", totalScore: 42 }, { answerAttemptId: "a-1", totalScore: 30 }] };
const TREE = {
  rootQuestionId: "question-1",
  nodes: [
    { id: "question-1", title: "Tell me about a scaling issue you fixed", depth: 0, parentQuestionId: null, status: "weak", isRoot: true },
    { id: "question-5", title: "How did you find the bottleneck?", depth: 1, parentQuestionId: "question-1", status: "strong", isRoot: false },
    { id: "question-6", title: "What would you shard first?", depth: 1, parentQuestionId: "question-1", status: "unanswered", isRoot: false },
    { id: "question-7", title: "Grandchild", depth: 2, parentQuestionId: "question-6", status: "unanswered", isRoot: false },
  ],
};
const REVIEW_QUEUE = { items: [{ id: "rq-1", questionId: "question-2", reasonTypeLabel: "낮은 총점" }] };

type Extras = { detail?: unknown; history?: unknown; tree?: unknown; reviewQueue?: unknown; user?: unknown };

function renderHome(query: Partial<ReturnType<typeof useHomeQuery>>, extras: Extras = {}) {
  vi.mocked(useHomeQuery).mockReturnValue({ isLoading: false, isError: false, error: null, refetch: vi.fn(), ...query } as never);
  vi.mocked(useCurrentUserQuery).mockReturnValue({
    data: "user" in extras ? extras.user : { profile: { nickname: "민준" }, targetCompanies: [{ companyName: "Toss" }] },
  } as never);
  vi.mocked(useQuestionDetailQuery).mockReturnValue({ data: "detail" in extras ? extras.detail : DETAIL } as never);
  vi.mocked(useQuestionAnswerHistoryQuery).mockReturnValue({ isLoading: false, data: "history" in extras ? extras.history : HISTORY } as never);
  vi.mocked(useQuestionTreeQuery).mockReturnValue({ data: "tree" in extras ? extras.tree : TREE } as never);
  vi.mocked(useReviewQueueQuery).mockReturnValue({ data: "reviewQueue" in extras ? extras.reviewQueue : REVIEW_QUEUE } as never);
  return renderWithProviders(
    <Routes>
      <Route element={<HomePage />} path="/" />
    </Routes>,
    { locale: "ko" },
  );
}

describe("HomePage", () => {
  it("leads with the workload headline, one next question, and a single primary action", () => {
    renderHome({ data: HOME });

    expect(screen.getByRole("heading", { level: 1, name: "오늘은 질문 1개, 복습 1개" })).toBeInTheDocument();
    expect(screen.getByText(/목표 회사 Toss/)).toBeInTheDocument();
    const next = screen.getByRole("region", { name: "Tell me about a scaling issue you fixed" });
    expect(within(next).getByRole("navigation", { name: "주제" })).toHaveTextContent("Backend/Scaling/Caching");
    expect(within(next).getByText("꼬리질문 2개")).toBeInTheDocument();
    expect(within(next).getByText("보통")).toBeInTheDocument();
    expect(within(next).getByRole("link", { name: "답변 시작" })).toHaveAttribute("href", "/questions/question-1/answer");
    expect(document.querySelectorAll(".ui-button--primary")).toHaveLength(1);
  });

  it("shows the follow-up flow from the current question to its direct follow-ups", () => {
    renderHome({ data: HOME });

    const flow = screen.getByRole("list", { name: "꼬리질문 흐름" });
    const steps = within(flow).getAllByRole("listitem");
    expect(steps).toHaveLength(3);
    expect(steps[0]).toHaveTextContent("이 질문 · 지금");
    expect(within(flow).getByRole("link", { name: /How did you find the bottleneck\?.*숙달/ })).toHaveAttribute("href", "/questions/question-5");
    expect(within(flow).getByRole("link", { name: /What would you shard first\?.*다음/ })).toBeInTheDocument();
    expect(within(flow).queryByText("Grandchild")).not.toBeInTheDocument();
  });

  it("explains why this question with real facts only", () => {
    renderHome({ data: { ...HOME, resumeRisks: [{ id: "q-1", questionId: "question-1", title: "Tell me about a scaling issue you fixed", severity: "high" }] } });

    const why = screen.getByRole("complementary", { name: "왜 이 질문인가요?" });
    expect(within(why).getByText("42")).toHaveClass("today-score--danger");
    expect(why).toHaveTextContent("지금까지 2번 시도");
    expect(why).toHaveTextContent("지난 답변이 약해서 다시 배정됐어요.");
    expect(why).toHaveTextContent("연결된 이력서 항목");
    expect(within(why).getByText("위험도 높음")).toHaveClass("ui-badge--danger");
    expect(why).toHaveTextContent("목표 회사 기출");
    expect(why).toHaveTextContent("Toss");
    expect(why).not.toHaveTextContent("Kakao");
  });

  it("hides facts and flow the API did not return", () => {
    renderHome({ data: HOME }, { detail: undefined, history: { items: [] }, tree: undefined, user: undefined });

    const why = screen.getByRole("complementary", { name: "왜 이 질문인가요?" });
    expect(why).not.toHaveTextContent("지난 점수");
    expect(why).not.toHaveTextContent("연결된 이력서 항목");
    expect(why).not.toHaveTextContent("출제된 회사");
    expect(screen.queryByRole("list", { name: "꼬리질문 흐름" })).not.toBeInTheDocument();
    expect(screen.queryByRole("navigation", { name: "주제" })).not.toBeInTheDocument();
    expect(screen.queryByText(/목표 회사/)).not.toBeInTheDocument();
  });

  it("lists due reviews, resume risks, progress, and reading with real values only", () => {
    renderHome({ data: HOME });

    const review = screen.getByRole("region", { name: "오늘 복습 1" });
    expect(within(review).getByText("Design a rate limiter")).toBeInTheDocument();
    expect(within(review).getByText(/낮은 총점/)).toBeInTheDocument();
    expect(within(review).getByRole("link", { name: "다시 답변" })).toHaveAttribute("href", "/questions/question-2/answer");
    const risks = screen.getByRole("region", { name: "근거가 비어 있는 이력서 항목" });
    expect(risks).toHaveTextContent("How did you measure the 40% latency win?");
    expect(within(risks).getByText("위험도 높음")).toHaveClass("ui-badge--danger");
    expect(within(risks).getByRole("link", { name: "이력서로" })).toHaveAttribute("href", "/resume");
    expect(screen.getByRole("progressbar", { name: "시스템 설계 준비도" })).toHaveAttribute("aria-valuenow", "42");
    expect(screen.getByRole("link", { name: "열기" })).toHaveAttribute("href", "https://example.com/scaling");
    // No invented metrics from the mockup.
    expect(screen.queryByText(/D-\d/)).not.toBeInTheDocument();
    expect(screen.queryByText(/항목에 근거/)).not.toBeInTheDocument();
    expect(screen.queryByText("이번 주 평균 점수")).not.toBeInTheDocument();
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
    expect(screen.queryByRole("region", { name: "근거가 비어 있는 이력서 항목" })).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1, name: "오늘 할 일을 모두 끝냈어요" })).toBeInTheDocument();
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
