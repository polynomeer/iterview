import type {
  InterviewSessionCoverageResponseDto,
  InterviewSessionDetailResponseDto,
  InterviewSessionListItemDto,
  InterviewSessionCoverageFacetSummaryDto,
  InterviewResumeEvidenceDto,
  InterviewSessionQuestionDto,
  InterviewSessionResumeMapResponseDto,
} from "../../shared/types/interview";
import { getCurrentAppLocale, normalizeAppLocale, type AppLocale } from "../../shared/i18n";
import { toArray } from "../../shared/lib/collection";
import { formatApiDateTime } from "../../shared/lib/date";

export type InterviewSessionQuestionModel = {
  id: string;
  questionId: string | null;
  title: string;
  promptText: string | null;
  bodyText: string | null;
  contentLocale: AppLocale | null;
  difficultyLabel: string;
  orderIndex: number;
  status: string;
  sourceType: string;
  sourceLabel: string;
  parentSessionQuestionId: string | null;
  isFollowUp: boolean;
  depth: number;
  categoryName: string | null;
  tags: string[];
  focusSkillNames: string[];
  resumeContextSummary: string | null;
  resumeEvidence: Array<{
    id: string;
    type: string;
    section: string | null;
    sectionLabel: string | null;
    label: string | null;
    snippet: string;
    confidenceLabel: string | null;
  }>;
  generationRationale: string | null;
  generationStatus: string;
  generationStatusLabel: string;
  revisitLabel: string | null;
  llmModel: string | null;
  llmPromptVersion: string | null;
  answerAttemptId: string | null;
  threadLabel: string;
};

export type InterviewFacetSummaryModel = {
  id: string;
  section: string;
  sectionLabel: string;
  label: string | null;
  sourceRecordType: string | null;
  sourceRecordId: string | null;
  sourceJoinKey: string | null;
  defendedFacets: string[];
  weakFacets: string[];
  skippedFacets: string[];
  unaskedFacets: string[];
  weakFacetCount: number;
  skippedFacetCount: number;
  defendedFacetCount: number;
  unaskedFacetCount: number;
};

export type InterviewSessionModel = {
  id: string;
  startedAt: string | null;
  endedAt: string | null;
  sessionType: string;
  interviewMode: string;
  interviewModeLabel: string;
  status: string;
  resumeVersionId: string | null;
  questions: InterviewSessionQuestionModel[];
  currentQuestion: InterviewSessionQuestionModel | null;
  summary: {
    totalQuestions: number;
    answeredQuestions: number;
    skippedQuestions: number;
    remainingQuestions: number;
    averageScoreLabel: string | null;
    weakFacetSummaries: InterviewFacetSummaryModel[];
    skippedFacetSummaries: InterviewFacetSummaryModel[];
    facetSummaries: InterviewFacetSummaryModel[];
  };
};

export type InterviewSessionListItemModel = {
  id: string;
  sessionType: string;
  sessionTypeLabel: string;
  interviewMode: string;
  interviewModeLabel: string;
  status: string;
  statusLabel: string;
  resumeVersionId: string | null;
  startedAtLabel: string | null;
  endedAtLabel: string | null;
  questionCount: number;
  answeredCount: number;
  averageScoreLabel: string | null;
};

export type InterviewCoverageModel = {
  sessionId: string;
  interviewMode: string;
  interviewModeLabel: string;
  overallCoveragePercent: number;
  defendedCoveragePercent: number;
  weakFacetSummaries: InterviewFacetSummaryModel[];
  skippedFacetSummaries: InterviewFacetSummaryModel[];
  facetSummaries: InterviewFacetSummaryModel[];
  evidenceItems: Array<{
    id: string;
    section: string;
    label: string | null;
    snippet: string;
    facet: string | null;
    sourceRecordType: string | null;
    sourceRecordId: string | null;
    sourceJoinKey: string | null;
    displayOrder: number;
    coverageStatus: string;
    coverageStatusLabel: string;
    coverageTone: "positive" | "warning" | "accent" | "neutral";
    sectionLabel: string;
    linkedQuestionIds: string[];
  }>;
};

