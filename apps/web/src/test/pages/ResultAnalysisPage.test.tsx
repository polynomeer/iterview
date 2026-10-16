import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ResultAnalysisModel, ResultFeedbackItemModel } from "../../entities/result/model";
import { useQuestionAnswerHistoryQuery } from "../../features/question/api/useQuestionAnswerHistoryQuery";
import { useResultAnalysisQuery } from "../../features/result/api/useResultAnalysisQuery";
import { feedbackGroups, ResultAnalysisPage } from "../../pages/result-analysis/ResultAnalysisPage";
import { ApiClientError } from "../../shared/api/errors";
import { renderWithProviders } from "../utils";

vi.mock("../../features/result/api/useResultAnalysisQuery", () => ({ useResultAnalysisQuery: vi.fn() }));
vi.mock("../../features/question/api/useQuestionAnswerHistoryQuery", () => ({ useQuestionAnswerHistoryQuery: vi.fn() }));

const RESULT: ResultAnalysisModel = {
  answerAttemptId: "8",
  questionId: "11",
  questionTitle: "Self-invocation 시 @Transactional이 무시되는 이유는?",
  totalScore: "68",
  totalScoreValue: 68,
  answerText: "Spring의 @Transactional은 프록시 기반 AOP로 동작합니다.",
  attemptNumber: 3,
  evaluationResult: "보완 필요",
  dimensions: [
    { id: "structure", label: "구조", value: "86", score: 86 },
    { id: "specificity", label: "구체성", value: "48", score: 48 },
    { id: "technicalAccuracy", label: "기술 정확도", value: "74", score: 74 },
    { id: "roleFit", label: "직무 적합도", value: "-", score: null },
    { id: "companyFit", label: "회사 적합도", value: "-", score: null },
    { id: "communication", label: "커뮤니케이션", value: "-", score: null },
  ],
  feedbackItems: [],
  detailedFeedback: null,
  strengthSummary: null,
  weaknessSummary: null,
  recommendedNextStep: "해결 방법을 고른 이유를 추가해서 다시 답해보세요.",
  narrativeLocale: "ko",
  narrativeModelLabel: null,
  strengthPoints: ["첫 문장에서 원인을 정확히 짚었어요."],
  improvementPoints: ["구조 분리의 근거가 부족해요."],
  missedPoints: [],
  modelAnswer: { text: "외부 호출만 프록시를 거칩니다.", sourceType: "generated", contentLocale: "ko", llmModel: null },
  progressStatusLabel: null,
  archiveDecisionLabel: null,
  nextReviewLabel: "10월 3일",
  skillImpact: [],
  weakPatterns: [],
  followUpRecommendations: [{ id: "12", title: "AspectJ 모드로 바꾸면 무엇이 달라지나요?" }],
};

beforeEach(() => {
  vi.mocked(useQuestionAnswerHistoryQuery).mockReturnValue({
    data: {
      items: [
        { answerAttemptId: "8", totalScore: 68, submittedAtLabel: "10/15 14:32" },
        { answerAttemptId: "7", totalScore: 42, submittedAtLabel: "10/12 09:10" },
      ],
    },
  } as never);
});

function renderResult(query: Partial<ReturnType<typeof useResultAnalysisQuery>>) {
  vi.mocked(useResultAnalysisQuery).mockReturnValue({ isLoading: false, isError: false, error: null, refetch: vi.fn(), ...query } as never);
  return renderWithProviders(
    <Routes>
      <Route element={<ResultAnalysisPage />} path="/attempts/:answerAttemptId" />
    </Routes>,
    { route: "/attempts/8", locale: "ko" },
  );
}

const feedbackItem: ResultFeedbackItemModel = { id: "1", title: "", description: "", tone: "neutral" };

