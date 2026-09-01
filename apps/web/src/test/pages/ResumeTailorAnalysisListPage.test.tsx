import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { useResumeVersionDetailQuery } from "../../features/resume/api/useResumeVersionDetailQuery";
import { useCreateResumeAnalysisMutation } from "../../features/resume-tailor/api/useCreateResumeAnalysisMutation";
import { useJobPostingsQuery } from "../../features/resume-tailor/api/useJobPostingsQuery";
import { useResumeAnalysesQuery } from "../../features/resume-tailor/api/useResumeAnalysesQuery";
import { ResumeTailorAnalysisListPage } from "../../pages/resume-tailor/ResumeTailorAnalysisListPage";
import { LocationDisplay, renderWithProviders } from "../utils";

vi.mock("../../features/resume/api/useResumeVersionDetailQuery", () => ({
  useResumeVersionDetailQuery: vi.fn(),
}));
vi.mock("../../features/resume-tailor/api/useCreateResumeAnalysisMutation", () => ({
  useCreateResumeAnalysisMutation: vi.fn(),
}));
vi.mock("../../features/resume-tailor/api/useJobPostingsQuery", () => ({
  useJobPostingsQuery: vi.fn(),
}));
vi.mock("../../features/resume-tailor/api/useResumeAnalysesQuery", () => ({
  useResumeAnalysesQuery: vi.fn(),
}));

function mockWorkspaceData() {
  vi.mocked(useResumeVersionDetailQuery).mockReturnValue({
    data: {
      id: "version-1",
      versionNumberLabel: "버전 3",
      parsingStatusLabel: "완료",
      extractionStatusLabel: "완료",
    },
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
  } as never);
  vi.mocked(useResumeAnalysesQuery).mockReturnValue({
    data: [
      {
        id: "analysis-1",
        resumeVersionId: "version-1",
        statusLabel: "완료",
        generationSourceLabel: "규칙 기반 생성",
        createdAtLabel: "2026년 3월 17일",
        suggestedHeadline: "Backend Engineer 맞춤 이력서",
        recommendedFormatTypeLabel: "기술 중심",
        matchSummary: "Redis와 플랫폼 운영 경험이 직무 요구와 잘 맞습니다.",
        overallScoreLabel: "82",
      },
    ],
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
  } as never);
  vi.mocked(useJobPostingsQuery).mockReturnValue({
    data: [{ id: "job-1", title: "Example Corp · Backend Engineer" }],
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
  } as never);
}

describe("ResumeTailorAnalysisListPage", () => {
  it("renders source-version analysis history and opens a saved workspace", () => {
    mockWorkspaceData();
    vi.mocked(useCreateResumeAnalysisMutation).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
      isError: false,
      error: null,
      reset: vi.fn(),
    } as never);

    renderWithProviders(
      <Routes>
        <Route
          element={<ResumeTailorAnalysisListPage />}
          path="/resume-tailor/resume-versions/:versionId/analyses"
        />
      </Routes>,
      { route: "/resume-tailor/resume-versions/version-1/analyses", locale: "ko" },
    );

    expect(screen.getByText("분석 큐")).toBeInTheDocument();
    expect(screen.getByText("Backend Engineer 맞춤 이력서")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "작업공간 열기" })).toHaveAttribute(
      "href",
      "/resume-tailor/resume-versions/version-1/analyses/analysis-1",
    );
  });

  it("creates an analysis with the selected job posting and opens its detail workspace", async () => {
    mockWorkspaceData();
    const mutateAsync = vi.fn().mockResolvedValue({ id: "analysis-2", resumeVersionId: "version-1" });
    vi.mocked(useCreateResumeAnalysisMutation).mockReturnValue({
      mutateAsync,
      isPending: false,
      isError: false,
      error: null,
      reset: vi.fn(),
    } as never);
    const user = userEvent.setup();

    renderWithProviders(
      <Routes>
        <Route
          element={<ResumeTailorAnalysisListPage />}
          path="/resume-tailor/resume-versions/:versionId/analyses"
        />
        <Route element={<LocationDisplay />} path="/resume-tailor/resume-versions/:versionId/analyses/:analysisId" />
      </Routes>,
      { route: "/resume-tailor/resume-versions/version-1/analyses", locale: "ko" },
    );

    await user.selectOptions(screen.getByLabelText("저장된 채용 공고"), "job-1");
    await user.type(screen.getByLabelText("선호 포맷 유형"), "technical_focused");
    await user.click(screen.getByRole("button", { name: "분석 실행" }));

    expect(mutateAsync).toHaveBeenCalledWith({
      jobPostingId: "job-1",
      preferredFormatType: "technical_focused",
    });
    expect(await screen.findByTestId("location-display")).toHaveTextContent(
      "/resume-tailor/resume-versions/version-1/analyses/analysis-2",
    );
  });
});