export type InterviewResumeMapModel = {
  sessionId: string;
  resumeVersionId: string | null;
  weakFacetSummaries: InterviewFacetSummaryModel[];
  skippedFacetSummaries: InterviewFacetSummaryModel[];
  facetSummaries: InterviewFacetSummaryModel[];
  evidenceItems: Array<{
    id: string;
    section: string;
    label: string | null;
    snippet: string;
    facet: string | null;
    sourceRecordType: string | null;
    sourceRecordId: string | null;
    sourceJoinKey: string | null;
    displayOrder: number;
    coverageStatus: string;
    coverageStatusLabel: string;
    coverageTone: "positive" | "warning" | "accent" | "neutral";
    sectionLabel: string;
    relatedQuestions: Array<{
      sessionQuestionId: string;
      title: string;
      sourceType: string;
      sourceLabel: string;
      orderIndex: number;
      status: string;
      isFollowUp: boolean;
    }>;
  }>;
};

function formatLabel(value?: string | null) {
  const isKorean = getCurrentAppLocale() === "ko";
  if (!value) {
    return isKorean ? "알 수 없음" : "Unknown";
  }

  return value
    .split(/[_-\s]+/)
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ");
}

function formatInterviewEvidenceSection(value?: string | null) {
  const isKorean = getCurrentAppLocale() === "ko";
  switch ((value ?? "").toLowerCase()) {
    case "project":
      return isKorean ? "프로젝트" : "Project";
    case "experience":
      return isKorean ? "경험" : "Experience";
    default:
      return value ? formatLabel(value) : isKorean ? "이력서" : "Resume";
  }
}

function getCoverageTone(status?: string | null): "positive" | "warning" | "accent" | "neutral" {
  switch ((status ?? "").toLowerCase()) {
    case "defended":
      return "positive";
    case "weak":
    case "skipped":
      return "warning";
    case "asked":
      return "accent";
    default:
      return "neutral";
  }
}

function toResumeSourceJoinKey(sourceRecordType?: string | null, sourceRecordId?: string | number | null) {
  if (sourceRecordId === null || sourceRecordId === undefined) {
    return null;
  }

  const normalizedType = (sourceRecordType ?? "").toLowerCase();

  if (normalizedType.includes("project")) {
    return `project:${String(sourceRecordId)}`;
  }

  if (normalizedType.includes("experience")) {
    return `experience:${String(sourceRecordId)}`;
  }

  return `${normalizedType || "resume"}:${String(sourceRecordId)}`;
}

function mapInterviewResumeEvidenceDto(
  evidence: InterviewResumeEvidenceDto,
  index: number,
) {
  const isKorean = getCurrentAppLocale() === "ko";
  return {
    id:
      evidence.sourceRecordId === null || evidence.sourceRecordId === undefined
        ? `resume-evidence-${index}`
        : `${evidence.type ?? "evidence"}-${String(evidence.sourceRecordId)}`,
    type: evidence.type ?? "resume_evidence",
    section: evidence.section ?? null,
    sectionLabel: evidence.section ? formatInterviewEvidenceSection(evidence.section) : null,
    label: evidence.label ?? null,
    snippet: evidence.snippet ?? (isKorean ? "이력서 근거" : "Resume evidence"),
    confidenceLabel:
      evidence.confidence === null || evidence.confidence === undefined
        ? null
        : isKorean
          ? `${Math.round(evidence.confidence * 100)}% 일치`
          : `${Math.round(evidence.confidence * 100)}% match`,
  };
}

