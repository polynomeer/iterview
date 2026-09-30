import type { FeedQuestionItemDto, FeedResponseDto } from "../../shared/types/feed";
import { toArray } from "../../shared/lib/collection";
import { translate } from "../../shared/i18n";

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
  const attempts = translate(attemptsCount === 1 ? "modelCommon.attemptCountOne" : "modelCommon.attemptCountMany", {
    count: attemptsCount,
  });
  const score =
    summary.bestScore !== undefined && summary.bestScore !== null
      ? translate("modelCommon.bestScoreShort", { score: summary.bestScore })
      : translate("modelCommon.noScoreYet");
  const status = summary.progressStatus ? ` · ${summary.progressStatus}` : "";

  return `${attempts} · ${score}${status}`;
}

function mapFeedQuestionItem(item: FeedQuestionItemDto): FeedQuestionCardModel {
  return {
    id: item.id,
    title: item.title,
    categoryLabel: item.category ?? translate("modelCommon.general"),
    difficultyLabel: item.difficulty ?? translate("modelCommon.general"),
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
      title: response.popular.title ?? translate("questionModel.feedPopular"),
      items: toArray(response.popular.items).map(mapFeedQuestionItem),
    });
  }

  if (response.trending) {
    sections.push({
      id: "trending",
      title: response.trending.title ?? translate("questionModel.feedTrending"),
      items: toArray(response.trending.items).map(mapFeedQuestionItem),
    });
  }

  if (response.companyRelated) {
    sections.push({
      id: "companyRelated",
      title: response.companyRelated.title ?? translate("questionModel.feedCompanyRelated"),
      items: toArray(response.companyRelated.items).map(mapFeedQuestionItem),
    });
  }

  return { sections };
}
