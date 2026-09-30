import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ResultAnalysisModel } from "../../entities/result/model";
import { useQuestionAnswerHistoryQuery } from "../../features/question/api/useQuestionAnswerHistoryQuery";
import { useResultAnalysisQuery } from "../../features/result/api/useResultAnalysisQuery";
import { ResultAnalysisPage } from "../../pages/result-analysis/ResultAnalysisPage";
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
        { answerAttemptId: "8", totalScore: 68 },
        { answerAttemptId: "7", totalScore: 42 },
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

describe("ResultAnalysisPage", () => {
  it("shows the total with its change since the last attempt and a status word", () => {
    renderResult({ data: RESULT });

    const summary = screen.getByRole("region", { name: "점수 요약" });
    expect(within(summary).getByText("68")).toHaveClass("ui-tone-text--warning");
    expect(within(summary).getByText(/▲ 26 \(지난 시도 42\)/)).toHaveClass("ui-tone-text--success");
    expect(within(summary).getByText("보완 필요", { selector: ".ui-badge" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 1, name: "평가 결과 · 3번째 시도" })).toBeInTheDocument();
  });

  it("charts only scored dimensions and names the weakest one next to a single retry action", () => {
    renderResult({ data: RESULT });

    const summary = screen.getByRole("region", { name: "점수 요약" });
    expect(within(summary).getAllByRole("progressbar").map((bar) => bar.getAttribute("aria-label"))).toEqual(["구조", "구체성", "기술 정확도"]);
    expect(within(summary).getByText("“구체성”").parentElement).toHaveTextContent("“구체성”이 가장 약해요.");
    expect(within(summary).getByRole("link", { name: "다시 답하기" })).toHaveAttribute("href", "/questions/11/answer");
    expect(within(summary).getByRole("link", { name: "다음 꼬리질문으로" })).toHaveAttribute("href", "/questions/12");
    expect(within(summary).getByText("10월 3일에 복습 목록에 다시 올라와요")).toBeInTheDocument();
    expect(document.querySelectorAll(".ui-button--primary")).toHaveLength(1);
  });

  it("shows the submitted answer, feedback with worded tone, and a collapsed model answer", () => {
    renderResult({ data: RESULT });

    expect(screen.getByText("Spring의 @Transactional은 프록시 기반 AOP로 동작합니다.")).toBeInTheDocument();
    const feedback = screen.getByRole("region", { name: "피드백" });
    expect(within(feedback).getByText(/잘한 점:/)).toBeInTheDocument();
    expect(within(feedback).getByText(/보완할 점:/)).toBeInTheDocument();
    expect(screen.getByText("모범 답안과 비교하기").closest("details")).not.toHaveAttribute("open");
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
