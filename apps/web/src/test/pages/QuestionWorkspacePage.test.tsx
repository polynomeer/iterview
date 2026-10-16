import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { QuestionDetailModel } from "../../entities/question/model";
import {
  useQuestionLibraryStateQuery,
  useSaveQuestionNoteMutation,
  useToggleBookmarkMutation,
} from "../../features/library/api/useQuestionLibraryState";
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
vi.mock("../../features/library/api/useQuestionLibraryState", () => ({
  useQuestionLibraryStateQuery: vi.fn(),
  useToggleBookmarkMutation: vi.fn(),
  useSaveQuestionNoteMutation: vi.fn(),
}));
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

const TREE = [
  { id: "11", title: QUESTION.title, depth: 0, difficulty: "HARD", relationshipType: null, parentQuestionId: null, status: "weak", isRoot: true },
  { id: "12", title: "AspectJ 모드로 바꾸면 무엇이 달라지나요?", depth: 1, difficulty: "HARD", relationshipType: "follow_up", parentQuestionId: "11", status: "unanswered", isRoot: false },
  { id: "13", title: "private 메서드에 붙이면?", depth: 1, difficulty: "MEDIUM", relationshipType: "follow_up", parentQuestionId: "11", status: "strong", isRoot: false },
  { id: "14", title: "컴파일 타임 위빙의 비용은?", depth: 2, difficulty: "HARD", relationshipType: "follow_up", parentQuestionId: "12", status: "answered", isRoot: false },
];

const mutateAsync = vi.fn();

beforeEach(() => {
  mutateAsync.mockReset().mockResolvedValue({});
  vi.mocked(useAuth).mockReturnValue({ accessToken: "t", isAuthenticated: true, setAccessToken: vi.fn(), clearSession: vi.fn() });
  toggleBookmark.mockReset();
  saveNote.mockReset();
  vi.mocked(useQuestionLibraryStateQuery).mockReturnValue({
    data: { questionId: 11, bookmarked: false, bookmarkedAt: null, note: { body: "프록시 경계 기억하기", updatedAt: "2026-10-01T00:00:00Z" } },
    isError: false,
  } as never);
  vi.mocked(useToggleBookmarkMutation).mockReturnValue({ mutate: toggleBookmark, isPending: false, isError: false } as never);
  vi.mocked(useSaveQuestionNoteMutation).mockReturnValue({ mutate: saveNote, isPending: false, isError: false, isSuccess: false } as never);
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
  vi.mocked(useQuestionTreeQuery).mockImplementation(((id: string | undefined) => {
    // The tree endpoint returns the asked question as depth 0 with its follow-ups below it.
    const nodes = id === "12" ? TREE.filter((node) => node.id === "12" || node.id === "14") : id === "11" ? TREE : [];
    return { isLoading: false, isError: false, data: { rootQuestionId: id ?? null, nodes }, refetch: vi.fn() };
  }) as never);
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
      <Route
        element={
          <>
            {element}
            <LocationDisplay />
          </>
        }
        path="/questions/:questionId"
      />
      <Route element={<QuestionWorkspacePage defaultTreeOpen />} path="/questions/:questionId/tree" />
      <Route element={<LocationDisplay />} path="*" />
    </Routes>,
    { route, locale: "ko" },
  );
}

const toggleBookmark = vi.fn();
const saveNote = vi.fn();

