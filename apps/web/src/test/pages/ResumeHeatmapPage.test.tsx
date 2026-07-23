import { fireEvent, screen } from "@testing-library/react";
import { Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { useResumeQuestionHeatmapOverlayTargetsQuery } from "../../features/resume-heatmap/api/useResumeQuestionHeatmapOverlayTargetsQuery";
import { useResumeQuestionHeatmapQuery } from "../../features/resume-heatmap/api/useResumeQuestionHeatmapQuery";
import { useResumeVersionDetailQuery } from "../../features/resume/api/useResumeVersionDetailQuery";
import { useResumeVersionSnapshotsQuery } from "../../features/resume/api/useResumeVersionSnapshotsQuery";
import { ResumeHeatmapPage } from "../../pages/resume-heatmap/ResumeHeatmapPage";
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

describe("ResumeHeatmapPage", () => {
  it("renders a resume-first heatmap surface and opens inline question popovers", async () => {
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
        competencies: [
          {
            id: "competency-ui",
            sourceRecordId: "33",
            title: "Tradeoff communication",
            description: "Explains system tradeoffs clearly.",
          },
        ],
        skills: [
          {
            id: "skill-redis",
            sourceRecordId: "11",
            label: "Redis",
            value: "90% confidence",
            helperText: "Caching",
            tone: "positive",
          },
        ],
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
                isFollowUp: true,
                followUpCount: 2,
                pressureQuestion: true,
                weakAnswer: true,
                weaknessTags: ["Tradeoffs"],
                interviewDateLabel: "Mar 17, 2026",
                interviewDateTimeLabel: "Mar 17, 2026",
                linkSource: "heuristic",
                linkSourceLabel: "Heuristic",
                confidenceScore: 0.72,
                confidenceLabel: "72%",
              },
            ],
            overlayTargets: [
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

    renderWithProviders(
      <Routes>
        <Route element={<ResumeHeatmapPage />} path="/resume-versions/:versionId/heatmap" />
      </Routes>,
      { route: "/resume-versions/version-1/heatmap" },
    );

    expect(screen.getByText("Interview heatmap overview")).toBeInTheDocument();
    expect(screen.getAllByRole("heading", { name: "Cache platform" }).length).toBeGreaterThan(0);
    expect(screen.getByRole("button", { name: /Sentence \(1\)/ })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Projects" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Follow-up only" }));
    expect(screen.getByRole("button", { name: "Follow-up only" })).toHaveClass("detail-chip--active");
    fireEvent.click(
      screen.getByRole("button", { name: /Sentence.*Built cache-side resiliency\./i }),
    );
    expect(screen.getByText("What are cache-aside tradeoffs?")).toBeInTheDocument();
    expect(screen.getByText("Related interview questions")).toBeInTheDocument();
    expect(screen.getAllByText("Related interview questions").length).toBeGreaterThan(0);
    expect(screen.getAllByRole("link", { name: "Open detailed analysis" }).length).toBeGreaterThan(0);
  });
});
