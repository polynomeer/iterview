import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Route, Routes } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useCreateJobPostingMutation } from "../../features/resume-tailor/api/useCreateJobPostingMutation";
import { useCreateResumeAnalysisMutation } from "../../features/resume-tailor/api/useCreateResumeAnalysisMutation";
import { useJobPostingsQuery } from "../../features/resume-tailor/api/useJobPostingsQuery";
import { useResumeAnalysesQuery } from "../../features/resume-tailor/api/useResumeAnalysesQuery";
import { ResumeTailorAnalysisListPage } from "../../pages/resume-tailor/ResumeTailorAnalysisListPage";
import { LocationDisplay, renderWithProviders } from "../utils";

vi.mock("../../features/resume-tailor/api/useCreateJobPostingMutation", () => ({ useCreateJobPostingMutation: vi.fn() }));
vi.mock("../../features/resume-tailor/api/useCreateResumeAnalysisMutation", () => ({ useCreateResumeAnalysisMutation: vi.fn() }));
vi.mock("../../features/resume-tailor/api/useJobPostingsQuery", () => ({ useJobPostingsQuery: vi.fn() }));
vi.mock("../../features/resume-tailor/api/useResumeAnalysesQuery", () => ({ useResumeAnalysesQuery: vi.fn() }));

const createAnalysis = vi.fn();
const createPosting = vi.fn();

function mockData(postings: unknown[]) {
  vi.mocked(useResumeAnalysesQuery).mockReturnValue({
    data: [
      {
        id: "analysis-1",
        jobPostingId: "job-1",
        createdAtLabel: "2026년 3월 17일",
        suggestedHeadline: "Backend Engineer 맞춤 이력서",
        matchSummary: "Redis 경험이 잘 맞습니다.",
        overallScore: 82,
        overallScoreLabel: "82",
      },
    ],
    isLoading: false,
    isError: false,
  } as never);
  vi.mocked(useJobPostingsQuery).mockReturnValue({ data: postings, isLoading: false, isError: false } as never);
}

beforeEach(() => {
  createAnalysis.mockReset().mockResolvedValue({ id: "analysis-2" });
  createPosting.mockReset().mockResolvedValue({ id: "job-9" });
  vi.mocked(useCreateResumeAnalysisMutation).mockReturnValue({ mutateAsync: createAnalysis, isPending: false, error: null } as never);
  vi.mocked(useCreateJobPostingMutation).mockReturnValue({ mutateAsync: createPosting, isPending: false, error: null } as never);
});

function renderTab() {
  renderWithProviders(
    <Routes>
      <Route element={<ResumeTailorAnalysisListPage />} path="/resume/:versionId/tailor" />
      <Route element={<LocationDisplay />} path="/resume/:versionId/tailor/:analysisId" />
    </Routes>,
    { route: "/resume/version-1/tailor", locale: "ko" },
  );
}

describe("ResumeTailorAnalysisListPage", () => {
  it("lists analyses by posting and runs a new one from a saved posting", async () => {
    mockData([{ id: "job-1", title: "Example Corp · Backend Engineer", fetchStatus: "fetched", parsedKeywords: ["Kafka"], createdAtLabel: "3월 1일" }]);
    renderTab();

    const analyses = screen.getByRole("region", { name: "분석 1" });
    expect(within(analyses).getByText("Example Corp · Backend Engineer")).toBeInTheDocument();
    expect(within(analyses).getByRole("link", { name: "열기" })).toHaveAttribute("href", "/resume/version-1/tailor/analysis-1");
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "분석하기" }));
    expect(createAnalysis).toHaveBeenCalledWith({ jobPostingId: "job-1" });
    expect(await screen.findByTestId("location-display")).toHaveTextContent("/resume/version-1/tailor/analysis-2");
  });

  it("starts with a posting form and analyzes the posting right after saving it", async () => {
    mockData([]);
    renderTab();

    expect(screen.getByRole("heading", { name: "지원할 공고를 넣어주세요" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "저장하고 분석하기" }));
    expect(screen.getByText("공고 본문을 붙여넣어 주세요.")).toBeInTheDocument();

    await userEvent.type(screen.getByLabelText("공고 본문"), "Kafka 운영 경험");
    await userEvent.click(screen.getByRole("button", { name: "저장하고 분석하기" }));
    expect(createPosting).toHaveBeenCalledWith({ inputType: "text", sourceUrl: null, rawText: "Kafka 운영 경험", companyName: null, roleName: null });
    expect(createAnalysis).toHaveBeenCalledWith({ jobPostingId: "job-9" });
  });
});
