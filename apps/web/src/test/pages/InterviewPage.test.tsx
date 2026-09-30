import userEvent from "@testing-library/user-event";
import { screen, waitFor, within } from "@testing-library/react";
import { Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useCreateInterviewSessionMutation } from "../../features/interview/api/useCreateInterviewSessionMutation";
import { useInterviewSessionsQuery } from "../../features/interview/api/useInterviewSessionsQuery";
import { useResumeListQuery } from "../../features/resume/api/useResumeListQuery";
import { useReviewQueueQuery } from "../../features/review-queue/api/useReviewQueueQuery";
import { InterviewPage } from "../../pages/interview/InterviewPage";
import { LocationDisplay, renderWithProviders } from "../utils";

vi.mock("../../features/interview/api/useCreateInterviewSessionMutation", () => ({ useCreateInterviewSessionMutation: vi.fn() }));
vi.mock("../../features/interview/api/useInterviewSessionsQuery", () => ({ useInterviewSessionsQuery: vi.fn() }));
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

    expect(screen.getByRole("heading", { level: 1, name: "모의면접" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: /내 이력서/ })).toBeChecked();
    expect(screen.getByText("Backend Resume · Version 2")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("radio", { name: "전체 범위" }));
    await userEvent.click(screen.getByRole("radio", { name: "5문항" }));
    await userEvent.click(screen.getByRole("button", { name: "면접 시작" }));

    expect(mutateAsync).toHaveBeenCalledWith({ sessionType: "resume_mock", interviewMode: "full_coverage", questionCount: 5, resumeVersionId: "version-2" });
    await waitFor(() => expect(screen.getByTestId("location-display")).toHaveTextContent("/interview/sessions/session-2"));
  });

  it("falls back to review questions when there is no active resume", async () => {
    mockResume(false);
    renderPage();

    expect(screen.getByRole("radio", { name: /내 이력서/ })).toBeDisabled();
    expect(screen.getByRole("radio", { name: /복습할 질문/ })).toBeChecked();
    expect(screen.queryByRole("radio", { name: "전체 범위" })).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "면접 시작" }));
    expect(mutateAsync).toHaveBeenCalledWith({ sessionType: "review_mock", interviewMode: "mock_30", questionCount: 3, resumeVersionId: null });
  });

  it("links finished sessions to results and unfinished ones back into the session", () => {
    mockResume(true);
    renderPage();

    const history = screen.getByRole("region", { name: "지난 모의면접" });
    expect(within(history).getByRole("link", { name: "결과" })).toHaveAttribute("href", "/interview/sessions/session-1/result");
    expect(within(history).getByRole("link", { name: "이어서" })).toHaveAttribute("href", "/interview/sessions/session-3");
    expect(within(history).getByText("84")).toBeInTheDocument();
  });
});
