import { fireEvent, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Navigate, Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { QuestionDetailModel } from "../../entities/question/model";
import { useSubmitAnswerMutation } from "../../features/answer/api/useSubmitAnswerMutation";
import { useQuestionAnswerHistoryQuery } from "../../features/question/api/useQuestionAnswerHistoryQuery";
import { useQuestionDetailQuery } from "../../features/question/api/useQuestionDetailQuery";
import { useResultAnalysisQuery } from "../../features/result/api/useResultAnalysisQuery";
import { useResumeListQuery } from "../../features/resume/api/useResumeListQuery";
import { AnswerEditorPage } from "../../pages/answer-editor/AnswerEditorPage";
import { ApiClientError } from "../../shared/api/errors";
import { LocationDisplay, renderWithProviders } from "../utils";

vi.mock("../../features/question/api/useQuestionDetailQuery", () => ({ useQuestionDetailQuery: vi.fn() }));
vi.mock("../../features/question/api/useQuestionAnswerHistoryQuery", () => ({ useQuestionAnswerHistoryQuery: vi.fn() }));
vi.mock("../../features/result/api/useResultAnalysisQuery", () => ({ useResultAnalysisQuery: vi.fn() }));
vi.mock("../../features/resume/api/useResumeListQuery", () => ({ useResumeListQuery: vi.fn() }));
vi.mock("../../features/answer/api/useSubmitAnswerMutation", () => ({ useSubmitAnswerMutation: vi.fn() }));

const QUESTION = {
  id: "11",
  title: "Self-invocation 시 @Transactional이 무시되는 이유는?",
  body: "프록시와 내부 호출의 관계를 설명하세요.",
  category: "Spring",
  difficulty: "HARD",
  tags: [],
  companies: [],
  roles: [],
  relatedSkills: [],
  learningMaterials: [],
  referenceAnswers: [],
  userProgressSummary: null,
  recommendedQuestions: [],
} satisfies QuestionDetailModel;

const mutateAsync = vi.fn();

beforeEach(() => {
  window.sessionStorage.clear();
  mutateAsync.mockReset().mockResolvedValue({ answerAttemptId: 81 });
  vi.mocked(useQuestionDetailQuery).mockReturnValue({ isLoading: false, isError: false, data: QUESTION, refetch: vi.fn() } as never);
  vi.mocked(useQuestionAnswerHistoryQuery).mockReturnValue({
    data: { items: [{ answerAttemptId: "7", submittedAtLabel: "9월 28일", totalScore: 42, totalScoreLabel: "점수 42", evaluationResultLabel: null, progressStatusLabel: null }] },
  } as never);
  vi.mocked(useResultAnalysisQuery).mockReturnValue({
    data: { recommendedNextStep: "해결 사례를 붙여 다시 답해보세요.", weaknessSummary: null, improvementPoints: [] },
  } as never);
  vi.mocked(useResumeListQuery).mockReturnValue({
    isLoading: false,
    isError: false,
    data: { items: [{ id: "1", title: "백엔드 이력서", versions: [{ id: "3", isActive: true }] }] },
  } as never);
  vi.mocked(useSubmitAnswerMutation).mockReturnValue({ mutateAsync, isPending: false, error: null } as never);
});

function renderEditor(route = "/questions/11/answer") {
  return renderWithProviders(
    <Routes>
      <Route element={<AnswerEditorPage />} path="/questions/:questionId/answer" />
      {/* The question page opens the editor with the question's depth in history state. */}
      <Route element={<Navigate replace state={{ depth: 3 }} to="/questions/11/answer" />} path="/from-flow" />
      <Route element={<LocationDisplay />} path="*" />
    </Routes>,
    { route, locale: "ko" },
  );
}

describe("AnswerEditorPage", () => {
  it("focuses on the question with the attempt line, the last score, and last feedback above the editor", () => {
    const { container } = renderEditor();

    expect(container.firstElementChild).toHaveClass("answer-page", "iv-ink-focus");
    expect(screen.getByRole("heading", { level: 1, name: QUESTION.title })).toBeInTheDocument();
    expect(screen.getByText("2번째 시도 · 어려움")).toBeInTheDocument();
    const feedback = screen.getByRole("complementary", { name: "지난 피드백" });
    expect(feedback).toHaveClass("answer-feedback--danger");
    expect(feedback).toHaveTextContent("지난 점수 42");
    expect(feedback).toHaveTextContent("해결 사례를 붙여 다시 답해보세요.");
    // The feedback sits right above the editor.
    expect(feedback.compareDocumentPosition(screen.getByLabelText("답변 입력")) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(useResultAnalysisQuery).toHaveBeenCalledWith("7");
    expect(screen.getByRole("link", { name: "나가기" })).toHaveAttribute("href", "/questions/11");
    expect(screen.getByLabelText("답변 입력")).toHaveFocus();
  });

  it("shows the focus bar trail, a running timer, and the depth the question page passed along", () => {
    renderEditor("/from-flow");

    const trail = screen.getByRole("navigation", { name: "현재 위치" });
    expect(within(trail).getByRole("link", { name: "질문" })).toHaveAttribute("href", "/questions");
    expect(within(trail).getByRole("link", { name: "Spring" })).toHaveAttribute("href", "/questions/11");
    expect(within(trail).getByText(QUESTION.title)).toHaveAttribute("aria-current", "page");
    expect(screen.getByText("경과 시간").parentElement).toHaveTextContent(/^경과 시간\d{2}:\d{2}$/);
    expect(screen.getByText("깊이 3 · 2번째 시도 · 어려움")).toBeInTheDocument();
  });

  it("checks the answer against the guide and names the resume it is evaluated with", () => {
    vi.mocked(useResumeListQuery).mockReturnValue({
      isLoading: false,
      isError: false,
      data: { items: [{ id: "1", title: "백엔드 이력서", versions: [{ id: "3", isActive: true, versionNumberLabel: "버전 2" }] }] },
    } as never);
    renderEditor();

    const guide = screen.getByRole("complementary", { name: "답변 가이드" });
    const checklist = within(guide).getByRole("region", { name: "답변 점검" });
    expect(within(checklist).getAllByRole("listitem").map((item) => item.querySelector("strong")?.textContent)).toEqual(["주장", "근거", "꼬리질문 대비"]);
    const resume = within(guide).getByRole("link", { name: /백엔드 이력서/ });
    expect(resume).toHaveAttribute("href", "/resume/3");
    expect(resume).toHaveTextContent("버전 2 · 이 이력서를 기준으로 평가해요");
  });

  it("blocks empty submissions with an announced error", async () => {
    renderEditor();

    await userEvent.setup().click(screen.getByRole("button", { name: "제출하고 평가받기" }));

    expect(screen.getByRole("alert")).toHaveTextContent("제출 전에 답변을 작성하세요.");
    expect(screen.getByLabelText("답변 입력")).toHaveAttribute("aria-invalid", "true");
    expect(mutateAsync).not.toHaveBeenCalled();
  });

  it("submits with the active resume version, clears the draft, and opens the result", async () => {
    const user = userEvent.setup();
    renderEditor();

    await user.type(screen.getByLabelText("답변 입력"), "프록시를 거치지 않기 때문입니다.");
    expect(window.sessionStorage.getItem("iterview.answer-draft.11")).toBe("프록시를 거치지 않기 때문입니다.");
    expect(screen.getByText("이 브라우저에 자동 저장됨")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "제출하고 평가받기" }));

    expect(mutateAsync).toHaveBeenCalledWith({ questionId: "11", resumeVersionId: "3", contentText: "프록시를 거치지 않기 때문입니다." });
    expect(await screen.findByTestId("location-display")).toHaveTextContent("/attempts/81");
    expect(window.sessionStorage.getItem("iterview.answer-draft.11")).toBeNull();
  });

  it("submits with Cmd/Ctrl+Enter from the editor", async () => {
    renderEditor();
    const editor = screen.getByLabelText("답변 입력");

    fireEvent.change(editor, { target: { value: "결론부터 말하면" } });
    fireEvent.keyDown(editor, { key: "Enter", metaKey: true });

    await screen.findByTestId("location-display");
    expect(mutateAsync).toHaveBeenCalledTimes(1);
  });

  it("explains answering without an active resume", () => {
    vi.mocked(useResumeListQuery).mockReturnValue({ isLoading: false, isError: false, data: { items: [] } } as never);
    renderEditor();

    expect(screen.getByText(/현재 활성 이력서 버전이 없습니다/)).toBeInTheDocument();
  });

  it("shows a not-found state for a missing question", () => {
    vi.mocked(useQuestionDetailQuery).mockReturnValue({ isLoading: false, isError: true, error: new ApiClientError(404, "Question not found: 11"), refetch: vi.fn() } as never);
    renderEditor();

    expect(screen.getByRole("alert")).toHaveTextContent("질문을 찾을 수 없습니다");
    expect(screen.getByRole("link", { name: "연습으로 돌아가기" })).toHaveAttribute("href", "/questions");
  });
});
