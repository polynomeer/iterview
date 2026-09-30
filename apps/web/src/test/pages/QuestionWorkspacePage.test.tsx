import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { QuestionDetailModel } from "../../entities/question/model";
import { usePracticeQuestionsQuery } from "../../features/practice/api/usePracticeQuestionsQuery";
import { useCreateQuestionLearningMaterialMutation } from "../../features/question/api/useCreateQuestionLearningMaterialMutation";
import { useCreateQuestionReferenceAnswerMutation } from "../../features/question/api/useCreateQuestionReferenceAnswerMutation";
import { useQuestionAnswerHistoryQuery } from "../../features/question/api/useQuestionAnswerHistoryQuery";
import { useQuestionDetailQuery } from "../../features/question/api/useQuestionDetailQuery";
import { useQuestionLearningMaterialsQuery } from "../../features/question/api/useQuestionLearningMaterialsQuery";
import { useQuestionReferenceAnswersQuery } from "../../features/question/api/useQuestionReferenceAnswersQuery";
import { useQuestionTreeQuery } from "../../features/question/api/useQuestionTreeQuery";
import { useRecommendedFollowupsQuery } from "../../features/question/api/useRecommendedFollowupsQuery";
import { QuestionsIndexPage, QuestionWorkspacePage } from "../../pages/questions/QuestionWorkspacePage";
import { ApiClientError } from "../../shared/api/errors";
import { useAuth } from "../../shared/auth/useAuth";
import { LocationDisplay, renderWithProviders } from "../utils";

vi.mock("../../shared/auth/useAuth", () => ({ useAuth: vi.fn() }));
vi.mock("../../features/practice/api/usePracticeQuestionsQuery", () => ({ usePracticeQuestionsQuery: vi.fn() }));
vi.mock("../../features/question/api/useQuestionDetailQuery", () => ({ useQuestionDetailQuery: vi.fn() }));
vi.mock("../../features/question/api/useQuestionTreeQuery", () => ({ useQuestionTreeQuery: vi.fn() }));
vi.mock("../../features/question/api/useRecommendedFollowupsQuery", () => ({ useRecommendedFollowupsQuery: vi.fn() }));
vi.mock("../../features/question/api/useQuestionAnswerHistoryQuery", () => ({ useQuestionAnswerHistoryQuery: vi.fn() }));
vi.mock("../../features/question/api/useQuestionReferenceAnswersQuery", () => ({ useQuestionReferenceAnswersQuery: vi.fn() }));
vi.mock("../../features/question/api/useQuestionLearningMaterialsQuery", () => ({ useQuestionLearningMaterialsQuery: vi.fn() }));
vi.mock("../../features/question/api/useCreateQuestionReferenceAnswerMutation", () => ({ useCreateQuestionReferenceAnswerMutation: vi.fn() }));
vi.mock("../../features/question/api/useCreateQuestionLearningMaterialMutation", () => ({ useCreateQuestionLearningMaterialMutation: vi.fn() }));

const QUESTION: QuestionDetailModel = {
  id: "11",
  title: "Self-invocation 시 @Transactional이 무시되는 이유는?",
  body: "Spring AOP 프록시와 내부 호출의 관계를 설명하세요.",
  category: "Spring",
  difficulty: "HARD",
  tags: ["aop"],
  companies: ["Toss"],
  roles: [],
  relatedSkills: [],
  learningMaterials: [],
  referenceAnswers: [
    { id: "r1", title: "프록시 경계로 설명하기", answerText: "외부 호출만 프록시를 거칩니다.", answerFormat: "outline", sourceLabel: "Editorial", sourceType: "editorial", contentLocale: "ko", isUserGenerated: false, isOfficial: true, displayOrder: 0 },
  ],
  userProgressSummary: { status: "retry_pending", attemptsCount: 3, bestScoreLabel: "42", lastReviewedLabel: "9월 28일", nextReviewLabel: "10월 1일", masteryLevelLabel: null },
  recommendedQuestions: [],
};

const mutateAsync = vi.fn();

