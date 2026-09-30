import userEvent from "@testing-library/user-event";
import { screen } from "@testing-library/react";
import { Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { ResumePage } from "../../pages/resume/ResumePage";
import { useActivateResumeVersionMutation } from "../../features/resume/api/useActivateResumeVersionMutation";
import { useCreateResumeMutation } from "../../features/resume/api/useCreateResumeMutation";
import { useReExtractResumeVersionMutation } from "../../features/resume/api/useReExtractResumeVersionMutation";
import { useResumeListQuery } from "../../features/resume/api/useResumeListQuery";
import { useResumeVersionDetailQuery } from "../../features/resume/api/useResumeVersionDetailQuery";
import { useResumeVersionExtractionQuery } from "../../features/resume/api/useResumeVersionExtractionQuery";
import { useResumeVersionSnapshotsQuery } from "../../features/resume/api/useResumeVersionSnapshotsQuery";
import { useUploadResumeVersionMutation } from "../../features/resume/api/useUploadResumeVersionMutation";
import { mockMatchMedia, renderWithProviders } from "../utils";

vi.mock("../../features/resume/api/useResumeListQuery", () => ({
  useResumeListQuery: vi.fn(),
}));

vi.mock("../../features/resume/api/useCreateResumeMutation", () => ({
  useCreateResumeMutation: vi.fn(),
}));

vi.mock("../../features/resume/api/useActivateResumeVersionMutation", () => ({
  useActivateResumeVersionMutation: vi.fn(),
}));

vi.mock("../../features/resume/api/useUploadResumeVersionMutation", () => ({
  useUploadResumeVersionMutation: vi.fn(),
}));

vi.mock("../../features/resume/api/useResumeVersionDetailQuery", () => ({
  useResumeVersionDetailQuery: vi.fn(),
}));

vi.mock("../../features/resume/api/useResumeVersionExtractionQuery", () => ({
  useResumeVersionExtractionQuery: vi.fn(),
}));

vi.mock("../../features/resume/api/useResumeVersionSnapshotsQuery", () => ({
  useResumeVersionSnapshotsQuery: vi.fn(),
}));

vi.mock("../../features/resume/api/useReExtractResumeVersionMutation", () => ({
  useReExtractResumeVersionMutation: vi.fn(),
}));

describe("ResumePage", () => {
  it("renders the desktop resume management layout", () => {
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
                versionNumberLabel: "Version 1",
                uploadedAtLabel: "Mar 9, 2026",
                fileNameLabel: "backend.pdf",
                isActive: true,
                parsingStatusLabel: "Completed",
                parsingStatus: "completed",
                parsingTone: "positive",
                extractionStatusLabel: "Completed",
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
    vi.mocked(useCreateResumeMutation).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
      error: null,
    } as never);
    vi.mocked(useUploadResumeVersionMutation).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
      error: null,
    } as never);
    vi.mocked(useActivateResumeVersionMutation).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
      error: null,
    } as never);
    vi.mocked(useResumeVersionDetailQuery).mockReturnValue({
      data: {
        id: "version-1",
        fileNameLabel: "backend.pdf",
        uploadedAtLabel: "Mar 9, 2026",
        fileSizeLabel: "240 KB",
        fileTypeLabel: "application/pdf",
        parsingStatusLabel: "Completed",
        parsingStatus: "completed",
        parsingTone: "positive",
        parseStartedAtLabel: "Mar 9, 2026",
        parseCompletedAtLabel: "Mar 9, 2026",
        parseErrorMessage: null,
        extractionStatusLabel: "Completed",
        extractionStatus: "completed",
        extractionTone: "positive",
        extractionStartedAtLabel: "Mar 9, 2026",
        extractionCompletedAtLabel: "Mar 9, 2026",
        extractionErrorMessage: null,
        extractionModelLabel: null,
        extractionPromptVersion: null,
        extractionConfidenceLabel: null,
        isActive: true,
        canActivate: true,
        canDownload: true,
      },
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as never);
    vi.mocked(useResumeVersionExtractionQuery).mockReturnValue({
      data: {
        rawParsingStatus: "completed",
        rawParsingStatusLabel: "Completed",
        extractionStatus: "completed",
        extractionStatusLabel: "Completed",
        extractionTone: "positive",
        startedAtLabel: "Mar 9, 2026",
        completedAtLabel: "Mar 9, 2026",
        errorMessage: null,
        modelLabel: null,
        promptVersionLabel: null,
        isUsable: true,
        canRetry: false,
      },
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as never);
    vi.mocked(useResumeVersionSnapshotsQuery).mockReturnValue({
      data: {
        profile: {
          fullName: "Jamie Backend",
          headline: "Senior Backend Engineer",
          summaryText: "Built reliable APIs.",
          locationText: "Seoul",
          yearsOfExperienceText: "8 years",
          sourceText: null,
        },
        contacts: [],
        competencies: [],
        skills: [],
        experiences: [],
        projects: [
          {
            id: "project-1",
            title: "Interview analytics platform",
            categoryCode: "backend_platform",
            categoryName: "Backend Platform",
            organizationName: "Iterview",
            roleName: "Lead Engineer",
            techStackText: "React, Spring, Postgres",
            dateLabel: "Jan 2025 - Present",
            summary: "Built the resume extraction and interview intelligence pipeline.",
            contentText: "Owned extraction orchestration, contracts, and admin tooling.",
            tags: [
              {
                id: "tag-1",
                label: "resume",
                type: "domain",
              },
            ],
            relatedExperienceId: "experience-1",
          },
        ],
        achievements: [],
        education: [],
        certifications: [],
        awards: [],
        risks: [],
      },
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as never);
    vi.mocked(useReExtractResumeVersionMutation).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
      error: null,
    } as never);

    renderWithProviders(
      <Routes>
        <Route element={<ResumePage />} path="/resume" />
      </Routes>,
      { route: "/resume", locale: "ko" },
    );

    expect(screen.getAllByText("Backend Resume")).toHaveLength(3);
    expect(screen.getByText("후보자 개요")).toBeInTheDocument();
    expect(screen.getByText("Interview analytics platform")).toBeInTheDocument();
    expect(screen.getByText("Backend Platform")).toBeInTheDocument();
    expect(screen.getByText("resume · domain")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "+ 이력서 만들기" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "이력서 에디터 열기" })).toHaveAttribute(
      "href",
      "/resume/version-1/claims",
    );
    expect(document.querySelector(".resume-layout--desktop")).not.toBeNull();
  });

  it("opens create resume in a modal from the library header", async () => {
    const user = userEvent.setup();

    vi.mocked(useResumeListQuery).mockReturnValue({
      data: {
        items: [],
      },
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as never);
    vi.mocked(useCreateResumeMutation).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
      error: null,
    } as never);
    vi.mocked(useUploadResumeVersionMutation).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
      error: null,
    } as never);
    vi.mocked(useActivateResumeVersionMutation).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
      error: null,
    } as never);
    vi.mocked(useResumeVersionDetailQuery).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as never);
    vi.mocked(useResumeVersionExtractionQuery).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as never);
    vi.mocked(useResumeVersionSnapshotsQuery).mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as never);
    vi.mocked(useReExtractResumeVersionMutation).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
      error: null,
    } as never);

    renderWithProviders(
      <Routes>
        <Route element={<ResumePage />} path="/resume" />
      </Routes>,
      { route: "/resume", locale: "ko" },
    );

    await user.click(screen.getByRole("button", { name: "+ 이력서 만들기" }));

    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("새 이력서 컨테이너를 시작하세요")).toBeInTheDocument();
  });
});
