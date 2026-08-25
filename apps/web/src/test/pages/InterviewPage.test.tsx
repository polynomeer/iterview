import { fireEvent, screen, waitFor } from "@testing-library/react";
import { Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { InterviewPage } from "../../pages/interview/InterviewPage";
import { useCreateInterviewSessionMutation } from "../../features/interview/api/useCreateInterviewSessionMutation";
import { useInterviewSessionsQuery } from "../../features/interview/api/useInterviewSessionsQuery";
import { useLatestResumeQuery } from "../../features/resume/api/useLatestResumeQuery";
import { useResumeListQuery } from "../../features/resume/api/useResumeListQuery";
import { renderWithProviders } from "../utils";

vi.mock("../../features/interview/api/useCreateInterviewSessionMutation", () => ({
  useCreateInterviewSessionMutation: vi.fn(),
}));

vi.mock("../../features/interview/api/useInterviewSessionsQuery", () => ({
  useInterviewSessionsQuery: vi.fn(),
}));

vi.mock("../../features/resume/api/useLatestResumeQuery", () => ({
  useLatestResumeQuery: vi.fn(),
}));

vi.mock("../../features/resume/api/useResumeListQuery", () => ({
  useResumeListQuery: vi.fn(),
}));

describe("InterviewPage", () => {
  it("renders interview history and explicit resume-based session setup", async () => {
    const mutateAsync = vi.fn().mockResolvedValue({ id: "session-2" });

    vi.mocked(useLatestResumeQuery).mockReturnValue({
      data: undefined,
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
            title: "Backend Platform Resume",
            versions: [
              {
                id: "version-2",
                versionNumberLabel: "Version 2",
                uploadedAtLabel: "Mar 12, 2026",
                isActive: true,
                parsingStatus: "completed",
                parsingStatusLabel: "Completed",
              },
              {
                id: "version-1",
                versionNumberLabel: "Version 1",
                uploadedAtLabel: "Mar 10, 2026",
                isActive: false,
                parsingStatus: "completed",
                parsingStatusLabel: "Completed",
              },
            ],
          },
        ],
      },
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as never);
    vi.mocked(useInterviewSessionsQuery).mockReturnValue({
      data: [
        {
          id: "session-1",
          sessionType: "resume_mock",
          sessionTypeLabel: "Resume Mock",
          status: "completed",
          statusLabel: "Completed",
          resumeVersionId: "version-2",
          startedAtLabel: "Mar 12, 3:00 PM",
          endedAtLabel: "Mar 12, 3:20 PM",
          questionCount: 5,
          answeredCount: 5,
          averageScoreLabel: "84",
        },
      ],
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as never);
    vi.mocked(useCreateInterviewSessionMutation).mockReturnValue({
      mutateAsync,
      isPending: false,
      isError: false,
      error: null,
      reset: vi.fn(),
    } as never);

    renderWithProviders(
      <Routes>
        <Route element={<InterviewPage />} path="/interviews" />
      </Routes>,
      { route: "/interviews" },
    );

    expect(screen.getByText("Session history")).toBeInTheDocument();
    expect(screen.getByText("Resume Mock session")).toBeInTheDocument();
    expect(screen.getByText("Stay inside one interview preparation loop")).toBeInTheDocument();
    expect(screen.getByText("Lock one resume version, pick one branch, then start with a clear traversal mode.")).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: "Open session setup" }).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Use one resume version per run.")).toBeInTheDocument();
    expect(screen.getByText("Pick scope first, then start.")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Inspect weakest branch" })).toBeInTheDocument();

    fireEvent.click(screen.getAllByRole("button", { name: "Open session setup" })[0]);

    expect(screen.getByText("Select one resume version")).toBeInTheDocument();
    expect(
      screen.getAllByRole("button", { name: /Backend Platform Resume/i }).length,
    ).toBeGreaterThanOrEqual(2);
    expect(screen.getByText("Start the resume-grounded interview")).toBeInTheDocument();
    expect(screen.getByText("Choose the traversal first")).toBeInTheDocument();
    expect(screen.getByText("One run, one source of truth.")).toBeInTheDocument();
    expect(screen.getAllByText("Full coverage").length).toBeGreaterThanOrEqual(1);

    fireEvent.click(screen.getByRole("button", { name: /Full coverage/i }));

    fireEvent.click(screen.getByRole("button", { name: "Confirm and start" }));

    await waitFor(() => {
      expect(mutateAsync).toHaveBeenCalledWith({
        sessionType: "resume_mock",
        interviewMode: "full_coverage",
        questionCount: 3,
        resumeVersionId: "version-2",
      });
    });
  });
});