beforeEach(() => {
  mutateAsync.mockReset().mockResolvedValue({});
  vi.mocked(useAuth).mockReturnValue({ accessToken: "t", isAuthenticated: true, setAccessToken: vi.fn(), clearSession: vi.fn() });
  vi.mocked(usePracticeQuestionsQuery).mockReturnValue({
    isLoading: false,
    isError: false,
    data: {
      items: [
        { id: "11", title: QUESTION.title, categoryLabel: "Spring", difficulty: "HARD" },
        { id: "31", title: "Kafka 컨슈머를 멱등하게 만드는 방법은?", categoryLabel: "System Design", difficulty: "MEDIUM" },
      ],
      filters: { categories: [{ id: "4", label: "Spring" }], companies: [], difficulties: [], statuses: [] },
    },
  } as never);
  vi.mocked(useQuestionDetailQuery).mockReturnValue({ isLoading: false, isError: false, data: QUESTION, refetch: vi.fn() } as never);
  vi.mocked(useQuestionTreeQuery).mockReturnValue({
    isLoading: false,
    data: {
      rootQuestionId: "11",
      nodes: [
        { id: "11", title: QUESTION.title, depth: 0, difficulty: "HARD", relationshipType: null, parentQuestionId: null, status: "weak", isRoot: true },
        { id: "12", title: "AspectJ 모드로 바꾸면 무엇이 달라지나요?", depth: 1, difficulty: "HARD", relationshipType: "follow_up", parentQuestionId: "11", status: "unanswered", isRoot: false },
        { id: "13", title: "private 메서드에 붙이면?", depth: 1, difficulty: "MEDIUM", relationshipType: "follow_up", parentQuestionId: "11", status: "strong", isRoot: false },
        { id: "14", title: "컴파일 타임 위빙의 비용은?", depth: 2, difficulty: "HARD", relationshipType: "follow_up", parentQuestionId: "12", status: "answered", isRoot: false },
      ],
    },
  } as never);
  vi.mocked(useRecommendedFollowupsQuery).mockReturnValue({ isLoading: false, data: [] } as never);
  vi.mocked(useQuestionAnswerHistoryQuery).mockReturnValue({
    isLoading: false,
    isError: false,
    data: { items: [{ answerAttemptId: "7", submittedAtLabel: "9월 28일 오후 3:10", totalScore: 42, totalScoreLabel: "점수 42", evaluationResultLabel: "근거 부족", progressStatusLabel: null }] },
  } as never);
  vi.mocked(useQuestionReferenceAnswersQuery).mockReturnValue({ data: undefined } as never);
  vi.mocked(useQuestionLearningMaterialsQuery).mockReturnValue({ data: undefined } as never);
  vi.mocked(useCreateQuestionReferenceAnswerMutation).mockReturnValue({ mutateAsync, isPending: false } as never);
  vi.mocked(useCreateQuestionLearningMaterialMutation).mockReturnValue({ mutateAsync, isPending: false } as never);
});

function renderWorkspace(route = "/questions/11", element = <QuestionWorkspacePage />) {
  return renderWithProviders(
    <Routes>
      <Route element={element} path="/questions/:questionId" />
      <Route element={<QuestionWorkspacePage defaultTreeOpen />} path="/questions/:questionId/tree" />
      <Route element={<LocationDisplay />} path="*" />
    </Routes>,
    { route, locale: "ko" },
  );
}