function mapInterviewSessionQuestionDto(
  question: InterviewSessionQuestionDto,
  index: number,
): InterviewSessionQuestionModel {
  const isKorean = getCurrentAppLocale() === "ko";
  const sourceType = question.sourceType ?? "seeded";
  const isAiFollowUp = sourceType === "ai_follow_up";
  const generationStatus = question.generationStatus ?? "not_requested";
  const normalizedRationale = (question.generationRationale ?? "").toLowerCase();
  const revisitLabel =
    generationStatus === "coverage_extended"
      ? normalizedRationale.includes("skip")
        ? isKorean
          ? "건너뜀 복구"
          : "Skipped recovery"
        : normalizedRationale.includes("weak")
          ? isKorean
            ? "방어가 약했던 지점 재확인"
            : "Revisiting a weakly defended point"
          : isKorean
            ? "깊이 커버리지 재확인"
            : "Deep-dive coverage revisit"
      : null;

  return {
    id: question.id === null || question.id === undefined ? `session-question-${index}` : String(question.id),
    questionId:
      question.questionId === null || question.questionId === undefined
        ? null
        : String(question.questionId),
    title: question.title ?? (isKorean ? "면접 질문" : "Interview question"),
    promptText: question.promptText ?? null,
    bodyText: question.bodyText ?? null,
    contentLocale: normalizeAppLocale(question.contentLocale),
    difficultyLabel: question.difficulty ?? (isKorean ? "일반" : "General"),
    orderIndex: question.orderIndex ?? index,
    status: question.status ?? (isKorean ? "대기" : "pending"),
    sourceType,
    sourceLabel: isAiFollowUp ? (isKorean ? "AI 꼬리질문" : "AI follow-up") : formatLabel(sourceType),
    parentSessionQuestionId:
      question.parentSessionQuestionId === null || question.parentSessionQuestionId === undefined
        ? null
        : String(question.parentSessionQuestionId),
    isFollowUp: question.isFollowUp ?? false,
    depth: question.depth ?? 0,
    categoryName: question.categoryName ?? null,
    tags: toArray(question.tags),
    focusSkillNames: toArray(question.focusSkillNames),
    resumeContextSummary: question.resumeContextSummary ?? null,
    resumeEvidence: toArray(question.resumeEvidence)
      .filter((evidence) => Boolean(evidence?.snippet))
      .map(mapInterviewResumeEvidenceDto),
    generationRationale: question.generationRationale ?? null,
    generationStatus,
    generationStatusLabel: formatLabel(generationStatus),
    revisitLabel,
    llmModel: question.llmModel ?? null,
    llmPromptVersion: question.llmPromptVersion ?? null,
    answerAttemptId:
      question.answerAttemptId === null || question.answerAttemptId === undefined
        ? null
        : String(question.answerAttemptId),
    threadLabel: question.isFollowUp
      ? isKorean
        ? `꼬리질문 · 깊이 ${question.depth ?? 0}`
        : `Follow-up · Depth ${question.depth ?? 0}`
      : isKorean
        ? "시드 질문"
        : "Seeded question",
  };
}

function mapInterviewFacetSummaryDto(
  item: InterviewSessionCoverageFacetSummaryDto,
  index: number,
): InterviewFacetSummaryModel {
  const sourceRecordId =
    item.sourceRecordId === null || item.sourceRecordId === undefined
      ? null
      : String(item.sourceRecordId);

  return {
    id:
      sourceRecordId === null
        ? `facet-summary-${index}`
        : `${item.sourceRecordType ?? "resume-record"}-${sourceRecordId}`,
    section: item.section ?? "resume",
    sectionLabel: formatInterviewEvidenceSection(item.section),
    label: item.label ?? null,
    sourceRecordType: item.sourceRecordType ?? null,
    sourceRecordId,
    sourceJoinKey: toResumeSourceJoinKey(item.sourceRecordType, item.sourceRecordId),
    defendedFacets: toArray(item.defendedFacets),
    weakFacets: toArray(item.weakFacets),
    skippedFacets: toArray(item.skippedFacets),
    unaskedFacets: toArray(item.unaskedFacets),
    weakFacetCount: toArray(item.weakFacets).length,
    skippedFacetCount: toArray(item.skippedFacets).length,
    defendedFacetCount: toArray(item.defendedFacets).length,
    unaskedFacetCount: toArray(item.unaskedFacets).length,
  };
}

