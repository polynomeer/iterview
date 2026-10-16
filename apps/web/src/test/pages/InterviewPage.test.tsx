import userEvent from "@testing-library/user-event";
import { screen, waitFor, within } from "@testing-library/react";
import { Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useCreateInterviewSessionMutation } from "../../features/interview/api/useCreateInterviewSessionMutation";
import { useInterviewSessionsQuery } from "../../features/interview/api/useInterviewSessionsQuery";
import { useInterviewRecordListQuery } from "../../features/practical-interview/api/useInterviewRecordListQuery";
import { useResumeListQuery } from "../../features/resume/api/useResumeListQuery";
import { useReviewQueueQuery } from "../../features/review-queue/api/useReviewQueueQuery";
import { InterviewPage } from "../../pages/interview/InterviewPage";
import { LocationDisplay, renderWithProviders } from "../utils";

vi.mock("../../features/interview/api/useCreateInterviewSessionMutation", () => ({ useCreateInterviewSessionMutation: vi.fn() }));
vi.mock("../../features/interview/api/useInterviewSessionsQuery", () => ({ useInterviewSessionsQuery: vi.fn() }));
vi.mock("../../features/practical-interview/api/useInterviewRecordListQuery", () => ({ useInterviewRecordListQuery: vi.fn() }));
vi.mock("../../features/resume/api/useResumeListQuery", () => ({ useResumeListQuery: vi.fn() }));
vi.mock("../../features/review-queue/api/useReviewQueueQuery", () => ({ useReviewQueueQuery: vi.fn() }));

const mutateAsync = vi.fn();

function mockResume(active: boolean) {
  vi.mocked(useResumeListQuery).mockReturnValue({
    data: {
      items: active
        ? [{ id: "resume-1", title: "Backend Resume", versions: [{ id: "version-2", versionNumberLabel: "Version 2", isActive: true, parsingStatus: "completed" }] }]
        : [],
    },
    isLoading: false,
    isError: false,
  } as never);
}

beforeEach(() => {
  mutateAsync.mockReset().mockResolvedValue({ id: "session-2" });
  vi.mocked(useCreateInterviewSessionMutation).mockReturnValue({ mutateAsync, isPending: false, error: null } as never);
  vi.mocked(useReviewQueueQuery).mockReturnValue({ data: { items: [{ id: "r1" }, { id: "r2" }] } } as never);
  vi.mocked(useInterviewSessionsQuery).mockReturnValue({
    data: [
      { id: "session-1", sessionType: "resume_mock", interviewMode: "mock_30", status: "completed", startedAtLabel: "3월 12일", questionCount: 5, answeredCount: 5, averageScore: 84, averageScoreLabel: "84" },
      { id: "session-3", sessionType: "review_mock", interviewMode: "quick_screen", status: "in_progress", startedAtLabel: "3월 13일", questionCount: 3, answeredCount: 1, averageScore: null, averageScoreLabel: null },
    ],
    isLoading: false,
    isError: false,
  } as never);
  vi.mocked(useInterviewRecordListQuery).mockReturnValue({
    data: [{ id: "record-7", title: "Acme · Backend", interviewDateLabel: "2026. 10. 2.", createdAtLabel: null, questionCount: 12 }],
    isLoading: false,
    isError: false,
  } as never);
});

function renderPage() {
  renderWithProviders(
    <Routes>
      <Route element={<InterviewPage />} path="/interview" />
      <Route element={<LocationDisplay />} path="/interview/sessions/:sessionId" />
    </Routes>,
    { route: "/interview", locale: "ko" },
  );
}

describe("InterviewPage", () => {
  it("starts a resume-based interview on the active version without a version picker", async () => {
    mockResume(true);
    renderPage();

    expect(screen.getByRole("heading", { level: 1, name: "면접" })).toBeInTheDocument();
    const views = screen.getByRole("navigation", { name: "면접 종류" });
    expect(within(views).getByRole("link", { name: "모의면접" })).toHaveAttribute("aria-current", "page");
    expect(within(views).getByRole("link", { name: "실전 면접 복기" })).toHaveAttribute("href", "/interview/records");
    expect(screen.getByRole("heading", { level: 2, name: "세 가지만 정하면 바로 시작해요" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "내 이력서" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "내 이력서" })).toHaveAccessibleDescription("Backend Resume · Version 2");
    expect(screen.getByRole("radio", { name: "모의 30" })).toBeChecked();

    await userEvent.click(screen.getByRole("radio", { name: "전체 범위" }));
    await userEvent.click(screen.getByRole("radio", { name: "5문항" }));
    expect(screen.getByRole("radio", { name: "5문항" })).toBeChecked();
    expect(screen.getByText(/Backend Resume · Version 2 · 전체 범위 · 5문항/)).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "모의면접 시작" }));

    expect(mutateAsync).toHaveBeenCalledWith({ sessionType: "resume_mock", interviewMode: "full_coverage", questionCount: 5, resumeVersionId: "version-2" });
    await waitFor(() => expect(screen.getByTestId("location-display")).toHaveTextContent("/interview/sessions/session-2"));
  });

  it("falls back to review questions when there is no active resume", async () => {
    mockResume(false);
    renderPage();

    expect(screen.getByRole("radio", { name: "내 이력서" })).toBeDisabled();
    expect(screen.getByRole("radio", { name: "복습할 질문" })).toBeChecked();
    expect(screen.queryByRole("radio", { name: "전체 범위" })).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "모의면접 시작" }));
    expect(mutateAsync).toHaveBeenCalledWith({ sessionType: "review_mock", interviewMode: "mock_30", questionCount: 3, resumeVersionId: null });
  });

  it("lists past mock sessions and real interview records, each linking to its page", () => {
    mockResume(true);
    renderPage();

    const history = screen.getByRole("region", { name: "지난 면접" });
    expect(within(history).getByRole("link", { name: /84.*결과/ })).toHaveAttribute("href", "/interview/sessions/session-1/result");
    expect(within(history).getByRole("link", { name: /진행 중.*이어서/ })).toHaveAttribute("href", "/interview/sessions/session-3");
    const record = within(history).getByRole("link", { name: /실전.*Acme · Backend/ });
    expect(record).toHaveAttribute("href", "/interview/records/record-7");
    expect(within(record).getByText("2026. 10. 2. · 받은 질문 12개 기록")).toBeInTheDocument();

    expect(screen.getByRole("link", { name: "면접 복기 기록하기" })).toHaveAttribute("href", "/interview/records/upload");
    expect(screen.getAllByRole("button", { name: "모의면접 시작" })).toHaveLength(1);
  });

  it("keeps an empty state and a retry when past sessions cannot load", async () => {
    mockResume(true);
    vi.mocked(useInterviewRecordListQuery).mockReturnValue({ data: [], isLoading: false, isError: false } as never);
    const refetch = vi.fn();
    vi.mocked(useInterviewSessionsQuery).mockReturnValue({ data: [], isLoading: false, isError: false, refetch } as never);
    const { unmount } = renderWithProviders(<InterviewPage />, { route: "/interview", locale: "ko" });
    expect(screen.getByText("아직 본 면접이 없어요.")).toBeInTheDocument();
    unmount();

    vi.mocked(useInterviewSessionsQuery).mockReturnValue({ data: undefined, isLoading: false, isError: true, refetch } as never);
    renderWithProviders(<InterviewPage />, { route: "/interview", locale: "ko" });
    await userEvent.click(within(screen.getByRole("region", { name: "지난 면접" })).getByRole("button", { name: "다시 시도" }));
    expect(refetch).toHaveBeenCalled();
  });
});