describe("QuestionWorkspacePage", () => {
  it("shows the question with one primary action, localized metadata, and its mastery", () => {
    renderWorkspace();

    expect(screen.getByRole("heading", { level: 1, name: QUESTION.title })).toBeInTheDocument();
    const main = document.querySelector<HTMLElement>(".question-workspace__main")!;
    expect(within(main).getByText("어려움")).toBeInTheDocument();
    expect(within(main).getAllByText("약점")[0]).toHaveClass("ui-badge--danger");
    expect(screen.getByRole("link", { name: "답변하기" })).toHaveAttribute("href", "/questions/11/answer");
    expect(document.querySelectorAll(".question-workspace__main .ui-button--primary")).toHaveLength(1);
    expect(screen.getByText("Spring AOP 프록시와 내부 호출의 관계를 설명하세요.")).toBeInTheDocument();
  });

  it("lists direct follow-ups and keeps the full tree collapsed until requested", () => {
    renderWorkspace();

    const followups = screen.getByRole("region", { name: "다음 꼬리질문" });
    const [nextList] = within(followups).getAllByRole("list");
    const links = within(nextList).getAllByRole("link");
    expect(links.map((link) => link.getAttribute("href"))).toEqual(["/questions/12", "/questions/13"]);
    expect(screen.getByText("전체 꼬리질문 트리 (3)").closest("details")).not.toHaveAttribute("open");
  });

  it("opens the full tree from the legacy tree route", () => {
    renderWorkspace("/questions/11/tree");

    const tree = screen.getByText("전체 꼬리질문 트리 (3)").closest("details")!;
    expect(tree).toHaveAttribute("open");
    expect(within(tree).getByRole("link", { name: "컴파일 타임 위빙의 비용은?" })).toHaveAttribute("href", "/questions/14");
  });

  it("marks the current question in the navigator and keeps filters on its links", () => {
    renderWorkspace("/questions/11?category=4");

    const navigator = screen.getByRole("navigation", { name: "질문 목록" });
    expect(within(navigator).getByRole("link", { current: "page" })).toHaveTextContent(QUESTION.title);
    expect(within(navigator).getByRole("link", { name: /Kafka/ })).toHaveAttribute("href", "/questions/31?category=4");
  });

  it("shows the answer record with scores that link to results", () => {
    renderWorkspace();

    const inspector = screen.getByRole("complementary", { name: "질문 정보" });
    expect(within(inspector).getByText("3")).toBeInTheDocument();
    expect(within(inspector).getByText("다음 복습 10월 1일")).toBeInTheDocument();
    expect(within(inspector).getByRole("link", { name: /9월 28일 오후 3:10/ })).toHaveAttribute("href", "/attempts/7");
    expect(within(inspector).getByText("42점")).toHaveClass("ui-badge--danger");
  });

  it("asks guests to sign in instead of showing an empty record", () => {
    vi.mocked(useAuth).mockReturnValue({ accessToken: null, isAuthenticated: false, setAccessToken: vi.fn(), clearSession: vi.fn() });
    renderWorkspace();

    expect(screen.getByText("내 기록은 로그인 후에 보여요")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "로그인" })).toHaveAttribute("href", "/login");
  });

  it("jumps to reference answers from the header action", async () => {
    const user = userEvent.setup();
    renderWorkspace();

    await user.click(screen.getByRole("button", { name: "모범 답안 보기" }));

    expect(screen.getByRole("tab", { name: /모범 답안/ })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText("외부 호출만 프록시를 거칩니다.")).toBeVisible();
  });

  it("validates and saves a new reference answer from a dialog", async () => {
    const user = userEvent.setup();
    renderWorkspace();
    await user.click(screen.getByRole("tab", { name: /모범 답안/ }));
    await user.click(screen.getByRole("button", { name: "모범 답안 추가" }));

    const dialog = screen.getByRole("dialog", { name: "모범 답안 추가" });
    await user.click(within(dialog).getByRole("button", { name: "저장" }));
    expect(within(dialog).getByRole("alert")).toHaveTextContent("제목과 답변 내용을 모두 입력한 뒤 저장하세요.");
    expect(mutateAsync).not.toHaveBeenCalled();

    await user.type(within(dialog).getByLabelText("제목"), "내 개요");
    await user.type(within(dialog).getByLabelText("답변 내용"), "프록시를 먼저 말한다.");
    await user.click(within(dialog).getByRole("button", { name: "저장" }));

    expect(mutateAsync).toHaveBeenCalledWith({ questionId: "11", body: { title: "내 개요", answerText: "프록시를 먼저 말한다.", answerFormat: "outline" } });
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });

  it("explains a missing question instead of a generic error", () => {
    vi.mocked(useQuestionDetailQuery).mockReturnValue({ isLoading: false, isError: true, error: new ApiClientError(404, "Question not found: 99"), data: undefined, refetch: vi.fn() } as never);
    renderWorkspace("/questions/99");

    expect(screen.getByRole("alert")).toHaveTextContent("질문을 찾을 수 없어요");
    expect(screen.queryByText(/Question not found: 99/)).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "질문 목록으로" })).toHaveAttribute("href", "/questions");
  });
});

describe("QuestionsIndexPage", () => {
  it("suggests the first question and writes filters to the URL", async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <Routes>
        <Route
          element={
            <>
              <QuestionsIndexPage />
              <LocationDisplay />
            </>
          }
          path="/questions"
        />
      </Routes>,
      { route: "/questions", locale: "ko" },
    );

    await waitFor(() => expect(screen.getByRole("link", { name: "첫 질문 열기" })).toHaveAttribute("href", "/questions/11"));
    await user.selectOptions(screen.getByLabelText("난이도"), "HARD");
    expect(screen.getByTestId("location-display")).toHaveTextContent("/questions?difficulty=HARD");
    expect(usePracticeQuestionsQuery).toHaveBeenLastCalledWith({ search: undefined, category: undefined, difficulty: "HARD" });
  });
});