describe("ResultAnalysisPage", () => {
  it("opens with a compact top bar and a score card with the change since the last attempt", () => {
    renderResult({ data: RESULT });

    expect(screen.getByRole("heading", { level: 1, name: "답변 결과 · Self-invocation 시 @Transactional이 무시되는 이유는?" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "질문으로" })).toHaveAttribute("href", "/questions/11");
    expect(screen.getByText("10/15 14:32 · 3번째 시도")).toHaveClass("result-topbar__meta");

    const summary = screen.getByRole("region", { name: "점수 요약" });
    expect(within(summary).getByText("68")).toHaveClass("result-score__value", "ui-tone-text--warning");
    expect(within(summary).getByText(/▲ 26 \(지난 시도 42\)/)).toHaveClass("ui-tone-text--success");
    expect(within(summary).getByText("보완 필요", { selector: ".ui-badge" })).toBeInTheDocument();
  });

  it("charts only scored dimensions and highlights the weakest one", () => {
    renderResult({ data: RESULT });

    const summary = screen.getByRole("region", { name: "점수 요약" });
    const bars = within(summary).getAllByRole("progressbar");
    expect(bars.map((bar) => bar.getAttribute("aria-label"))).toEqual(["구조", "구체성", "기술 정확도"]);
    expect(bars[1]).toHaveAttribute("aria-valuenow", "48");
    expect(bars[1].closest(".result-dimension")).toHaveClass("result-dimension--weakest");
    expect(summary.querySelectorAll(".result-dimension--weakest")).toHaveLength(1);
  });

  it("puts the next follow-up and the single primary action in the emphasis card", () => {
    renderResult({ data: RESULT });

    const next = screen.getByRole("region", { name: "다음 꼬리질문" });
    expect(within(next).getByRole("link", { name: "AspectJ 모드로 바꾸면 무엇이 달라지나요?" })).toHaveAttribute("href", "/questions/12");
    expect(within(next).getByText("구체성 48점을 보완")).toBeInTheDocument();
    expect(within(next).getByRole("link", { name: "이어서 답변하기" })).toHaveAttribute("href", "/questions/12/answer");
    expect(document.querySelectorAll(".ui-button--primary")).toHaveLength(1);

    const aside = screen.getByRole("complementary", { name: "다음 할 일" });
    expect(within(aside).getByText("복습 예약됨").parentElement).toHaveTextContent("10월 3일");
    expect(within(aside).getByRole("link", { name: "다시 답하기" })).toHaveAttribute("href", "/questions/11/answer");
  });

  it("falls back to answering the same question again when there is no follow-up", () => {
    renderResult({ data: { ...RESULT, followUpRecommendations: [] } });

    const next = screen.getByRole("region", { name: "다음 할 일" });
    expect(within(next).getByText("해결 방법을 고른 이유를 추가해서 다시 답해보세요.")).toBeInTheDocument();
    expect(within(next).getByRole("link", { name: "다시 답하기" })).toHaveAttribute("href", "/questions/11/answer");
    expect(document.querySelectorAll(".ui-button--primary")).toHaveLength(1);
  });

  it("shows the answer with the main improvement, worded feedback, and the model answer on request", async () => {
    const user = userEvent.setup();
    renderResult({ data: RESULT });

    const answer = screen.getByRole("region", { name: "내 답변" });
    expect(within(answer).getByText("Spring의 @Transactional은 프록시 기반 AOP로 동작합니다.")).toBeInTheDocument();
    expect(within(answer).getByText("“구체성”").parentElement).toHaveTextContent("“구체성”이 가장 약해요.");
    expect(within(answer).getByText(/해결 방법을 고른 이유/)).toBeInTheDocument();

    const feedback = screen.getByRole("region", { name: "피드백" });
    expect(within(feedback).getByRole("region", { name: "잘한 점" })).toHaveTextContent("첫 문장에서 원인을 정확히 짚었어요.");
    expect(within(feedback).getByRole("region", { name: "보완할 점" })).toHaveTextContent("구조 분리의 근거가 부족해요.");

    expect(screen.queryByText("외부 호출만 프록시를 거칩니다.")).not.toBeInTheDocument();
    const toggle = screen.getByRole("button", { name: "열기" });
    expect(toggle).toHaveAttribute("aria-expanded", "false");
    await user.click(toggle);
    expect(screen.getByRole("region", { name: "모범 답안" })).toHaveTextContent("외부 호출만 프록시를 거칩니다.");
    expect(screen.getByRole("button", { name: "닫기" })).toHaveAttribute("aria-expanded", "true");
  });

  it("uses the top improvement as the callout when there is no recommended step, without repeating it", () => {
    renderResult({ data: { ...RESULT, recommendedNextStep: null } });

    expect(within(screen.getByRole("region", { name: "내 답변" })).getByText(/구조 분리의 근거가 부족해요/)).toBeInTheDocument();
    expect(within(screen.getByRole("region", { name: "피드백" })).queryByRole("region", { name: "보완할 점" })).not.toBeInTheDocument();
  });

  it("keeps feedback short: two strengths, three improvements, missed points on one line", () => {
    const groups = feedbackGroups({
      ...RESULT,
      strengthSummary: "요약 강점",
      strengthPoints: ["강점 1", "강점 2", "강점 3"],
      improvementPoints: ["보완 1", "보완 2", "보완 3", "보완 4"],
      missedPoints: ["검증 방식", "대안 비교", "검증 방식"],
      weaknessSummary: "요약 약점",
      feedbackItems: [{ ...feedbackItem, title: "구조를 더 분명하게", description: "짧은 도입" }],
    });

    expect(groups.strengths).toEqual(["강점 1", "강점 2"]);
    expect(groups.improvements).toEqual(["보완 1", "보완 2", "보완 3"]);
    expect(groups.missed).toEqual(["검증 방식", "대안 비교"]);
    expect(groups.items).toEqual([]);
  });

  it("falls back to the summaries and rule-based items when there is no analysis", () => {
    const noAnalysis = feedbackGroups({ ...RESULT, strengthPoints: [], improvementPoints: [], weaknessSummary: "요약 약점" });
    expect(noAnalysis.improvements).toEqual(["요약 약점"]);

    const itemsOnly = feedbackGroups({
      ...RESULT,
      strengthPoints: [],
      improvementPoints: [],
      feedbackItems: [{ ...feedbackItem, title: "구조를 더 분명하게", description: "짧은 도입" }],
    });
    expect(itemsOnly.items).toHaveLength(1);
  });

  it("explains a missing evaluation instead of showing the raw backend message", () => {
    renderResult({ isError: true, error: new ApiClientError(404, "Answer attempt not found: 1") });

    expect(screen.getByRole("alert")).toHaveTextContent("평가 결과를 찾을 수 없어요");
    expect(screen.queryByText(/Answer attempt not found/)).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "연습으로 돌아가기" })).toHaveAttribute("href", "/questions");
  });

  it("offers a retry for server failures", async () => {
    const refetch = vi.fn();
    renderResult({ isError: true, error: new ApiClientError(500, "NullPointerException at ResultService"), refetch });

    expect(screen.getByRole("alert")).toHaveTextContent("답변 결과를 불러오지 못했습니다.");
    expect(screen.queryByText(/NullPointerException/)).not.toBeInTheDocument();
    await userEvent.setup().click(screen.getByRole("button", { name: "다시 시도" }));
    expect(refetch).toHaveBeenCalled();
  });
});
