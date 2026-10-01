import { toArray } from "../../shared/lib/collection";
import { formatApiDate, formatApiDateTime } from "../../shared/lib/date";
import type {
  ResumeQuestionHeatmapAppliedFiltersDto,
  ResumeQuestionHeatmapDto,
  ResumeQuestionHeatmapFilterSummaryDto,
  ResumeQuestionHeatmapFiltersDto,
  ResumeQuestionHeatmapLinkDto,
  ResumeQuestionHeatmapOverlayTargetDto,
  ResumeQuestionHeatmapOverlayTargetListDto,
  ResumeQuestionHeatmapScopeDto,
  ResumeQuestionHeatmapTargetTypeDto,
} from "../../shared/types/resumeHeatmap";

function toId(value: string | number | null | undefined, fallback: string) {
  return value === null || value === undefined ? fallback : String(value);
}

function formatLabel(value?: string | null) {
  if (!value) {
    return "Unknown";
  }

  return value
    .split(/[_-\s]+/)
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ");
}

function getHeatTone(value?: string | null): "low" | "medium" | "high" | "critical" {
  switch ((value ?? "").toLowerCase()) {
    case "critical":
      return "critical";
    case "high":
      return "high";
    case "medium":
      return "medium";
    default:
      return "low";
  }
}

function normalizeScope(value?: string | null): ResumeQuestionHeatmapScopeDto {
  if (value === "main" || value === "follow_up" || value === "all") {
    return value;
  }

  return "all";
}

function normalizeTargetType(
  value?: string | null,
): ResumeQuestionHeatmapTargetTypeDto | null {
  if (value === "block" || value === "sentence" || value === "phrase" || value === "keyword") {
    return value;
  }

  return null;
}

export type ResumeHeatmapScopeModel = ResumeQuestionHeatmapScopeDto;

export type ResumeQuestionHeatmapQuestionModel = {
  id: string;
  interviewRecordQuestionId: string;
  sourceInterviewRecordId: string;
  linkedQuestionId: string | null;
  text: string;
  questionType: string;
  questionTypeLabel: string;
  isFollowUp: boolean;
  followUpCount: number;
  pressureQuestion: boolean;
  weakAnswer: boolean;
  weaknessTags: string[];
  interviewDate: string | null;
  interviewDateLabel: string | null;
  interviewDateTimeLabel: string | null;
  linkSource: string;
  linkSourceLabel: string;
  confidenceScore: number | null;
  confidenceLabel: string | null;
  /** The resume claim this question is about, inside its project or experience (ADR 0084). */
  achievementId: string | null;
  achievementSource: "manual" | "heuristic" | null;
};

export type ResumeQuestionHeatmapOverlayTargetModel = {
  id: string;
  anchorType: string;
  anchorTypeLabel: string;
  anchorRecordId: string | null;
  anchorKey: string | null;
  targetType: ResumeQuestionHeatmapTargetTypeDto | null;
  targetTypeLabel: string;
  targetKey: string;
  fieldPath: string | null;
  textSnippet: string | null;
  textStartOffset: number | null;
  textEndOffset: number | null;
  sentenceIndex: number | null;
  paragraphIndex: number | null;
  heatScoreLabel: string;
  normalizedHeatLevel: string;
  heatTone: "low" | "medium" | "high" | "critical";
  questionCount: number;
  followUpCount: number;
  pressureQuestionCount: number;
  weaknessCount: number;
  linkedQuestions: ResumeQuestionHeatmapQuestionModel[];
};

