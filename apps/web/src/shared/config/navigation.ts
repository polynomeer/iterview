import { matchRoutes } from "react-router-dom";
import type { IconName } from "../ui/primitives";
import type { MessageKey } from "../i18n/messages";
import { routeConfig } from "./routes";

export type NavSection = {
  labelKey: MessageKey;
  to: string;
  /** Extra route patterns that belong to this section (detail pages, sub-steps). */
  match: string[];
};

export type NavArea = {
  id: "today" | "questions" | "review" | "resume" | "interview" | "settings";
  labelKey: MessageKey;
  icon: IconName;
  to: string;
  sections: NavSection[];
};

const prefix = (path: string) => `${path}/*`;

/**
 * The five primary areas plus settings (docs/09 §4.2, ADR 0074). Sidebar, mobile tab bar,
 * area sub-navigation, header titles, and the command palette all read from this model.
 */
export const PRIMARY_AREAS: NavArea[] = [
  {
    id: "today",
    labelKey: "nav.today",
    icon: "today",
    to: routeConfig.home.buildPath(),
    sections: [],
  },
  {
    id: "questions",
    labelKey: "nav.questions",
    icon: "questions",
    to: routeConfig.practice.buildPath(),
    sections: [
      {
        labelKey: "nav.questionList",
        to: routeConfig.practice.buildPath(),
        match: [routeConfig.practice.path, routeConfig.questionDetail.path, prefix(routeConfig.questionDetail.path), routeConfig.resultAnalysis.path],
      },
      { labelKey: "nav.skillMap", to: routeConfig.skills.buildPath(), match: [routeConfig.skills.path] },
    ],
  },
  {
    id: "review",
    labelKey: "nav.review",
    icon: "review",
    to: routeConfig.reviewQueue.buildPath(),
    sections: [
      { labelKey: "nav.reviewToday", to: routeConfig.reviewQueue.buildPath(), match: [routeConfig.reviewQueue.path] },
      { labelKey: "nav.reviewDone", to: routeConfig.archive.buildPath(), match: [routeConfig.archive.path] },
    ],
  },
  {
    id: "resume",
    labelKey: "nav.resume",
    icon: "resume",
    to: routeConfig.resume.buildPath(),
    sections: [
      {
        labelKey: "nav.resumeVersions",
        to: routeConfig.resume.buildPath(),
        match: [routeConfig.resume.path, routeConfig.resumeEditor.path, prefix(routeConfig.resumeHeatmap.path)],
      },
      { labelKey: "nav.resumeAnalysis", to: routeConfig.resumeAnalysis.buildPath(), match: [routeConfig.resumeAnalysis.path] },
      {
        labelKey: "nav.resumeTailor",
        to: routeConfig.resumeTailor.buildPath(),
        match: [prefix(routeConfig.resumeTailor.path), routeConfig.resumeTailorAnalysisList.path, routeConfig.resumeTailorAnalysisDetail.path],
      },
    ],
  },
  {
    id: "interview",
    labelKey: "nav.interview",
    icon: "interview",
    to: routeConfig.interview.buildPath(),
    sections: [
      { labelKey: "nav.mockInterview", to: routeConfig.interview.buildPath(), match: [routeConfig.interview.path, prefix("/interview/sessions")] },
      {
        labelKey: "nav.practicalInterview",
        to: routeConfig.practicalInterviews.buildPath(),
        match: [prefix(routeConfig.practicalInterviews.path)],
      },
    ],
  },
];

export const SETTINGS_AREA: NavArea = {
  id: "settings",
  labelKey: "nav.settings",
  icon: "settings",
  to: routeConfig.settings.buildPath(),
  sections: [
    { labelKey: "nav.preferences", to: routeConfig.settings.buildPath(), match: [routeConfig.settings.path] },
    { labelKey: "nav.profile", to: routeConfig.profile.buildPath(), match: [routeConfig.profile.path] },
  ],
};

const ALL_AREAS = [...PRIMARY_AREAS, SETTINGS_AREA];

// Rank candidates the way the router does, so /questions/skills beats /questions/:questionId.
const SECTION_ROUTES = ALL_AREAS.flatMap((area) =>
  area.sections.flatMap((section) => section.match.map((path) => ({ path, area, section }))),
);

export function resolveNavLocation(pathname: string) {
  const [best] = matchRoutes(SECTION_ROUTES, pathname) ?? [];
  if (best) {
    return { area: best.route.area, section: best.route.section };
  }

  const today = PRIMARY_AREAS[0];
  return pathname === today.to ? { area: today, section: null } : { area: null, section: null };
}
