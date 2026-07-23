import type {
  PracticeFilterOptionDto,
  PracticeListQueryParams,
  PracticeListResponse,
  PracticeListResponseDto,
  PracticeQuestionItemDto,
} from "../../shared/types/practice";
import { toArray } from "../../shared/lib/collection";

export type PracticeQuestionItemModel = {
  id: string;
  title: string;
  prompt: string;
  categoryLabel: string;
  companyLabel: string;
  difficultyLabel: string;
  statusLabel: string | null;
  progressSummaryLabel: string | null;
  resumeRelevanceLabel: string | null;
  resumeRelevanceReason: string | null;
  relatedSkillLabels: string[];
};

export type PracticeFilterOptionModel = {
  id: string;
  label: string;
};

export type PracticeFiltersModel = {
  categories: PracticeFilterOptionModel[];
  companies: PracticeFilterOptionModel[];
  difficulties: PracticeFilterOptionModel[];
  statuses: PracticeFilterOptionModel[];
};

export type PracticeListModel = {
  items: PracticeQuestionItemModel[];
  filters: PracticeFiltersModel;
  page: number;
  hasMore: boolean;
};

export type PracticeFilterState = {
  category: string;
  company: string;
  difficulty: string;
  status: string;
  search: string;
};

function mapFilterOptions(options: PracticeFilterOptionDto[] | null | undefined): PracticeFilterOptionModel[] {
  return (options ?? []).map((option) => ({
    id: option.id,
    label: option.label,
  }));
}

function mapProgressSummaryLabel(summary: PracticeQuestionItemDto["userProgressSummary"]): string | null {
  if (!summary) {
    return null;
  }

  const attemptsCount = summary.attemptsCount ?? 0;
  const attempts = `${attemptsCount} attempt${attemptsCount === 1 ? "" : "s"}`;
  const score =
    summary.bestScore !== undefined && summary.bestScore !== null ? `Best ${summary.bestScore}` : "No score yet";
  const status = summary.progressStatus ? ` · ${summary.progressStatus}` : "";

  return `${attempts} · ${score}${status}`;
}

export function mapPracticeListResponseDtoToModel(
  response: PracticeListResponse,
): PracticeListModel {
  const normalizedResponse: PracticeListResponseDto = Array.isArray(response)
    ? { items: response }
    : response;

  return {
    items: toArray(normalizedResponse.items).map((item) => ({
      id: item.id,
      title: item.title,
      prompt: item.prompt,
      categoryLabel: item.category ?? "General",
      companyLabel: item.company ?? "General",
      difficultyLabel: item.difficulty ?? "General",
      statusLabel: item.status ?? null,
      progressSummaryLabel: mapProgressSummaryLabel(item.userProgressSummary),
      resumeRelevanceLabel:
        item.resumeRelevance?.score !== undefined && item.resumeRelevance.score !== null
          ? `${item.resumeRelevance.score}% match`
          : null,
      resumeRelevanceReason: item.resumeRelevance?.reason ?? null,
      relatedSkillLabels: toArray(item.relatedSkillCodes),
    })),
    filters: {
      categories: mapFilterOptions(normalizedResponse.filters?.categories),
      companies: mapFilterOptions(normalizedResponse.filters?.companies),
      difficulties: mapFilterOptions(normalizedResponse.filters?.difficulties),
      statuses: mapFilterOptions(normalizedResponse.filters?.statuses),
    },
    page: normalizedResponse.page ?? 1,
    hasMore: normalizedResponse.hasMore ?? false,
  };
}

export function normalizePracticeFilterState(
  params: PracticeListQueryParams,
): PracticeFilterState {
  return {
    category: params.category ?? "",
    company: params.company ?? "",
    difficulty: params.difficulty ?? "",
    status: params.status ?? "",
    search: params.search ?? "",
  };
}
