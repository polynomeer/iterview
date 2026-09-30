import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route, Routes, useNavigate } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { AnswerEditorPage } from "../../pages/answer-editor/AnswerEditorPage";
import { useAnswerDraft } from "../../features/answer/model/useAnswerDraft";
import { useQuestionDetailQuery } from "../../features/question/api/useQuestionDetailQuery";
import { useResumeListQuery } from "../../features/resume/api/useResumeListQuery";
import { useSubmitAnswerMutation } from "../../features/answer/api/useSubmitAnswerMutation";
import { mockMatchMedia, renderWithProviders } from "../utils";

const navigateMock = vi.fn();
const mutateAsyncMock = vi.fn();
const clearDraftMock = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");

  return {
    ...actual,
    useNavigate: vi.fn(),
  };
});

vi.mock("../../features/question/api/useQuestionDetailQuery", () => ({
  useQuestionDetailQuery: vi.fn(),
}));

vi.mock("../../features/resume/api/useResumeListQuery", () => ({
  useResumeListQuery: vi.fn(),
}));

vi.mock("../../features/answer/model/useAnswerDraft", () => ({
  useAnswerDraft: vi.fn(),
}));

vi.mock("../../features/answer/api/useSubmitAnswerMutation", () => ({
  useSubmitAnswerMutation: vi.fn(),
}));

describe("AnswerEditorPage", () => {
  it("submits the current draft with the active resume version and navigates to the result", async () => {
    vi.mocked(useNavigate).mockReturnValue(navigateMock);
    vi.mocked(useQuestionDetailQuery).mockReturnValue({
      data: {
        id: "question-7",
        title: "Explain a major refactor",
        body: "Describe the decision-making and tradeoffs.",
        category: "Behavioral",
        difficulty: "Intermediate",
        tags: [],
        companies: [],
        learningMaterials: [],
        userProgressSummary: null,
      },
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as never);
    vi.mocked(useResumeListQuery).mockReturnValue({
      data: {
        items: [
          {
            id: "resume-1",
            title: "Backend resume",
            versions: [
              {
                id: "resume-version-3",
                versionNumberLabel: "Version 3",
                isActive: true,
                uploadedAtLabel: "Mar 1, 2026",
                fileNameLabel: "backend-v3.pdf",
              },
            ],
          },
        ],
      },
      isLoading: false,
      isError: false,
      error: null,
    } as never);
    vi.mocked(useAnswerDraft).mockReturnValue({
      draft: "I led a staged refactor across three services.",
      setDraft: vi.fn(),
      clearDraft: clearDraftMock,
      hasDraft: true,
    });
    mutateAsyncMock.mockResolvedValue({ answerAttemptId: "attempt-9" });
    vi.mocked(useSubmitAnswerMutation).mockReturnValue({
      mutateAsync: mutateAsyncMock,
      isPending: false,
      error: null,
    } as never);

    const user = userEvent.setup();

    renderWithProviders(
      <Routes>
        <Route element={<AnswerEditorPage />} path="/questions/:questionId/answer" />
      </Routes>,
      { route: "/questions/question-7/answer" },
    );

    await user.click(screen.getByRole("button", { name: "Submit answer" }));

    expect(mutateAsyncMock).toHaveBeenCalledWith({
      questionId: "question-7",
      resumeVersionId: "resume-version-3",
      contentText: "I led a staged refactor across three services.",
    });
    expect(clearDraftMock).toHaveBeenCalled();
    expect(navigateMock).toHaveBeenCalledWith("/attempts/attempt-9");
  });

  it("renders the desktop answer workspace when the layout mode is desktop", () => {
    mockMatchMedia(true);
    vi.mocked(useNavigate).mockReturnValue(navigateMock);
    vi.mocked(useQuestionDetailQuery).mockReturnValue({
      data: {
        id: "question-7",
        title: "Explain a major refactor",
        body: "Describe the decision-making and tradeoffs.",
        category: "Behavioral",
        difficulty: "Intermediate",
        tags: [],
        companies: [],
        learningMaterials: [],
        userProgressSummary: null,
      },
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as never);
    vi.mocked(useResumeListQuery).mockReturnValue({
      data: {
        items: [
          {
            id: "resume-1",
            title: "Backend resume",
            versions: [
              {
                id: "resume-version-3",
                versionNumberLabel: "Version 3",
                isActive: true,
                uploadedAtLabel: "Mar 1, 2026",
                fileNameLabel: "backend-v3.pdf",
              },
            ],
          },
        ],
      },
      isLoading: false,
      isError: false,
      error: null,
    } as never);
    vi.mocked(useAnswerDraft).mockReturnValue({
      draft: "I led a staged refactor across three services.",
      setDraft: vi.fn(),
      clearDraft: clearDraftMock,
      hasDraft: true,
    });
    vi.mocked(useSubmitAnswerMutation).mockReturnValue({
      mutateAsync: mutateAsyncMock,
      isPending: false,
      error: null,
    } as never);

    renderWithProviders(
      <Routes>
        <Route element={<AnswerEditorPage />} path="/questions/:questionId/answer" />
      </Routes>,
      { route: "/questions/question-7/answer" },
    );

    expect(screen.getByText("Explain a major refactor")).toBeInTheDocument();
    expect(screen.getByText("Active version ready")).toBeInTheDocument();
    expect(document.querySelector(".answer-editor-layout--desktop")).not.toBeNull();
  });
});
