import type { FeedQuestionItemDto, FeedResponseDto } from "../../shared/types/feed";
import { toArray } from "../../shared/lib/collection";
import { getCurrentAppLocale } from "../../shared/i18n/locale";

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

  const isKorean = getCurrentAppLocale() === "ko";
  const attemptsCount = summary.attemptsCount ?? 0;
  const attempts = isKorean ? `시도 ${attemptsCount}회` : `${attemptsCount} attempt${attemptsCount === 1 ? "" : "s"}`;
  const score =
    summary.bestScore !== undefined && summary.bestScore !== null
      ? isKorean
        ? `최고 ${summary.bestScore}`
        : `Best ${summary.bestScore}`
      : isKorean
        ? "아직 점수 없음"
        : "No score yet";
  const status = summary.progressStatus ? ` · ${summary.progressStatus}` : "";

  return `${attempts} · ${score}${status}`;
}

function mapFeedQuestionItem(item: FeedQuestionItemDto): FeedQuestionCardModel {
  const isKorean = getCurrentAppLocale() === "ko";
  return {
    id: item.id,
    title: item.title,
    categoryLabel: item.category ?? (isKorean ? "일반" : "General"),
    difficultyLabel: item.difficulty ?? (isKorean ? "일반" : "General"),
    companyLabels: toArray(item.companies),
    tagLabels: toArray(item.tags),
    progressSummaryLabel: mapProgressSummaryLabel(item.userProgressSummary),
  };
}

export function mapFeedResponseDtoToModel(response: FeedResponseDto): FeedModel {
  const isKorean = getCurrentAppLocale() === "ko";
  const sections: FeedSectionModel[] = [];

  if (response.popular) {
    sections.push({
      id: "popular",
      title: response.popular.title ?? (isKorean ? "인기" : "Popular"),
      items: toArray(response.popular.items).map(mapFeedQuestionItem),
    });
  }

  if (response.trending) {
    sections.push({
      id: "trending",
      title: response.trending.title ?? (isKorean ? "트렌딩" : "Trending"),
      items: toArray(response.trending.items).map(mapFeedQuestionItem),
    });
  }

  if (response.companyRelated) {
    sections.push({
      id: "companyRelated",
      title: response.companyRelated.title ?? (isKorean ? "회사 연관" : "Company related"),
      items: toArray(response.companyRelated.items).map(mapFeedQuestionItem),
    });
  }

  return { sections };
}
