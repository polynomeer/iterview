import type {
  ArchiveQueryParams,
  ArchiveResponseDto,
} from "../../shared/types/archive";
import { toArray } from "../../shared/lib/collection";
import { formatApiDateTime } from "../../shared/lib/date";

export type ArchiveItemModel = {
  id: string;
  questionId: string;
  questionTitle: string;
  summary: string;
  difficultyLabel: string;
  archivedAtLabel: string | null;
  totalAttemptCountLabel: string;
  bestScoreLabel: string | null;
  archivedStatusLabel: string;
  sourceType: string | null;
  sourceLabel: string | null;
  sourceBadgeLabel: string | null;
  sourceSessionId: string | null;
  sourceSessionQuestionId: string | null;
  sourceInterviewRecordId: string | null;
  sourceInterviewQuestionId: string | null;
  isFollowUp: boolean;
};

export type ArchiveFilterOptionModel = {
  id: string;
  label: string;
};

export type ArchiveFiltersModel = {
  categories: ArchiveFilterOptionModel[];
  companies: ArchiveFilterOptionModel[];
  tags: ArchiveFilterOptionModel[];
};

export type ArchiveListModel = {
  items: ArchiveItemModel[];
  filters: ArchiveFiltersModel;
};

export type ArchiveFilterState = {
  category: string;
  company: string;
  tag: string;
  sourceInterviewRecordId: string;
  sourceInterviewQuestionId: string;
};

function mapArchiveSourceBadge(sourceType?: string | null) {
  switch (sourceType) {
    case "practice":
      return "Practice";
    case "interview":
      return "Interview";
    case "real_interview":
      return "Real Interview";
    default:
      return sourceType ?? null;
  }
}

export function mapArchiveResponseDtoToModel(response: ArchiveResponseDto): ArchiveListModel {
  const items = toArray(response).map((item) => ({
    id:
      item.sourceSessionQuestionId === null || item.sourceSessionQuestionId === undefined
        ? String(item.questionId ?? "")
        : String(item.sourceSessionQuestionId),
    questionId:
      item.questionId === null || item.questionId === undefined ? "" : String(item.questionId),
    questionTitle: item.title ?? "Archived question",
    summary: item.sourceLabel ?? "Review the archived question details and score history.",
    difficultyLabel: item.difficulty ?? "General",
    archivedAtLabel: formatApiDateTime(item.archivedAt),
    totalAttemptCountLabel: `${item.totalAttemptCount ?? 0} attempts`,
    bestScoreLabel:
      item.bestScore === null || item.bestScore === undefined ? null : `Best score ${Math.round(item.bestScore)}`,
    archivedStatusLabel: "Archived",
    sourceType: item.sourceType ?? null,
    sourceLabel: item.sourceLabel ?? null,
    sourceBadgeLabel: mapArchiveSourceBadge(item.sourceType),
    sourceSessionId:
      item.sourceSessionId === null || item.sourceSessionId === undefined
        ? null
        : String(item.sourceSessionId),
    sourceSessionQuestionId:
      item.sourceSessionQuestionId === null || item.sourceSessionQuestionId === undefined
        ? null
        : String(item.sourceSessionQuestionId),
    sourceInterviewRecordId:
      item.sourceInterviewRecordId === null || item.sourceInterviewRecordId === undefined
        ? null
        : String(item.sourceInterviewRecordId),
    sourceInterviewQuestionId:
      item.sourceInterviewQuestionId === null || item.sourceInterviewQuestionId === undefined
        ? null
        : String(item.sourceInterviewQuestionId),
    isFollowUp: item.isFollowUp ?? false,
  }));

  return {
    items,
    filters: {
      categories: [],
      companies: [],
      tags: [],
    },
  };
}

export function normalizeArchiveFilterState(params: ArchiveQueryParams): ArchiveFilterState {
  return {
    category: params.category ?? "",
    company: params.company ?? "",
    tag: params.tag ?? "",
    sourceInterviewRecordId: params.sourceInterviewRecordId ?? "",
    sourceInterviewQuestionId: params.sourceInterviewQuestionId ?? "",
  };
}
