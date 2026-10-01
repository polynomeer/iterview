import type { PracticeQuestionItemModel } from "../../entities/practice/model";
import type { ResumeListModel } from "../../entities/resume/model";
import type { ReviewQueueItemModel } from "../../entities/review-queue/model";
import { LIBRARY_AREA, PRIMARY_AREAS, SETTINGS_AREA } from "../../shared/config/navigation";
import { routeConfig } from "../../shared/config/routes";
import type { MessageKey } from "../../shared/i18n/messages";

export type CommandPaletteItem = {
  id: string;
  title: string;
  subtitle: string;
  section: string;
  to: string;
  /** Local items are filtered in the browser; question results arrive already filtered by the API. */
  searchText?: string;
};

type Translate = (key: MessageKey) => string;

export function buildNavigationItems(t: Translate): CommandPaletteItem[] {
  const section = t("commandPalette.sectionNavigation");

  return [...PRIMARY_AREAS, LIBRARY_AREA, SETTINGS_AREA].flatMap((area) => {
    const areaLabel = t(area.labelKey);
    const destinations = area.sections.length > 0 ? area.sections : [{ labelKey: area.labelKey, to: area.to }];

    return destinations.map((destination) => {
      const title = t(destination.labelKey);
      return {
        id: `nav:${destination.to}`,
        title,
        subtitle: title === areaLabel ? "" : areaLabel,
        section,
        to: destination.to,
        searchText: `${title} ${areaLabel}`,
      };
    });
  });
}

export function buildReviewItems(items: ReviewQueueItemModel[], t: Translate): CommandPaletteItem[] {
  return items.slice(0, 5).map((item) => ({
    id: `review:${item.id}`,
    title: item.questionTitle,
    subtitle: [t("commandPalette.answerAgain"), item.reasonTypeLabel].filter(Boolean).join(" · "),
    section: t("commandPalette.sectionReview"),
    to: routeConfig.answerEditor.buildPath({ questionId: item.questionId }),
    searchText: `${item.questionTitle} ${item.relatedSkillLabels.join(" ")}`,
  }));
}

export function buildResumeItems(resumes: ResumeListModel | undefined, t: Translate): CommandPaletteItem[] {
  const resume = resumes?.items[0];
  const version = resume?.versions.find((candidate) => candidate.isActive) ?? resume?.versions[0];

  if (!resume || !version) {
    return [];
  }

  const subtitle = `${resume.title} · ${version.versionNumberLabel}`;
  const section = t("commandPalette.sectionResume");

  return [
    {
      id: `resume:${version.id}:claims`,
      title: t("commandPalette.resumeClaims"),
      subtitle,
      section,
      to: routeConfig.resumeEditor.buildPath({ versionId: version.id }),
      searchText: `${t("commandPalette.resumeClaims")} ${subtitle}`,
    },
    {
      id: `resume:${version.id}:heatmap`,
      title: t("commandPalette.resumeHeatmap"),
      subtitle,
      section,
      to: routeConfig.resumeHeatmap.buildPath({ versionId: version.id }),
      searchText: `${t("commandPalette.resumeHeatmap")} ${subtitle}`,
    },
  ];
}

export function buildQuestionItems(items: PracticeQuestionItemModel[], t: Translate): CommandPaletteItem[] {
  return items.slice(0, 8).map((item) => ({
    id: `question:${item.id}`,
    title: item.title,
    subtitle: [item.categoryLabel, item.difficultyLabel].filter(Boolean).join(" · "),
    section: t("commandPalette.sectionQuestions"),
    to: routeConfig.questionDetail.buildPath({ questionId: item.id }),
  }));
}

export function matchesQuery(item: CommandPaletteItem, normalizedQuery: string) {
  return !normalizedQuery || (item.searchText ?? `${item.title} ${item.subtitle}`).toLowerCase().includes(normalizedQuery);
}
