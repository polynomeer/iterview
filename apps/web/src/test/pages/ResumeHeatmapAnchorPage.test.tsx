import { fireEvent, screen } from "@testing-library/react";
import { Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { useCreateResumeQuestionHeatmapLinkMutation } from "../../features/resume-heatmap/api/useCreateResumeQuestionHeatmapLinkMutation";
import { useResumeQuestionHeatmapOverlayTargetsQuery } from "../../features/resume-heatmap/api/useResumeQuestionHeatmapOverlayTargetsQuery";
import { useResumeQuestionHeatmapQuery } from "../../features/resume-heatmap/api/useResumeQuestionHeatmapQuery";
import { useUpdateResumeQuestionHeatmapLinkMutation } from "../../features/resume-heatmap/api/useUpdateResumeQuestionHeatmapLinkMutation";
import { useResumeVersionDetailQuery } from "../../features/resume/api/useResumeVersionDetailQuery";
import { useResumeVersionSnapshotsQuery } from "../../features/resume/api/useResumeVersionSnapshotsQuery";
import { ResumeHeatmapAnchorPage } from "../../pages/resume-heatmap/ResumeHeatmapAnchorPage";
import { renderWithProviders } from "../utils";

vi.mock("../../features/resume/api/useResumeVersionDetailQuery", () => ({
  useResumeVersionDetailQuery: vi.fn(),
}));
vi.mock("../../features/resume/api/useResumeVersionSnapshotsQuery", () => ({
  useResumeVersionSnapshotsQuery: vi.fn(),
}));
vi.mock("../../features/resume-heatmap/api/useResumeQuestionHeatmapQuery", () => ({
  useResumeQuestionHeatmapQuery: vi.fn(),
}));
vi.mock("../../features/resume-heatmap/api/useResumeQuestionHeatmapOverlayTargetsQuery", () => ({
  useResumeQuestionHeatmapOverlayTargetsQuery: vi.fn(),
}));
vi.mock("../../features/resume-heatmap/api/useCreateResumeQuestionHeatmapLinkMutation", () => ({
  useCreateResumeQuestionHeatmapLinkMutation: vi.fn(),
}));
vi.mock("../../features/resume-heatmap/api/useUpdateResumeQuestionHeatmapLinkMutation", () => ({
  useUpdateResumeQuestionHeatmapLinkMutation: vi.fn(),
}));

describe("ResumeHeatmapAnchorPage", () => {
  it("renders anchor detail and saves a manual remap", async () => {
    const createMutateAsync = vi.fn().mockResolvedValue({
      id: "manual-link-1",
    });

    vi.mocked(useResumeVersionDetailQuery).mockReturnValue({
      data: {
        id: "version-1",
        fileNameLabel: "backend-resume.pdf",
        parsingStatusLabel: "Completed",
      },
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as never);
    vi.mocked(useResumeVersionSnapshotsQuery).mockReturnValue({
      data: {
        profile: {
          fullName: "Alex Kim",
          headline: "Backend Engineer",
          summaryText: "Built platform APIs and cache services.",
          locationText: null,
          yearsOfExperienceText: null,
          sourceText: null,
        },
        contacts: [],
        competencies: [],
        skills: [],
        experiences: [
          {
            id: "experience-1",
            sourceRecordId: "21",
            companyName: "Datadog",
            roleName: "Backend Engineer",
            dateLabel: "2022 - Present",
            current: true,
            summary: "Owned platform APIs.",
          },
        ],
        projects: [
          {
            id: "project-1",
            sourceRecordId: "31",
            title: "Cache platform",
            dateLabel: "2023",
            summary: "Built cache-side resiliency.",
            contentText: "Built cache-side resiliency.",
            tags: [],
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
    vi.mocked(useResumeQuestionHeatmapQuery).mockReturnValue({
      data: {
        resumeVersionId: "version-1",
        scope: "all",
        appliedFilters: {
          scope: "all",
          weakOnly: false,
          companyName: "",
          interviewDateFrom: "",
          interviewDateTo: "",
        },
        filterSummary: {
          totalQuestions: 3,
          weakQuestionCount: 1,
          pressureQuestionCount: 1,
          followUpQuestionCount: 2,
          distinctInterviewCount: 1,
          distinctCompanyCount: 1,
          companyNames: ["Datadog"],
          availableTargetTypes: ["block", "sentence", "keyword"],
          targetTypeCounts: { block: 1, sentence: 1, keyword: 1 },
          earliestInterviewDate: "2026-03-17",
          latestInterviewDate: "2026-03-17",
          earliestInterviewDateLabel: "Mar 17, 2026",
          latestInterviewDateLabel: "Mar 17, 2026",
        },
        summary: {
          totalAnchors: 2,
          totalLinkedQuestions: 3,
          hottestAnchorLabel: "Cache platform",
          mostFollowedUpAnchorLabel: "Cache platform",
          weakestAnchorLabel: "Datadog · Backend Engineer",
        },
        items: [
          {
            id: "project:31",
            anchorType: "project",
            anchorTypeLabel: "Project",
            anchorRecordId: "31",
            anchorKey: null,
            label: "Cache platform",
            snippet: "Built cache-side resiliency.",
            heatScoreLabel: "7",
            normalizedHeatLevel: "high",
            heatTone: "high",
            directQuestionCount: 2,
            followUpCount: 3,
            distinctInterviewCount: 1,
            pressureQuestionCount: 1,
            weaknessCount: 1,
            recentQuestionAtLabel: "Mar 17, 2026",
            linkedQuestions: [
              {
                id: "501",
                interviewRecordQuestionId: "501",
                sourceInterviewRecordId: "record-1",
                linkedQuestionId: "question-77",
                text: "What are cache-aside tradeoffs?",
                questionTypeLabel: "System Design",
                questionType: "system_design",
                isFollowUp: true,
                followUpCount: 2,
                pressureQuestion: true,
                weakAnswer: true,
                weaknessTags: ["Tradeoffs"],
                interviewDateLabel: "Mar 17, 2026",
                interviewDateTimeLabel: "Mar 17, 2026",
                interviewDate: "2026-03-17",
                linkSource: "heuristic",
                linkSourceLabel: "Heuristic",
                confidenceScore: 0.72,
                confidenceLabel: "72%",
              },
            ],
            overlayTargets: [],
          },
        ],
      },
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as never);
    vi.mocked(useResumeQuestionHeatmapOverlayTargetsQuery).mockReturnValue({
      data: {
        resumeVersionId: "version-1",
        scope: "all",
        appliedFilters: {
          scope: "all",
          weakOnly: false,
          companyName: "",
          interviewDateFrom: "",
          interviewDateTo: "",
        },
        filterSummary: {
          totalQuestions: 3,
          weakQuestionCount: 1,
          pressureQuestionCount: 1,
          followUpQuestionCount: 2,
          distinctInterviewCount: 1,
          distinctCompanyCount: 1,
          companyNames: ["Datadog"],
          availableTargetTypes: ["block", "sentence", "keyword"],
          targetTypeCounts: { block: 1, sentence: 1, keyword: 1 },
          earliestInterviewDate: "2026-03-17",
          latestInterviewDate: "2026-03-17",
          earliestInterviewDateLabel: "Mar 17, 2026",
          latestInterviewDateLabel: "Mar 17, 2026",
        },
        items: [
          {
            id: "overlay-1",
            anchorType: "project",
            anchorTypeLabel: "Project",
            anchorRecordId: "31",
            anchorKey: null,
            targetType: "sentence",
            targetTypeLabel: "Sentence",
            targetKey: "project:31:sentence:2",
            fieldPath: "project.contentText",
            textSnippet: "Built cache-side resiliency.",
            textStartOffset: 0,
            textEndOffset: 28,
            sentenceIndex: 2,
            paragraphIndex: 0,
            heatScoreLabel: "4",
            normalizedHeatLevel: "high",
            heatTone: "high",
            questionCount: 1,
            followUpCount: 2,
            pressureQuestionCount: 1,
            weaknessCount: 1,
            linkedQuestions: [
              {
                id: "501",
                interviewRecordQuestionId: "501",
                sourceInterviewRecordId: "record-1",
                linkedQuestionId: "question-77",
                text: "What are cache-aside tradeoffs?",
                questionTypeLabel: "System Design",
                questionType: "system_design",
                isFollowUp: true,
                followUpCount: 2,
                pressureQuestion: true,
                weakAnswer: true,
                weaknessTags: ["Tradeoffs"],
                interviewDateLabel: "Mar 17, 2026",
                interviewDateTimeLabel: "Mar 17, 2026",
                interviewDate: "2026-03-17",
                linkSource: "heuristic",
                linkSourceLabel: "Heuristic",
                confidenceScore: 0.72,
                confidenceLabel: "72%",
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
    vi.mocked(useCreateResumeQuestionHeatmapLinkMutation).mockReturnValue({
      mutateAsync: createMutateAsync,
      isPending: false,
      isError: false,
      error: null,
      reset: vi.fn(),
    } as never);
    vi.mocked(useUpdateResumeQuestionHeatmapLinkMutation).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
      isError: false,
      error: null,
      reset: vi.fn(),
    } as never);

    renderWithProviders(
      <Routes>
        <Route
          element={<ResumeHeatmapAnchorPage />}
          path="/resume/:versionId/heatmap/anchors/:anchorType/:anchorId"
        />
      </Routes>,
      { route: "/resume/version-1/heatmap/anchors/project/31" },
    );

    expect(screen.getByText("Detailed anchor review")).toBeInTheDocument();
    expect(screen.getByText("What are cache-aside tradeoffs?")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Fix link" }));
    expect(screen.getByText("Correct this question mapping")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Anchor type"), {
      target: { value: "experience" },
    });
    fireEvent.change(screen.getByLabelText("Resume anchor"), {
      target: { value: "experience:21" },
    });
    fireEvent.change(screen.getByLabelText("Confidence score"), {
      target: { value: "0.91" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Save manual remap" }));

    expect(createMutateAsync).toHaveBeenCalledWith({
      interviewRecordQuestionId: "501",
      anchorType: "experience",
      anchorRecordId: "21",
      anchorKey: null,
      overlayTargetType: null,
      overlayFieldPath: null,
      overlaySentenceIndex: null,
      overlayTextSnippet: null,
      confidenceScore: 0.91,
    });
  });
});