export type ResumeQuestionHeatmapModel = {
  resumeVersionId: string;
  scope: ResumeHeatmapScopeModel;
  appliedFilters: {
    scope: ResumeQuestionHeatmapScopeDto;
    weakOnly: boolean;
    companyName: string;
    interviewDateFrom: string;
    interviewDateTo: string;
    targetType?: ResumeQuestionHeatmapTargetTypeDto;
  };
  filterSummary: {
    totalQuestions: number;
    weakQuestionCount: number;
    pressureQuestionCount: number;
    followUpQuestionCount: number;
    distinctInterviewCount: number;
    distinctCompanyCount: number;
    companyNames: string[];
    availableTargetTypes: ResumeQuestionHeatmapTargetTypeDto[];
    targetTypeCounts: Record<string, number>;
    earliestInterviewDate: string | null;
    latestInterviewDate: string | null;
    earliestInterviewDateLabel: string | null;
    latestInterviewDateLabel: string | null;
  };
  summary: {
    totalAnchors: number;
    totalLinkedQuestions: number;
    hottestAnchorLabel: string | null;
    mostFollowedUpAnchorLabel: string | null;
    weakestAnchorLabel: string | null;
  };
  items: Array<{
    id: string;
    anchorType: string;
    anchorTypeLabel: string;
    anchorRecordId: string | null;
    anchorKey: string | null;
    label: string;
    snippet: string | null;
    heatScoreLabel: string;
    normalizedHeatLevel: string;
    heatTone: "low" | "medium" | "high" | "critical";
    directQuestionCount: number;
    followUpCount: number;
    distinctInterviewCount: number;
    pressureQuestionCount: number;
    weaknessCount: number;
    recentQuestionAt: string | null;
    recentQuestionAtLabel: string | null;
    overlayTargets: ResumeQuestionHeatmapOverlayTargetModel[];
    linkedQuestions: ResumeQuestionHeatmapQuestionModel[];
  }>;
};

export type ResumeQuestionHeatmapOverlayTargetListModel = {
  resumeVersionId: string;
  scope: ResumeHeatmapScopeModel;
  appliedFilters: ResumeQuestionHeatmapModel["appliedFilters"];
  filterSummary: ResumeQuestionHeatmapModel["filterSummary"];
  items: ResumeQuestionHeatmapOverlayTargetModel[];
};

export type ResumeQuestionHeatmapLinkModel = {
  id: string;
  resumeVersionId: string;
  interviewRecordQuestionId: string;
  anchorType: string;
  anchorTypeLabel: string;
  anchorRecordId: string | null;
  anchorKey: string | null;
  overlayTargetType: ResumeQuestionHeatmapTargetTypeDto | null;
  overlayTargetTypeLabel: string | null;
  overlayFieldPath: string | null;
  overlaySentenceIndex: number | null;
  overlayTextSnippet: string | null;
  linkSource: string;
  linkSourceLabel: string;
  confidenceScore: number | null;
  confidenceLabel: string | null;
  active: boolean;
};

function mapAppliedFilters(
  filters?: ResumeQuestionHeatmapAppliedFiltersDto | null,
): ResumeQuestionHeatmapModel["appliedFilters"] {
  return {
    scope: normalizeScope(filters?.scope),
    weakOnly: filters?.weakOnly ?? false,
    companyName: filters?.companyName ?? "",
    interviewDateFrom: filters?.interviewDateFrom ?? "",
    interviewDateTo: filters?.interviewDateTo ?? "",
    targetType: normalizeTargetType(filters?.targetType) ?? undefined,
  };
}

function mapFilterSummary(
  summary?: ResumeQuestionHeatmapFilterSummaryDto | null,
): ResumeQuestionHeatmapModel["filterSummary"] {
  return {
    totalQuestions: summary?.totalQuestions ?? 0,
    weakQuestionCount: summary?.weakQuestionCount ?? 0,
    pressureQuestionCount: summary?.pressureQuestionCount ?? 0,
    followUpQuestionCount: summary?.followUpQuestionCount ?? 0,
    distinctInterviewCount: summary?.distinctInterviewCount ?? 0,
    distinctCompanyCount: summary?.distinctCompanyCount ?? 0,
    companyNames: toArray(summary?.companyNames),
    availableTargetTypes: toArray(summary?.availableTargetTypes)
      .map((item) => normalizeTargetType(item))
      .filter(Boolean) as ResumeQuestionHeatmapTargetTypeDto[],
    targetTypeCounts: summary?.targetTypeCounts ?? {},
    earliestInterviewDate: summary?.earliestInterviewDate ?? null,
    latestInterviewDate: summary?.latestInterviewDate ?? null,
    earliestInterviewDateLabel: formatApiDate(summary?.earliestInterviewDate),
    latestInterviewDateLabel: formatApiDate(summary?.latestInterviewDate),
  };
}

