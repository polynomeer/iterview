import { fireEvent, screen } from "@testing-library/react";
import { Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { ResumeTailorAnalysisDetailPage } from "../../pages/resume-tailor/ResumeTailorAnalysisDetailPage";
import { useJobPostingDetailQuery } from "../../features/resume-tailor/api/useJobPostingDetailQuery";
import { useCreateResumeAnalysisExportMutation } from "../../features/resume-tailor/api/useCreateResumeAnalysisExportMutation";
import { useResumeAnalysisDetailQuery } from "../../features/resume-tailor/api/useResumeAnalysisDetailQuery";
import { useResumeAnalysisExportsQuery } from "../../features/resume-tailor/api/useResumeAnalysisExportsQuery";
import { useToggleResumeAnalysisSuggestionMutation } from "../../features/resume-tailor/api/useToggleResumeAnalysisSuggestionMutation";
import { renderWithProviders } from "../utils";

vi.mock("../../features/resume-tailor/api/useResumeAnalysisDetailQuery", () => ({
  useResumeAnalysisDetailQuery: vi.fn(),
}));
vi.mock("../../features/resume-tailor/api/useResumeAnalysisExportsQuery", () => ({
  useResumeAnalysisExportsQuery: vi.fn(),
}));
vi.mock("../../features/resume-tailor/api/useJobPostingDetailQuery", () => ({
  useJobPostingDetailQuery: vi.fn(),
}));
vi.mock("../../features/resume-tailor/api/useToggleResumeAnalysisSuggestionMutation", () => ({
  useToggleResumeAnalysisSuggestionMutation: vi.fn(),
}));
vi.mock("../../features/resume-tailor/api/useCreateResumeAnalysisExportMutation", () => ({
  useCreateResumeAnalysisExportMutation: vi.fn(),
}));

describe("ResumeTailorAnalysisDetailPage", () => {
  it("shows fit, applies a rewrite, and creates a PDF", () => {
    const toggleMutateAsync = vi.fn();
    const exportMutateAsync = vi.fn();

    vi.mocked(useResumeAnalysisDetailQuery).mockReturnValue({
      data: {
        id: "analysis-1",
        matchSummary: "Strong cache and platform match.",
        statusLabel: "Completed",
        overallScore: 82,
        overallScoreLabel: "82",
        suggestions: [
          {
            id: "suggestion-1",
            sectionLabel: "Summary",
            suggestionTypeLabel: "Rewrite",
            accepted: false,
            originalText: "Built backend APIs.",
            suggestedText: "Built resilient backend APIs with cache-aware delivery.",
            reason: "Bring Redis and platform ownership forward.",
          },
        ],
        exports: [],
        strongMatches: ["Redis"],
        missingKeywords: ["Kafka"],
        weakSignals: [],
        recommendedFocusAreas: ["Quantify cache impact"],
        analysisNotes: ["Backend fallback may be deterministic."],
        generationSourceLabel: "Generated from saved rules",
        recommendedFormatType: "technical_focused",
        recommendedFormatTypeLabel: "Technical Focused",
        tailoredDocument: {
          title: "Tailored resume",
          formatType: "technical_focused",
          formatTypeLabel: "Technical Focused",
          targetCompany: "Example Corp",
          targetRole: "Backend Engineer",
          summary: "Tailored summary",
          diffSummary: "Summary and experience bullets were tightened around cache ownership.",
          analysisNotes: ["Kept original source resume immutable."],
          sections: [
            {
              id: "section-1",
              title: "Summary",
              lines: ["Tailored summary line"],
            },
          ],
          plainText: "Tailored summary line",
        },
        createdAtLabel: "Mar 17, 11:00 AM",
        jobPostingId: "job-1",
      },
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as never);
    vi.mocked(useResumeAnalysisExportsQuery).mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as never);
    vi.mocked(useJobPostingDetailQuery).mockReturnValue({
      data: {
        id: "job-1",
        title: "Example Corp · Backend Engineer",
        inputTypeLabel: "Text",
        fetchStatusLabel: "Completed",
        parsedSummary: "Backend Engineer focused on Redis and Kafka.",
        parsedKeywords: ["Redis", "Kafka"],
        parsedRequirements: ["Redis 운영"],
        sourceUrl: null,
      },
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as never);
    vi.mocked(useToggleResumeAnalysisSuggestionMutation).mockReturnValue({
      mutate: toggleMutateAsync,
      isPending: false,
      isError: false,
      error: null,
      reset: vi.fn(),
    } as never);
    vi.mocked(useCreateResumeAnalysisExportMutation).mockReturnValue({
      mutate: exportMutateAsync,
      isPending: false,
      isError: false,
      error: null,
      reset: vi.fn(),
    } as never);
    renderWithProviders(
      <Routes>
        <Route
          element={<ResumeTailorAnalysisDetailPage />}
          path="/resume/:versionId/tailor/:analysisId"
        />
      </Routes>,
      { route: "/resume/version-1/tailor/analysis-1", locale: "ko" },
    );

    expect(screen.getByRole("heading", { level: 2, name: "Example Corp · Backend Engineer" })).toBeInTheDocument();
    expect(screen.getByText("82")).toBeInTheDocument();
    expect(screen.getByText("Kafka")).toBeInTheDocument();
    expect(screen.getByText("Tailored summary line")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "반영" }));
    expect(toggleMutateAsync).toHaveBeenCalledWith({ suggestionId: "suggestion-1", accepted: true });

    fireEvent.click(screen.getByRole("button", { name: "PDF 만들기" }));
    expect(exportMutateAsync).toHaveBeenCalledTimes(1);
  });
});