export function mapInterviewSessionDetailResponseDtoToModel(
  response: InterviewSessionDetailResponseDto,
): InterviewSessionModel {
  return {
    id: response.id === null || response.id === undefined ? "" : String(response.id),
    startedAt: formatApiDateTime(response.startedAt),
    endedAt: formatApiDateTime(response.endedAt),
    sessionType: response.sessionType ?? "resume_mock",
    interviewMode: response.interviewMode ?? "mock_30",
    interviewModeLabel: formatLabel(response.interviewMode ?? "mock_30"),
    status: response.status ?? "in_progress",
    resumeVersionId:
      response.resumeVersionId === null || response.resumeVersionId === undefined
        ? null
        : String(response.resumeVersionId),
    questions: toArray(response.questions)
      .map(mapInterviewSessionQuestionDto)
      .sort((left, right) => left.orderIndex - right.orderIndex),
    currentQuestion:
      response.currentQuestion === null || response.currentQuestion === undefined
        ? null
        : mapInterviewSessionQuestionDto(response.currentQuestion, 0),
    summary: {
      totalQuestions: response.summary?.totalQuestions ?? 0,
      answeredQuestions: response.summary?.answeredQuestions ?? 0,
      skippedQuestions: response.summary?.skippedQuestions ?? 0,
      remainingQuestions: response.summary?.remainingQuestions ?? 0,
      averageScoreLabel:
        response.summary?.averageScore === null || response.summary?.averageScore === undefined
          ? null
          : `${Math.round(response.summary.averageScore)}`,
      weakFacetSummaries: toArray(response.summary?.weakFacetSummaries).map(mapInterviewFacetSummaryDto),
      skippedFacetSummaries: toArray(response.summary?.skippedFacetSummaries).map(mapInterviewFacetSummaryDto),
      facetSummaries: toArray(response.summary?.facetSummaries).map(mapInterviewFacetSummaryDto),
    },
  };
}

export function mapInterviewSessionListResponseDtoToModel(
  response: InterviewSessionListItemDto[] | null | undefined,
): InterviewSessionListItemModel[] {
  return toArray(response)
    .map((session, index) => ({
      sortTime: Date.parse(session.startedAt ?? "") || 0,
      item: {
        id: session.id === null || session.id === undefined ? `session-${index}` : String(session.id),
        sessionType: session.sessionType ?? "resume_mock",
        sessionTypeLabel: formatLabel(session.sessionType ?? "resume_mock"),
        interviewMode: session.interviewMode ?? "mock_30",
        interviewModeLabel: formatLabel(session.interviewMode ?? "mock_30"),
        status: session.status ?? "in_progress",
        statusLabel: formatLabel(session.status ?? "in_progress"),
        resumeVersionId:
          session.resumeVersionId === null || session.resumeVersionId === undefined
            ? null
            : String(session.resumeVersionId),
        startedAtLabel: formatApiDateTime(session.startedAt),
        endedAtLabel: formatApiDateTime(session.endedAt),
        questionCount: session.questionCount ?? 0,
        answeredCount: session.answeredCount ?? 0,
        averageScoreLabel:
          session.averageScore === null || session.averageScore === undefined
            ? null
            : `${Math.round(session.averageScore)}`,
      },
    }))
    .sort((left, right) => right.sortTime - left.sortTime)
    .map(({ item }) => item);
}

export function mapInterviewSessionCoverageResponseDtoToModel(
  response: InterviewSessionCoverageResponseDto,
): InterviewCoverageModel {
  const isKorean = getCurrentAppLocale() === "ko";
  return {
    sessionId:
      response.sessionId === null || response.sessionId === undefined ? "" : String(response.sessionId),
    interviewMode: response.interviewMode ?? "full_coverage",
    interviewModeLabel: formatLabel(response.interviewMode ?? "full_coverage"),
    overallCoveragePercent: response.overallCoveragePercent ?? 0,
    defendedCoveragePercent: response.defendedCoveragePercent ?? 0,
    weakFacetSummaries: toArray(response.weakFacetSummaries).map(mapInterviewFacetSummaryDto),
    skippedFacetSummaries: toArray(response.skippedFacetSummaries).map(mapInterviewFacetSummaryDto),
    facetSummaries: toArray(response.facetSummaries).map(mapInterviewFacetSummaryDto),
    evidenceItems: toArray(response.evidenceItems).map((item, index) => ({
      id: item.id === null || item.id === undefined ? `coverage-${index}` : String(item.id),
      section: item.section ?? (isKorean ? "이력서" : "Resume"),
      label: item.label ?? null,
      snippet: item.snippet ?? (isKorean ? "커버리지 근거" : "Coverage evidence"),
      facet: item.facet ?? null,
      sourceRecordType: item.sourceRecordType ?? null,
      sourceRecordId:
        item.sourceRecordId === null || item.sourceRecordId === undefined
          ? null
          : String(item.sourceRecordId),
      sourceJoinKey: toResumeSourceJoinKey(item.sourceRecordType, item.sourceRecordId),
      displayOrder: item.displayOrder ?? index,
      coverageStatus: item.coverageStatus ?? (isKorean ? "미질문" : "unasked"),
      coverageStatusLabel: formatLabel(item.coverageStatus ?? "unasked"),
      coverageTone: getCoverageTone(item.coverageStatus),
      sectionLabel: formatInterviewEvidenceSection(item.section),
      linkedQuestionIds: toArray(item.linkedQuestionIds).map(String),
    })),
  };
}