describe("QuestionWorkspacePage", () => {
  it("saves the question to 보관함 and keeps a private note on it (ADR 0083)", async () => {
    const user = userEvent.setup();
    renderWorkspace();

    const bookmark = screen.getByRole("button", { name: "저장" });
    expect(bookmark).toHaveAttribute("aria-pressed", "false");
    await user.click(bookmark);
    expect(toggleBookmark).toHaveBeenCalledWith(true);

    const note = screen.getByLabelText("내 노트");
    expect(note).toHaveValue("프록시 경계 기억하기");
    expect(screen.getByRole("button", { name: "노트 저장" })).toBeDisabled();
    await user.clear(note);
    await user.type(note, "self-invocation은 프록시를 우회한다");
    expect(screen.getByText("저장하지 않은 변경")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "노트 저장" }));
    // The click blurs the textarea first; that blur saves, and the click does not save again.
    expect(saveNote).toHaveBeenCalledTimes(1);
    expect(saveNote.mock.calls[0][0]).toBe("self-invocation은 프록시를 우회한다");
  });


  it("shows the question with one primary action, its status, companies, depth, and what the interviewer checks", () => {
    renderWorkspace();

    expect(screen.getByRole("heading", { level: 1, name: QUESTION.title })).toBeInTheDocument();
    const main = document.querySelector<HTMLElement>(".question-workspace__main")!;
    expect(within(main).getByText("약점 · 42점")).toHaveClass("ui-badge--danger");
    expect(within(main).getByText("Toss 기출")).toBeInTheDocument();
    expect(within(main).getByText("깊이 1")).toBeInTheDocument();
    expect(within(main).getByText("Spring · 어려움")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "답변하기" })).toHaveAttribute("href", "/questions/11/answer");
    expect(document.querySelectorAll(".question-workspace__main .ui-button--primary")).toHaveLength(1);
    const intent = screen.getByRole("region", { name: "면접관이 확인하려는 것" });
    expect(intent).toHaveTextContent("Spring AOP 프록시와 내부 호출의 관계를 설명하세요.");
  });

  it("puts a breadcrumb and a 흐름/목록 view switch in the top bar", async () => {
    const user = userEvent.setup();
    renderWorkspace();

    const trail = screen.getByRole("navigation", { name: "현재 위치" });
    expect(within(trail).getByRole("link", { name: "질문" })).toHaveAttribute("href", "/questions");
    expect(within(trail).getByText("Spring")).toBeInTheDocument();
    expect(within(trail).getByText(QUESTION.title)).toHaveAttribute("aria-current", "page");

    const views = screen.getByRole("radiogroup", { name: "보기" });
    expect(within(views).getByRole("radio", { name: "흐름" })).toHaveAttribute("aria-checked", "true");
    expect(screen.queryByRole("navigation", { name: "질문 목록" })).not.toBeInTheDocument();
    await user.click(within(views).getByRole("radio", { name: "목록" }));
    expect(screen.getByTestId("location-display")).toHaveTextContent("/questions/11?view=list");
    expect(screen.getByRole("navigation", { name: "질문 목록" })).toBeInTheDocument();
    expect(screen.queryByRole("region", { name: "꼬리질문 흐름" })).not.toBeInTheDocument();
  });

  it("opens one column per depth: topics, the topic's questions, then follow-ups", () => {
    renderWorkspace();

    const flow = screen.getByRole("region", { name: "꼬리질문 흐름" });
    const topics = within(flow).getByRole("listbox", { name: "깊이 0 · 주제" });
    expect(within(topics).getByRole("option", { name: /Spring/ })).toHaveAttribute("aria-selected", "true");
    expect(within(topics).getByRole("option", { name: /System Design/ })).toHaveTextContent("1");

    const questions = within(flow).getByRole("listbox", { name: "깊이 1" });
    const current = within(questions).getByRole("option", { selected: true });
    expect(current).toHaveTextContent(QUESTION.title);
    expect(current).toHaveAttribute("aria-current", "true");
    expect(current).toHaveTextContent("약점");
    expect(current).toHaveTextContent("42");

    const followUps = within(flow).getByRole("listbox", { name: "깊이 2" });
    expect(within(followUps).getAllByRole("option").map((option) => option.textContent)).toEqual([
      "미답변AspectJ 모드로 바꾸면 무엇이 달라지나요?",
      "숙달private 메서드에 붙이면?",
    ]);
    expect(within(followUps).queryByRole("option", { selected: true })).not.toBeInTheDocument();
    expect(within(flow).queryByRole("listbox", { name: "깊이 3" })).not.toBeInTheDocument();
  });

  it("keeps the path when a follow-up is picked and opens its follow-ups in the next column", async () => {
    const user = userEvent.setup();
    renderWorkspace();

    await user.click(screen.getByRole("option", { name: /AspectJ/ }));

    expect(screen.getByTestId("location-display")).toHaveTextContent("/questions/12");
    const flow = screen.getByRole("region", { name: "꼬리질문 흐름" });
    expect(within(within(flow).getByRole("listbox", { name: "깊이 1" })).getByRole("option", { selected: true })).toHaveTextContent(QUESTION.title);
    expect(within(within(flow).getByRole("listbox", { name: "깊이 2" })).getByRole("option", { selected: true })).toHaveTextContent("AspectJ");
    expect(within(within(flow).getByRole("listbox", { name: "깊이 3" })).getByRole("option")).toHaveTextContent("컴파일 타임 위빙의 비용은?");
    expect(within(document.querySelector<HTMLElement>(".question-workspace__main")!).getByText("깊이 2")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "답변하기" })).toHaveAttribute("href", "/questions/12/answer");
  });

  it("moves through the columns with arrow keys, one tab stop per column, and picks with Enter", async () => {
    const user = userEvent.setup();
    renderWorkspace();
    const flow = screen.getByRole("region", { name: "꼬리질문 흐름" });
    const spring = within(flow).getByRole("option", { name: /Spring/ });
    const followUps = within(within(flow).getByRole("listbox", { name: "깊이 2" })).getAllByRole("option");

    expect(spring).toHaveAttribute("tabindex", "0");
    expect(followUps.map((option) => option.getAttribute("tabindex"))).toEqual(["0", "-1"]);

    spring.focus();
    await user.keyboard("{ArrowRight}");
    expect(within(within(flow).getByRole("listbox", { name: "깊이 1" })).getByRole("option", { selected: true })).toHaveFocus();
    await user.keyboard("{ArrowRight}");
    expect(followUps[0]).toHaveFocus();
    await user.keyboard("{ArrowDown}");
    expect(followUps[1]).toHaveFocus();
    expect(followUps[1]).toHaveAttribute("tabindex", "0");
    await user.keyboard("{Enter}");
    expect(screen.getByTestId("location-display")).toHaveTextContent("/questions/13");
  });

  it("browses another topic without leaving the question", async () => {
    const user = userEvent.setup();
    renderWorkspace();
    const flow = screen.getByRole("region", { name: "꼬리질문 흐름" });

    await user.click(within(flow).getByRole("option", { name: /System Design/ }));

    expect(screen.getByTestId("location-display")).toHaveTextContent("/questions/11");
    const questions = within(flow).getByRole("listbox", { name: "깊이 1" });
    expect(within(questions).getByRole("option")).toHaveTextContent("Kafka 컨슈머를 멱등하게 만드는 방법은?");
    expect(within(questions).queryByRole("option", { selected: true })).not.toBeInTheDocument();
    expect(within(flow).queryByRole("listbox", { name: "깊이 2" })).not.toBeInTheDocument();
  });

  it("shows one column at a time on phones, with a back control to the previous depth", async () => {
    const user = userEvent.setup();
    renderWorkspace();
    const flow = screen.getByRole("region", { name: "꼬리질문 흐름" });
    const activeColumn = () => flow.querySelector<HTMLElement>(".question-flow__column--phone-active")!;

    // The current question has follow-ups, so phones open on them.
    expect(within(activeColumn()).getByRole("listbox", { name: "깊이 2" })).toBeInTheDocument();
    await user.click(within(activeColumn()).getByRole("button", { name: "깊이 1" }));
    expect(within(activeColumn()).getByRole("listbox", { name: "깊이 1" })).toBeInTheDocument();
  });

  it("shows loading and error states inside the columns", () => {
    vi.mocked(usePracticeQuestionsQuery).mockReturnValue({ isLoading: false, isError: true, error: new Error("boom"), refetch: vi.fn() } as never);
    renderWorkspace();

    const flow = screen.getByRole("region", { name: "꼬리질문 흐름" });
    expect(within(flow).getAllByText("질문을 불러오지 못했어요.").length).toBeGreaterThan(0);
    expect(within(flow).getAllByRole("button", { name: "다시 시도" }).length).toBeGreaterThan(0);
  });

  it("lists the follow-ups that come after answering", () => {
    renderWorkspace();

    const followups = screen.getByRole("region", { name: "답변 후 이어질 꼬리질문" });
    const links = within(followups).getAllByRole("link");
    expect(links.map((link) => link.getAttribute("href"))).toEqual(["/questions/12", "/questions/13"]);
    expect(links[1]).toHaveTextContent("숙달");
  });

  it("keeps the legacy tree route on the 흐름 view", () => {
    renderWorkspace("/questions/11/tree?view=list");

    expect(screen.getByRole("region", { name: "꼬리질문 흐름" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "흐름" })).toHaveAttribute("aria-checked", "true");
  });

  it("marks the current question in the 목록 view and keeps filters on its links", () => {
    renderWorkspace("/questions/11?category=4&view=list");

    const navigator = screen.getByRole("navigation", { name: "질문 목록" });
    expect(within(navigator).getByRole("link", { current: "page" })).toHaveTextContent(QUESTION.title);
    expect(within(navigator).getByRole("link", { name: /Kafka/ })).toHaveAttribute("href", "/questions/31?category=4&view=list");
  });

  it("shows the answer record with scores that link to results", () => {
    renderWorkspace();

    const inspector = screen.getByRole("complementary", { name: "질문 정보" });
    const record = within(inspector).getByRole("region", { name: "내 기록" });
    expect(within(record).getByRole("img", { name: "시도별 점수: 42" })).toBeInTheDocument();
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
    expect(screen.queryByRole("button", { name: "저장" })).not.toBeInTheDocument();
    expect(screen.queryByLabelText("내 노트")).not.toBeInTheDocument();
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
  function renderIndex(route: string) {
    return renderWithProviders(
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
      { route, locale: "ko" },
    );
  }

  it("opens on the topic column and suggests the first question", () => {
    renderIndex("/questions");

    const flow = screen.getByRole("region", { name: "꼬리질문 흐름" });
    expect(within(within(flow).getByRole("listbox", { name: "깊이 0 · 주제" })).getByRole("option", { selected: true })).toHaveTextContent("Spring");
    expect(within(within(flow).getByRole("listbox", { name: "깊이 1" })).getByRole("option")).toHaveTextContent(QUESTION.title);
    expect(screen.getByRole("link", { name: "첫 질문 열기" })).toHaveAttribute("href", "/questions/11");
  });

  it("writes 목록 filters to the URL", async () => {
    const user = userEvent.setup();
    renderIndex("/questions?view=list");

    await user.selectOptions(screen.getByLabelText("난이도"), "HARD");
    expect(screen.getByTestId("location-display")).toHaveTextContent("/questions?view=list&difficulty=HARD");
    expect(usePracticeQuestionsQuery).toHaveBeenLastCalledWith({ search: undefined, category: undefined, difficulty: "HARD" });
  });
});
