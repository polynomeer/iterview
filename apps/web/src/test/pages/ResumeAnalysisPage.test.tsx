import { screen } from "@testing-library/react";
import { Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { useActiveResumeAnalysisQuery } from "../../features/resume/api/useActiveResumeAnalysisQuery";
import { useLatestResumeQuery } from "../../features/resume/api/useLatestResumeQuery";
import { useResumeListQuery } from "../../features/resume/api/useResumeListQuery";
import { ResumeAnalysisPage } from "../../pages/resume-analysis/ResumeAnalysisPage";
import { mockMatchMedia, renderWithProviders } from "../utils";

vi.mock("../../features/resume/api/useResumeListQuery", () => ({
  useResumeListQuery: vi.fn(),
}));

vi.mock("../../features/resume/api/useLatestResumeQuery", () => ({
  useLatestResumeQuery: vi.fn(),
}));

vi.mock("../../features/resume/api/useActiveResumeAnalysisQuery", () => ({
  useActiveResumeAnalysisQuery: vi.fn(),
}));

describe("ResumeAnalysisPage", () => {
  it("renders the active resume defense workspace", () => {
    vi.mocked(useResumeListQuery).mockReturnValue({
      data: {
        items: [
          {
            id: "resume-1",
            title: "Backend Resume",
            versions: [
              {
                id: "version-1",
                versionNumberLabel: "Version 3",
                uploadedAtLabel: "Mar 9, 2026",
                fileNameLabel: "backend-v3.pdf",
                isActive: true,
                parsingStatusLabel: "Parsed cleanly",
                parsingStatus: "completed",
                parsingTone: "positive",
                extractionStatusLabel: "Extracted",
                extractionStatus: "completed",
                extractionTone: "positive",
                parseStartedAtLabel: "Mar 9, 2026",
                parseCompletedAtLabel: "Mar 9, 2026",
                parseErrorMessage: null,
                extractionStartedAtLabel: "Mar 9, 2026",
                extractionCompletedAtLabel: "Mar 9, 2026",
                extractionErrorMessage: null,
                extractionModelLabel: null,
                extractionPromptVersion: null,
                extractionConfidenceLabel: null,
                canActivate: true,
                canDownload: true,
                fileTypeLabel: null,
                fileSizeLabel: null,
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
    vi.mocked(useLatestResumeQuery).mockReturnValue({
      data: null,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as never);
    vi.mocked(useActiveResumeAnalysisQuery).mockReturnValue({
      data: {
        resumeVersionId: "version-1",
        generatedAtLabel: "Mar 9, 2026",
        skills: [
          {
            id: "skill-1",
            sourceRecordId: "source-1",
            label: "Spring Boot",
            value: "0.92",
            helperText: "Referenced in platform migration bullets.",
            category: "Backend",
            confidenceScore: 0.92,
            confidenceLabel: "92%",
            tone: "positive",
          },
        ],
        experiences: [
          {
            id: "experience-1",
            title: "Interview analytics platform",
            summary: "Built the extraction and scoring pipeline for interview preparation.",
            impactText: "Reduced review time by 37%",
          },
        ],
        risks: [
          {
            id: "risk-1",
            title: "Refactor leadership claim is still vague",
            severityLabel: "High risk",
            description: "The bullet names the refactor but not the decision constraints or rollout tradeoffs.",
            linkedQuestionId: "question-7",
          },
        ],
      },
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as never);

    renderWithProviders(
      <Routes>
        <Route element={<ResumeAnalysisPage />} path="/profile/resumes/analysis" />
      </Routes>,
      { route: "/profile/resumes/analysis", locale: "ko" },
    );

    expect(screen.getByText("source of truth")).toBeInTheDocument();
    expect(screen.getByText("방어 가이드")).toBeInTheDocument();
    expect(screen.getAllByText("Refactor leadership claim is still vague")).toHaveLength(2);
    expect(screen.getByText("Interview analytics platform")).toBeInTheDocument();
    expect(screen.getAllByText("Spring Boot").length).toBeGreaterThan(0);
    expect(screen.getByRole("link", { name: "source of truth 편집" })).toHaveAttribute(
      "href",
      "/resume-versions/version-1/editor",
    );
  });

  it("renders the desktop resume analysis layout when wide mode is active", () => {
    mockMatchMedia(true);
    vi.mocked(useResumeListQuery).mockReturnValue({
      data: {
        items: [
          {
            id: "resume-1",
            title: "Backend Resume",
            versions: [
              {
                id: "version-1",
                versionNumberLabel: "Version 3",
                uploadedAtLabel: "Mar 9, 2026",
                fileNameLabel: "backend-v3.pdf",
                isActive: true,
                parsingStatusLabel: "Parsed cleanly",
                parsingStatus: "completed",
                parsingTone: "positive",
                extractionStatusLabel: "Extracted",
                extractionStatus: "completed",
                extractionTone: "positive",
                parseStartedAtLabel: null,
                parseCompletedAtLabel: null,
                parseErrorMessage: null,
                extractionStartedAtLabel: null,
                extractionCompletedAtLabel: null,
                extractionErrorMessage: null,
                extractionModelLabel: null,
                extractionPromptVersion: null,
                extractionConfidenceLabel: null,
                canActivate: true,
                canDownload: true,
                fileTypeLabel: null,
                fileSizeLabel: null,
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
    vi.mocked(useLatestResumeQuery).mockReturnValue({
      data: null,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as never);
    vi.mocked(useActiveResumeAnalysisQuery).mockReturnValue({
      data: {
        resumeVersionId: "version-1",
        generatedAtLabel: null,
        skills: [],
        experiences: [],
        risks: [],
      },
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as never);

    renderWithProviders(
      <Routes>
        <Route element={<ResumeAnalysisPage />} path="/profile/resumes/analysis" />
      </Routes>,
      { route: "/profile/resumes/analysis", locale: "ko" },
    );

    expect(screen.getByText("이력서 source of truth 점검")).toBeInTheDocument();
    expect(screen.getByText("하나로 이어지는 준비 루프")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /이력서 편집기/i })).toBeInTheDocument();
    expect(document.querySelector(".resume-analysis-layout--desktop")).not.toBeNull();
  });
});