function mapQuestion(
  question: NonNullable<ResumeQuestionHeatmapOverlayTargetDto["linkedQuestions"]>[number],
  index: number,
): ResumeQuestionHeatmapQuestionModel {
  return {
    id: toId(question.interviewRecordQuestionId, `linked-question-${index}`),
    interviewRecordQuestionId: toId(question.interviewRecordQuestionId, `linked-question-${index}`),
    sourceInterviewRecordId: toId(question.sourceInterviewRecordId, `interview-record-${index}`),
    linkedQuestionId:
      question.linkedQuestionId === null || question.linkedQuestionId === undefined
        ? null
        : String(question.linkedQuestionId),
    text: question.text ?? "Interview question",
    questionType: question.questionType ?? "general",
    questionTypeLabel: formatLabel(question.questionType),
    isFollowUp: question.isFollowUp ?? false,
    followUpCount: question.followUpCount ?? 0,
    pressureQuestion: question.pressureQuestion ?? false,
    weakAnswer: question.weakAnswer ?? false,
    weaknessTags: toArray(question.weaknessTags),
    interviewDate: question.interviewDate ?? null,
    interviewDateLabel: formatApiDate(question.interviewDate),
    interviewDateTimeLabel: formatApiDateTime(question.interviewDate),
    linkSource: question.linkSource ?? "heuristic",
    linkSourceLabel: formatLabel(question.linkSource),
    confidenceScore: question.confidenceScore ?? null,
    confidenceLabel:
      question.confidenceScore === null || question.confidenceScore === undefined
        ? null
        : `${Math.round(question.confidenceScore * 100)}%`,
    achievementId: question.achievementId === null || question.achievementId === undefined ? null : String(question.achievementId),
    achievementSource: question.achievementSource ?? null,
  };
}

function mapOverlayTarget(
  target: ResumeQuestionHeatmapOverlayTargetDto,
  index: number,
): ResumeQuestionHeatmapOverlayTargetModel {
  const targetType = normalizeTargetType(target.targetType);
  const targetKey = target.targetKey ?? `${targetType ?? "block"}-${index}`;

  return {
    id: toId(target.id, `overlay-target-${targetKey}`),
    anchorType: target.anchorType ?? "unknown",
    anchorTypeLabel: formatLabel(target.anchorType),
    anchorRecordId:
      target.anchorRecordId === null || target.anchorRecordId === undefined
        ? null
        : String(target.anchorRecordId),
    anchorKey: target.anchorKey ?? null,
    targetType,
    targetTypeLabel: formatLabel(target.targetType ?? "block"),
    targetKey,
    fieldPath: target.fieldPath ?? null,
    textSnippet: target.textSnippet ?? null,
    textStartOffset: target.textStartOffset ?? null,
    textEndOffset: target.textEndOffset ?? null,
    sentenceIndex: target.sentenceIndex ?? null,
    paragraphIndex: target.paragraphIndex ?? null,
    heatScoreLabel: `${Math.round(target.heatScore ?? 0)}`,
    normalizedHeatLevel: (target.normalizedHeatLevel ?? "low").toLowerCase(),
    heatTone: getHeatTone(target.normalizedHeatLevel),
    questionCount: target.questionCount ?? 0,
    followUpCount: target.followUpCount ?? 0,
    pressureQuestionCount: target.pressureQuestionCount ?? 0,
    weaknessCount: target.weaknessCount ?? 0,
    linkedQuestions: toArray(target.linkedQuestions).map(mapQuestion),
  };
}

