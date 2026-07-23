import type { FeedQuestionItemDto, FeedResponseDto } from "../../shared/types/feed";
import { toArray } from "../../shared/lib/collection";

export type FeedQuestionCardModel = {
  id: string;
  title: string;
  categoryLabel: string;
  difficultyLabel: string;
  companyLabels: string[];
  tagLabels: string[];
  progressSummaryLabel: string | null;
};

export type FeedSectionModel = {
  id: "popular" | "trending" | "companyRelated";
  title: string;
  items: FeedQuestionCardModel[];
};

export type FeedModel = {
  sections: FeedSectionModel[];
};

function mapProgressSummaryLabel(
  summary: FeedQuestionItemDto["userProgressSummary"],
): string | null {
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

function mapFeedQuestionItem(item: FeedQuestionItemDto): FeedQuestionCardModel {
  return {
    id: item.id,
    title: item.title,
    categoryLabel: item.category ?? "General",
    difficultyLabel: item.difficulty ?? "General",
    companyLabels: toArray(item.companies),
    tagLabels: toArray(item.tags),
    progressSummaryLabel: mapProgressSummaryLabel(item.userProgressSummary),
  };
}

export function mapFeedResponseDtoToModel(response: FeedResponseDto): FeedModel {
  const sections: FeedSectionModel[] = [];

  if (response.popular) {
    sections.push({
      id: "popular",
      title: response.popular.title ?? "Popular",
      items: toArray(response.popular.items).map(mapFeedQuestionItem),
    });
  }

  if (response.trending) {
    sections.push({
      id: "trending",
      title: response.trending.title ?? "Trending",
      items: toArray(response.trending.items).map(mapFeedQuestionItem),
    });
  }

  if (response.companyRelated) {
    sections.push({
      id: "companyRelated",
      title: response.companyRelated.title ?? "Company related",
      items: toArray(response.companyRelated.items).map(mapFeedQuestionItem),
    });
  }

  return { sections };
}
