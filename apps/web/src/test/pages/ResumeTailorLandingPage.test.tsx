import { screen } from "@testing-library/react";
import { Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { ResumeTailorLandingPage } from "../../pages/resume-tailor/ResumeTailorLandingPage";
import { useResumeListQuery } from "../../features/resume/api/useResumeListQuery";
import { useJobPostingsQuery } from "../../features/resume-tailor/api/useJobPostingsQuery";
import { useResumeAnalysesQuery } from "../../features/resume-tailor/api/useResumeAnalysesQuery";
import { renderWithProviders } from "../utils";

vi.mock("../../features/resume/api/useResumeListQuery", () => ({
  useResumeListQuery: vi.fn(),
}));

vi.mock("../../features/resume-tailor/api/useJobPostingsQuery", () => ({
  useJobPostingsQuery: vi.fn(),
}));

vi.mock("../../features/resume-tailor/api/useResumeAnalysesQuery", () => ({
  useResumeAnalysesQuery: vi.fn(),
}));

describe("ResumeTailorLandingPage", () => {
  it("renders version selection, recent analyses, and saved job postings", () => {
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
                uploadedAtLabel: "Mar 17, 10:00 AM",
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
      error: null,
      refetch: vi.fn(),
    } as never);
    vi.mocked(useJobPostingsQuery).mockReturnValue({
      data: [
        {
          id: "job-1",
          title: "Example Corp · Backend Platform Engineer",
          inputTypeLabel: "Text",
          fetchStatusLabel: "Completed",
          fetchedTitle: null,
          parsedSummary: "Backend Platform Engineer focused on Spring Boot, Redis, Kafka.",
        },
      ],
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as never);
    vi.mocked(useResumeAnalysesQuery).mockReturnValue({
      data: [
        {
          id: "analysis-1",
          suggestedHeadline: "Platform engineer tailored summary",
          matchSummary: "Strong cache and backend platform alignment.",
          statusLabel: "Completed",
          generationSourceLabel: "AI generated",
          createdAtLabel: "Mar 17, 10:15 AM",
          overallScoreLabel: "84",
        },
      ],
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as never);

    renderWithProviders(
      <Routes>
        <Route element={<ResumeTailorLandingPage />} path="/resume-tailor" />
      </Routes>,
      { route: "/resume-tailor" },
    );

    expect(
      screen.getByText("Choose one immutable resume version, then tailor it toward one real role"),
    ).toBeInTheDocument();
    expect(screen.getByText("Platform engineer tailored summary")).toBeInTheDocument();
    expect(screen.getByText("Example Corp · Backend Platform Engineer")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Create analysis" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Manage job postings" })).toBeInTheDocument();
  });
});