export function mapInterviewSessionResumeMapResponseDtoToModel(
  response: InterviewSessionResumeMapResponseDto,
): InterviewResumeMapModel {
  const isKorean = getCurrentAppLocale() === "ko";
  return {
    sessionId:
      response.sessionId === null || response.sessionId === undefined ? "" : String(response.sessionId),
    resumeVersionId:
      response.resumeVersionId === null || response.resumeVersionId === undefined
        ? null
        : String(response.resumeVersionId),
    weakFacetSummaries: toArray(response.weakFacetSummaries).map(mapInterviewFacetSummaryDto),
    skippedFacetSummaries: toArray(response.skippedFacetSummaries).map(mapInterviewFacetSummaryDto),
    facetSummaries: toArray(response.facetSummaries).map(mapInterviewFacetSummaryDto),
    evidenceItems: toArray(response.evidenceItems).map((item, index) => ({
      id:
        item.sourceRecordId === null || item.sourceRecordId === undefined
          ? `resume-map-${index}`
          : `${item.sourceRecordType ?? "resume-record"}-${String(item.sourceRecordId)}`,
      section: item.section ?? (isKorean ? "이력서" : "Resume"),
      label: item.label ?? null,
      snippet: item.snippet ?? (isKorean ? "이력서 근거" : "Resume evidence"),
      facet: item.facet ?? null,
      sourceRecordType: item.sourceRecordType ?? null,
      sourceRecordId:
        item.sourceRecordId === null || item.sourceRecordId === undefined
          ? null
          : String(item.sourceRecordId),
      sourceJoinKey: toResumeSourceJoinKey(item.sourceRecordType, item.sourceRecordId),
      displayOrder: item.displayOrder ?? index,
      coverageStatus: item.coverageStatus ?? (isKorean ? "미질문" : "unasked"),
      coverageStatusLabel: formatLabel(item.coverageStatus ?? "unasked"),
      coverageTone: getCoverageTone(item.coverageStatus),
      sectionLabel: formatInterviewEvidenceSection(item.section),
      relatedQuestions: toArray(item.relatedQuestions).map((question, relatedIndex) => ({
        sessionQuestionId:
          question.sessionQuestionId === null || question.sessionQuestionId === undefined
            ? `session-question-${relatedIndex}`
            : String(question.sessionQuestionId),
        title: question.title ?? (isKorean ? "면접 질문" : "Interview question"),
        sourceType: question.sourceType ?? (isKorean ? "시드" : "seeded"),
        sourceLabel: formatLabel(question.sourceType ?? "seeded"),
        orderIndex: question.orderIndex ?? relatedIndex,
        status: question.status ?? (isKorean ? "알 수 없음" : "unknown"),
        isFollowUp: question.isFollowUp ?? false,
      })),
    })),
  };
}

export function getAnsweredQuestionCount(session: InterviewSessionModel) {
  return session.summary.answeredQuestions;
}

export function getSkippedQuestionCount(session: InterviewSessionModel) {
  return session.summary.skippedQuestions;
}

export function getCurrentInterviewQuestion(session: InterviewSessionModel) {
  return session.currentQuestion;
}

export function canAdvanceInterviewSession(session: InterviewSessionModel) {
  const currentQuestion = session.currentQuestion;

  if (!currentQuestion) {
    return true;
  }

  const normalizedStatus = currentQuestion.status.toLowerCase();

  if (normalizedStatus === "answered" || normalizedStatus === "skipped") {
    return true;
  }

  if (normalizedStatus === "queued") {
    return true;
  }

  return false;
}
