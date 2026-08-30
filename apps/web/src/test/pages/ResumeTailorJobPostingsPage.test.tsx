import { fireEvent, screen } from "@testing-library/react";
import { Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { ResumeTailorJobPostingsPage } from "../../pages/resume-tailor/ResumeTailorJobPostingsPage";
import { useCreateJobPostingMutation } from "../../features/resume-tailor/api/useCreateJobPostingMutation";
import { useJobPostingsQuery } from "../../features/resume-tailor/api/useJobPostingsQuery";
import { mockMatchMedia, renderWithProviders } from "../utils";

vi.mock("../../features/resume-tailor/api/useJobPostingsQuery", () => ({
  useJobPostingsQuery: vi.fn(),
}));

vi.mock("../../features/resume-tailor/api/useCreateJobPostingMutation", () => ({
  useCreateJobPostingMutation: vi.fn(),
}));

describe("ResumeTailorJobPostingsPage", () => {
  it("supports link-mode creation and renders saved posting metadata", () => {
    const mutateAsync = vi.fn().mockResolvedValue({
      companyName: "Example Corp",
      roleName: "Backend Engineer",
    });

    vi.mocked(useJobPostingsQuery).mockReturnValue({
      data: [
        {
          id: "job-1",
          title: "Example Corp · Backend Engineer",
          inputTypeLabel: "Link",
          fetchStatusLabel: "Failed",
          fetchedTitle: "Example job page",
          parsedSummary: "Parsed summary",
          fetchErrorMessage: "Readable content could not be fetched.",
          parsedKeywords: ["Redis", "Kafka"],
        },
      ],
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as never);
    vi.mocked(useCreateJobPostingMutation).mockReturnValue({
      mutateAsync,
      isPending: false,
      isError: false,
      error: null,
      reset: vi.fn(),
    } as never);

    renderWithProviders(
      <Routes>
        <Route element={<ResumeTailorJobPostingsPage />} path="/resume-tailor/job-postings" />
      </Routes>,
      { route: "/resume-tailor/job-postings", locale: "ko" },
    );

    expect(
      screen.getByText("다음 맞춤 이력서 수정을 이끌 직무 컨텍스트를 확보하세요"),
    ).toBeInTheDocument();
    expect(screen.getByRole("searchbox", { name: "목표 회사 검색" })).toBeInTheDocument();
    fireEvent.change(screen.getByRole("combobox", { name: "입력 방식" }), { target: { value: "link" } });
    fireEvent.change(
      screen.getByPlaceholderText("https://example.com/jobs/backend-platform-engineer"),
      {
      target: { value: "https://example.com/jobs/backend" },
      },
    );
    fireEvent.click(screen.getByRole("button", { name: "채용 공고 저장" }));

    expect(mutateAsync).toHaveBeenCalledWith({
      inputType: "link",
      sourceUrl: "https://example.com/jobs/backend",
      rawText: null,
      companyName: null,
      roleName: null,
    });
    expect(screen.getByText("Readable content could not be fetched.")).toBeInTheDocument();
    expect(screen.getAllByText("Redis").length).toBeGreaterThan(0);
    expect(screen.getByRole("heading", { name: "Example Corp · Backend Engineer" })).toBeInTheDocument();
  });

  it("renders the desktop board layout when wide mode is active", () => {
    mockMatchMedia(true);

    vi.mocked(useJobPostingsQuery).mockReturnValue({
      data: [
        {
          id: "job-1",
          title: "Example Corp · Backend Engineer",
          inputTypeLabel: "Link",
          fetchStatusLabel: "Fetched",
          fetchedTitle: "Example job page",
          parsedSummary: "Parsed summary",
          fetchErrorMessage: null,
          parsedKeywords: ["Redis", "Kafka", "Concurrency", "Reliability"],
          parsedResponsibilities: ["Design APIs", "Operate services"],
          parsedRequirements: ["Java", "Spring", "Distributed systems"],
          companyName: "Example Corp",
          roleName: "Backend Engineer",
          createdAtLabel: "Aug 25, 2026",
        },
      ],
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as never);
    vi.mocked(useCreateJobPostingMutation).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
      isError: false,
      error: null,
      reset: vi.fn(),
    } as never);

    renderWithProviders(
      <Routes>
        <Route element={<ResumeTailorJobPostingsPage />} path="/resume-tailor/job-postings" />
      </Routes>,
      { route: "/resume-tailor/job-postings", locale: "ko" },
    );

    expect(document.querySelector(".target-companies-layout--desktop")).not.toBeNull();
  });
});
