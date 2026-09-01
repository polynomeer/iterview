import userEvent from "@testing-library/user-event";
import { screen } from "@testing-library/react";
import { Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { InterviewResultPage } from "../../pages/interview-result/InterviewResultPage";
import { useInterviewSessionCoverageQuery } from "../../features/interview/api/useInterviewSessionCoverageQuery";
import { useInterviewSessionDetailQuery } from "../../features/interview/api/useInterviewSessionDetailQuery";
import { useInterviewSessionResumeMapQuery } from "../../features/interview/api/useInterviewSessionResumeMapQuery";
import { useResumeVersionResultSectionsQuery } from "../../features/resume/api/useResumeVersionResultSectionsQuery";
import { renderWithProviders } from "../utils";

vi.mock("../../features/interview/api/useInterviewSessionDetailQuery", () => ({
  useInterviewSessionDetailQuery: vi.fn(),
}));

vi.mock("../../features/interview/api/useInterviewSessionCoverageQuery", () => ({
  useInterviewSessionCoverageQuery: vi.fn(),
}));

vi.mock("../../features/interview/api/useInterviewSessionResumeMapQuery", () => ({
  useInterviewSessionResumeMapQuery: vi.fn(),
}));

vi.mock("../../features/resume/api/useResumeVersionResultSectionsQuery", () => ({
  useResumeVersionResultSectionsQuery: vi.fn(),
}));

describe("InterviewResultPage", () => {
  it("renders structured full-coverage result mapping and pins related questions", async () => {
    vi.mocked(useInterviewSessionDetailQuery).mockReturnValue({
      data: {
        id: "session-14",
        startedAt: "Mar 12, 10:00 AM",
        endedAt: "Mar 12, 11:00 AM",
        sessionType: "resume_mock",
        interviewMode: "full_coverage",
        interviewModeLabel: "Full Coverage",
        status: "completed",
        resumeVersionId: "resume-version-1",
        currentQuestion: null,
        questions: [
          {
            id: "sq-1",
            questionId: null,
            title: "Tell me about the cache migration",
            promptText: null,
            bodyText: "Focus on the rollout and tradeoffs.",
            contentLocale: "en",
            difficultyLabel: "Medium",
            orderIndex: 0,
            status: "answered",
            sourceType: "seeded",
            sourceLabel: "Seeded",
            parentSessionQuestionId: null,
            isFollowUp: false,
            depth: 0,
            categoryName: "Backend",
            tags: [],
            focusSkillNames: [],
            resumeContextSummary: null,
            resumeEvidence: [],
            generationRationale: null,
            generationStatus: "completed",
            llmModel: null,
            llmPromptVersion: null,
            answerAttemptId: "attempt-1",
            threadLabel: "Seeded question",
          },
          {
            id: "sq-2",
            questionId: null,
            title: "Why did you choose cache-aside here?",
            promptText: null,
            bodyText: "Discuss failure recovery.",
            contentLocale: "en",
            difficultyLabel: "Hard",
            orderIndex: 1,
            status: "answered",
            sourceType: "ai_follow_up",
            sourceLabel: "AI follow-up",
            parentSessionQuestionId: "sq-1",
            isFollowUp: true,
            depth: 1,
            categoryName: "Backend",
            tags: [],
            focusSkillNames: [],
            resumeContextSummary: null,
            resumeEvidence: [],
            generationRationale: null,
            generationStatus: "completed",
            llmModel: "gpt",
            llmPromptVersion: "v2",
            answerAttemptId: "attempt-2",
            threadLabel: "Follow-up · Depth 1",
          },
        ],
        summary: {
          totalQuestions: 2,
          answeredQuestions: 2,
          skippedQuestions: 0,
          remainingQuestions: 0,
          averageScoreLabel: "88",
        },
      },
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as never);

    vi.mocked(useInterviewSessionCoverageQuery).mockReturnValue({
      data: {
        sessionId: "session-14",
        interviewMode: "full_coverage",
        interviewModeLabel: "Full Coverage",
        overallCoveragePercent: 72,
        defendedCoveragePercent: 44,
        weakFacetSummaries: [
          {
            id: "facet-weak-1",
            section: "project",
            sectionLabel: "Project",
            label: "Caching rollout",
            sourceRecordType: "resume_project_snapshot",
            sourceRecordId: "17",
            sourceJoinKey: "project:17",
            defendedFacets: ["scope"],
            weakFacets: ["tradeoffs"],
            skippedFacets: [],
            unaskedFacets: [],
            weakFacetCount: 1,
            skippedFacetCount: 0,
            defendedFacetCount: 1,
            unaskedFacetCount: 0,
          },
        ],
        skippedFacetSummaries: [
          {
            id: "facet-skip-1",
            section: "experience",
            sectionLabel: "Experience",
            label: "Backend Engineer",
            sourceRecordType: "resume_experience_snapshot",
            sourceRecordId: "4",
            sourceJoinKey: "experience:4",
            defendedFacets: [],
            weakFacets: [],
            skippedFacets: ["failure recovery"],
            unaskedFacets: [],
            weakFacetCount: 0,
            skippedFacetCount: 1,
            defendedFacetCount: 0,
            unaskedFacetCount: 0,
          },
        ],
        facetSummaries: [],
        evidenceItems: [
          {
            id: "coverage-1",
            section: "project",
            label: "Caching rollout",
            snippet: "Migrated core traffic to cache-aside with rollback toggles.",
            coverageStatus: "defended",
            coverageStatusLabel: "Defended",
            coverageTone: "positive",
            sectionLabel: "Project",
            linkedQuestionIds: ["sq-1", "sq-2"],
          },
        ],
      },
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    } as never);

    vi.mocked(useInterviewSessionResumeMapQuery).mockReturnValue({
      data: {
        sessionId: "session-14",
        resumeVersionId: "resume-version-1",
        weakFacetSummaries: [],
        skippedFacetSummaries: [],
        facetSummaries: [],
        evidenceItems: [
          {
            id: "resume-map-1",
            section: "project",
            label: "Caching rollout",
            snippet: "Migrated core traffic to cache-aside with rollback toggles.",
            sourceRecordType: "resume_project_snapshot",
            sourceRecordId: "17",
            sourceJoinKey: "project:17",
            coverageStatus: "defended",
            coverageStatusLabel: "Defended",
            coverageTone: "positive",
            sectionLabel: "Project",
            relatedQuestions: [
              {
                sessionQuestionId: "sq-1",
                title: "Tell me about the cache migration",
                sourceType: "seeded",
                sourceLabel: "Seeded",
              },
              {
                sessionQuestionId: "sq-2",
                title: "Why did you choose cache-aside here?",
                sourceType: "ai_follow_up",
                sourceLabel: "AI follow-up",
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

    vi.mocked(useResumeVersionResultSectionsQuery).mockReturnValue({
      data: {
        experiences: [
          {
            id: "4",
            sourceJoinKey: "experience:4",
            companyName: "Datadog",
            roleName: "Backend Engineer",
            employmentType: "Full-time",
            dateLabel: "2023 - Present",
            current: true,
            summary: "Owned resilience improvements across cache and queue services.",
            impactText: "Reduced incident impact during rollouts.",
            projectName: undefined,
          },
        ],
        projects: [
          {
            id: "17",
            sourceJoinKey: "project:17",
            title: "Caching rollout",
            categoryCode: "platform",
            categoryName: "Platform",
            organizationName: "Datadog",
            roleName: "Lead engineer",
            techStackText: "Redis, Kotlin",
            dateLabel: "2024",
            summary: "Migrated critical endpoints to cache-aside with staged traffic rollout.",
            contentText: "Added shadow reads, dual metrics, and rollback toggles before full cutover.",
            tags: [
              {
                id: "tag-1",
                label: "Caching",
                type: "Topic",
              },
            ],
            relatedExperienceId: "4",
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
        <Route element={<InterviewResultPage />} path="/interviews/:sessionId/result" />
      </Routes>,
      { route: "/interviews/session-14/result", locale: "ko" },
    );

    expect(screen.getByText("구조화된 이력서 범위")).toBeInTheDocument();
    expect(screen.getAllByText("약한 세부 항목 재검증").length).toBeGreaterThan(0);
    expect(screen.getAllByText("건너뛴 세부 항목 복구").length).toBeGreaterThan(0);
    expect(screen.getByText("이력서 프로젝트")).toBeInTheDocument();
    expect(screen.getAllByText("Caching rollout").length).toBeGreaterThan(0);
    expect(screen.getByText("좁은 복구 패스를 실행")).toBeInTheDocument();
    expect(screen.getByText("약한 가지 1개 우선")).toBeInTheDocument();
    expect(screen.getAllByText("좁은 복구 패스 시작")).toHaveLength(2);
    expect(screen.getByRole("heading", { name: "결과를 읽고 다음 복구 패스를 고르세요" })).toBeInTheDocument();

    await userEvent.click(screen.getAllByRole("button", { name: /Caching rollout/i })[0]);

    expect(screen.getByText("고정된 질문")).toBeInTheDocument();
    expect(screen.getAllByText("Tell me about the cache migration").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Why did you choose cache-aside here?").length).toBeGreaterThan(0);
  });
});
