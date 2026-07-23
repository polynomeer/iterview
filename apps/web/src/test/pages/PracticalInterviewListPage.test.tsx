import { fireEvent, screen } from "@testing-library/react";
import { Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { PracticalInterviewListPage } from "../../pages/practical-interviews/PracticalInterviewListPage";
import { useCreateInterviewRecordMutation } from "../../features/practical-interview/api/useCreateInterviewRecordMutation";
import { useInterviewRecordListQuery } from "../../features/practical-interview/api/useInterviewRecordListQuery";
import { useResumeListQuery } from "../../features/resume/api/useResumeListQuery";
import { renderWithProviders } from "../utils";

vi.mock("../../features/practical-interview/api/useInterviewRecordListQuery", () => ({
  useInterviewRecordListQuery: vi.fn(),
}));

vi.mock("../../features/practical-interview/api/useCreateInterviewRecordMutation", () => ({
  useCreateInterviewRecordMutation: vi.fn(),
}));

vi.mock("../../features/resume/api/useResumeListQuery", () => ({
  useResumeListQuery: vi.fn(),
}));

describe("PracticalInterviewListPage", () => {
  it("renders uploaded record list and the expandable upload form", () => {
    vi.mocked(useInterviewRecordListQuery).mockReturnValue({
      data: [
        {
          id: "record-1",
          title: "Datadog · Backend Engineer",
          interviewTypeLabel: "Onsite",
          interviewDateLabel: "Mar 15, 2026",
          transcriptStatus: "processing",
          transcriptStatusLabel: "Processing",
          transcriptStatusTone: "accent",
          transcriptRetryCount: 1,
          transcriptNextRetryAtLabel: "Mar 16, 2026, 9:45 AM",
          analysisStatus: "completed",
          analysisStatusLabel: "Completed",
          questionCount: 6,
        },
      ],
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
            title: "Backend Resume",
            versions: [
              {
                id: "version-1",
                versionNumberLabel: "Version 1",
                uploadedAtLabel: "Mar 12, 2026",
                isActive: true,
                parsingStatus: "completed",
                parsingStatusLabel: "Completed",
              },
            ],
          },
        ],
      },
      isLoading: false,
      isError: false,
    } as never);
    vi.mocked(useCreateInterviewRecordMutation).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
      isError: false,
      error: null,
      reset: vi.fn(),
    } as never);

    renderWithProviders(
      <Routes>
        <Route element={<PracticalInterviewListPage />} path="/practical-interviews" />
      </Routes>,
      { route: "/practical-interviews" },
    );

    expect(screen.getByText("Practical interview review")).toBeInTheDocument();
    expect(screen.getByText("Datadog · Backend Engineer")).toBeInTheDocument();
    expect(screen.getByText("Transcript Processing")).toBeInTheDocument();
    expect(screen.getByText("Retry 1")).toBeInTheDocument();
    expect(screen.getByText("Next retry Mar 16, 2026, 9:45 AM")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Upload interview" }));

    expect(screen.getByText("Create an interview record")).toBeInTheDocument();
    expect(screen.getByLabelText("Company")).toBeInTheDocument();
    expect(screen.getByLabelText("Linked resume version")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Optional. If omitted, the server will try to extract a transcript from the audio and continue processing.",
      ),
    ).toBeInTheDocument();
  });
});
