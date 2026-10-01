import { matchRoutes } from "react-router-dom";
import { routeConfig } from "../../shared/config/routes";
import type { MessageKey } from "../../shared/i18n/messages";

const HEADER_TITLES: Array<[path: string, titleKey: MessageKey]> = [
  [routeConfig.home.path, "nav.today"],
  [routeConfig.practice.path, "nav.questionList"],
  [routeConfig.questionTree.path, "header.questionTree"],
  [routeConfig.answerEditor.path, "header.answerEditor"],
  [routeConfig.questionDetail.path, "header.questionDetail"],
  [routeConfig.resultAnalysis.path, "header.resultAnalysis"],
  [routeConfig.feed.path, "nav.explore"],
  [routeConfig.skills.path, "nav.skillMap"],
  [routeConfig.reviewQueue.path, "nav.reviewToday"],
  [routeConfig.archive.path, "nav.reviewDone"],
  [routeConfig.settings.path, "nav.settings"],
  [routeConfig.resume.path, "nav.resume"],
  [routeConfig.resumeOverview.path, "nav.resume"],
  [routeConfig.resumeVersions.path, "nav.resumeVersions"],
  [routeConfig.resumeEditor.path, "header.resumeEditor"],
  [routeConfig.resumeDocumentEditor.path, "header.resumeEditor"],
  [`${routeConfig.resumeHeatmap.path}/*`, "header.resumeHeatmap"],
  [`${routeConfig.resumeTailor.path}/*`, "nav.resumeTailor"],
  [routeConfig.resumeTailorAnalysisList.path, "nav.resumeTailor"],
  [routeConfig.resumeTailorAnalysisDetail.path, "nav.resumeTailor"],
  [routeConfig.interviewSessionResult.path, "header.interviewSessionResult"],
  [routeConfig.interviewSession.path, "header.interviewSession"],
  [routeConfig.interview.path, "nav.mockInterview"],
  [`${routeConfig.practicalInterviews.path}/*`, "nav.practicalInterview"],
];

// Ranked by the router's own specificity rules, so static segments win over params.
const TITLE_ROUTES = HEADER_TITLES.map(([path, titleKey]) => ({ path, titleKey }));

export function resolveHeaderTitleKey(pathname: string): MessageKey {
  const [best] = matchRoutes(TITLE_ROUTES, pathname) ?? [];

  return best ? best.route.titleKey : "common.pageNotFoundTitle";
}