export function mapResumeQuestionHeatmapDtoToModel(
  dto: ResumeQuestionHeatmapDto,
): ResumeQuestionHeatmapModel {
  return {
    resumeVersionId: toId(dto.resumeVersionId, "resume-version"),
    scope: normalizeScope(dto.scope),
    appliedFilters: mapAppliedFilters(dto.appliedFilters),
    filterSummary: mapFilterSummary(dto.filterSummary),
    summary: {
      totalAnchors: dto.summary?.totalAnchors ?? 0,
      totalLinkedQuestions: dto.summary?.totalLinkedQuestions ?? 0,
      hottestAnchorLabel: dto.summary?.hottestAnchorLabel ?? null,
      mostFollowedUpAnchorLabel: dto.summary?.mostFollowedUpAnchorLabel ?? null,
      weakestAnchorLabel: dto.summary?.weakestAnchorLabel ?? null,
    },
    items: toArray(dto.items).map((item, index) => {
      const anchorType = item.anchorType ?? "unknown";
      const anchorRecordId =
        item.anchorRecordId === null || item.anchorRecordId === undefined
          ? null
          : String(item.anchorRecordId);
      const anchorKey = item.anchorKey ?? null;

      return {
        id: `${anchorType}:${anchorRecordId ?? anchorKey ?? index}`,
        anchorType,
        anchorTypeLabel: formatLabel(anchorType),
        anchorRecordId,
        anchorKey,
        label: item.label ?? "Resume anchor",
        snippet: item.snippet ?? null,
        heatScoreLabel: `${Math.round(item.heatScore ?? 0)}`,
        normalizedHeatLevel: (item.normalizedHeatLevel ?? "low").toLowerCase(),
        heatTone: getHeatTone(item.normalizedHeatLevel),
        directQuestionCount: item.directQuestionCount ?? 0,
        followUpCount: item.followUpCount ?? 0,
        distinctInterviewCount: item.distinctInterviewCount ?? 0,
        pressureQuestionCount: item.pressureQuestionCount ?? 0,
        weaknessCount: item.weaknessCount ?? 0,
        recentQuestionAt: item.recentQuestionAt ?? null,
        recentQuestionAtLabel: formatApiDate(item.recentQuestionAt),
        overlayTargets: toArray(item.overlayTargets).map(mapOverlayTarget),
        linkedQuestions: toArray(item.linkedQuestions).map(mapQuestion),
      };
    }),
  };
}

export function mapResumeQuestionHeatmapOverlayTargetListDtoToModel(
  dto: ResumeQuestionHeatmapOverlayTargetListDto,
): ResumeQuestionHeatmapOverlayTargetListModel {
  return {
    resumeVersionId: toId(dto.resumeVersionId, "resume-version"),
    scope: normalizeScope(dto.scope),
    appliedFilters: mapAppliedFilters(dto.appliedFilters),
    filterSummary: mapFilterSummary(dto.filterSummary),
    items: toArray(dto.items).map(mapOverlayTarget),
  };
}

export function mapResumeQuestionHeatmapLinkDtoToModel(
  dto: ResumeQuestionHeatmapLinkDto,
): ResumeQuestionHeatmapLinkModel {
  const overlayTargetType = normalizeTargetType(dto.overlayTargetType);

  return {
    id: toId(dto.id, "manual-link"),
    resumeVersionId: toId(dto.resumeVersionId, "resume-version"),
    interviewRecordQuestionId: toId(dto.interviewRecordQuestionId, "interview-question"),
    anchorType: dto.anchorType ?? "unknown",
    anchorTypeLabel: formatLabel(dto.anchorType),
    anchorRecordId:
      dto.anchorRecordId === null || dto.anchorRecordId === undefined
        ? null
        : String(dto.anchorRecordId),
    anchorKey: dto.anchorKey ?? null,
    overlayTargetType,
    overlayTargetTypeLabel: overlayTargetType ? formatLabel(overlayTargetType) : null,
    overlayFieldPath: dto.overlayFieldPath ?? null,
    overlaySentenceIndex: dto.overlaySentenceIndex ?? null,
    overlayTextSnippet: dto.overlayTextSnippet ?? null,
    linkSource: dto.linkSource ?? "manual",
    linkSourceLabel: formatLabel(dto.linkSource),
    confidenceScore: dto.confidenceScore ?? null,
    confidenceLabel:
      dto.confidenceScore === null || dto.confidenceScore === undefined
        ? null
        : `${Math.round(dto.confidenceScore * 100)}%`,
    active: dto.active ?? true,
  };
}
