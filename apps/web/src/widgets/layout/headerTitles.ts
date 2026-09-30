import { matchPath } from "react-router-dom";
import { routeConfig } from "../../shared/config/routes";
import type { MessageKey } from "../../shared/i18n/messages";

// Ordered from most to least specific so nested routes win over their parents.
const HEADER_TITLES: Array<[path: string, titleKey: MessageKey]> = [
  [routeConfig.home.path, "sidebar.today"],
  [routeConfig.practice.path, "sidebar.questionMap"],
  [routeConfig.questionTree.path, "header.questionTree"],
  [routeConfig.answerEditor.path, "header.answerEditor"],
  [routeConfig.questionDetail.path, "header.questionDetail"],
  [routeConfig.resultAnalysis.path, "header.resultAnalysis"],
  [routeConfig.feed.path, "navigation.feed"],
  [routeConfig.skills.path, "navigation.skills"],
  [routeConfig.reviewQueue.path, "navigation.reviewQueue"],
  [routeConfig.scheduledReviews.path, "sidebar.scheduledReviews"],
  [routeConfig.weakNodes.path, "sidebar.weakNodes"],
  [routeConfig.archive.path, "navigation.archive"],
  [routeConfig.notes.path, "sidebar.notes"],
  [routeConfig.bookmarks.path, "sidebar.bookmarks"],
  [routeConfig.targetCompanies.path, "sidebar.targetCompanies"],
  [routeConfig.settings.path, "header.settings"],
  [routeConfig.profile.path, "navigation.profile"],
  [routeConfig.resumeAnalysis.path, "navigation.resumeAnalysis"],
  [routeConfig.resume.path, "navigation.resume"],
  [routeConfig.resumeEditor.path, "header.resumeEditor"],
  [`${routeConfig.resumeHeatmap.path}/*`, "header.resumeHeatmap"],
  [`${routeConfig.resumeTailor.path}/*`, "navigation.resumeTailor"],
  [routeConfig.interviewSessionResult.path, "header.interviewSessionResult"],
  [routeConfig.interviewSession.path, "header.interviewSession"],
  [routeConfig.interview.path, "navigation.interview"],
  ["/interview/sessions/:sessionId/result", "header.interviewSessionResult"],
  ["/interview/sessions/:sessionId", "header.interviewSession"],
  ["/interview", "navigation.interview"],
  [`${routeConfig.practicalInterviews.path}/*`, "navigation.practicalInterviews"],
];

export function resolveHeaderTitleKey(pathname: string): MessageKey {
  const match = HEADER_TITLES.find(([path]) => matchPath({ path, end: true }, pathname));

  return match ? match[1] : "header.defaultTitle";
}
