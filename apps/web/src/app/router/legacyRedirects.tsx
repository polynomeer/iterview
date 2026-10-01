import { Navigate, useLocation, useParams, type Params, type RouteObject } from "react-router-dom";
import { routeConfig } from "../../shared/config/routes";

type LegacyRedirect = {
  from: string;
  to: (params: Params) => string;
};

const param = (params: Params, name: string) => params[name] ?? "";

/**
 * Pre-2026-10 URLs, kept alive so bookmarks and shared links land on the five-area IA
 * (docs/09 §4.2, ADR 0074). Query strings and hashes are preserved.
 */
export const LEGACY_REDIRECTS: LegacyRedirect[] = [
  { from: "/practice", to: () => routeConfig.practice.buildPath() },
  { from: "/skills", to: () => routeConfig.skills.buildPath() },
  {
    from: "/answer-attempts/:answerAttemptId/result",
    to: (params) => routeConfig.resultAnalysis.buildPath({ answerAttemptId: param(params, "answerAttemptId") }),
  },
  { from: "/review-queue", to: () => routeConfig.reviewQueue.buildPath() },
  { from: "/archive", to: () => routeConfig.archive.buildPath() },
  { from: "/feed", to: () => routeConfig.feed.buildPath() },
  { from: "/profile", to: () => routeConfig.profile.buildPath() },
  { from: "/profile/resumes", to: () => routeConfig.resume.buildPath() },
  { from: "/profile/resumes/analysis", to: () => routeConfig.resume.buildPath() },
  // The analysis page folded into the hub's 개요 tab (Phase 4).
  { from: "/resume/analysis", to: () => routeConfig.resume.buildPath() },
  // Sample-data pages retired in Phase 5 (ADR 0079): their real counterparts live here.
  { from: "/weak-nodes", to: () => routeConfig.reviewQueue.buildPath() },
  { from: "/scheduled-reviews", to: () => routeConfig.reviewQueue.buildPath() },
  { from: "/target-companies", to: () => routeConfig.settings.buildPath() },
  // 보관함 replaced the sample notes and bookmarks pages (ADR 0083).
  { from: "/notes", to: () => routeConfig.library.buildPath() },
  { from: "/bookmarks", to: () => routeConfig.library.buildPath() },
  {
    from: "/resume-versions/:versionId/editor",
    to: (params) => routeConfig.resumeEditor.buildPath({ versionId: param(params, "versionId") }),
  },
  {
    from: "/resume-versions/:versionId/heatmap",
    to: (params) => routeConfig.resumeHeatmap.buildPath({ versionId: param(params, "versionId") }),
  },
  {
    from: "/resume-versions/:versionId/heatmap/anchors/:anchorType/:anchorId",
    to: (params) =>
      routeConfig.resumeHeatmapAnchor.buildPath({
        versionId: param(params, "versionId"),
        anchorType: param(params, "anchorType"),
        anchorId: param(params, "anchorId"),
      }),
  },
  { from: "/resume-tailor", to: () => routeConfig.resumeTailor.buildPath() },
  { from: "/resume-tailor/job-postings", to: () => routeConfig.resumeTailorJobPostings.buildPath() },
  {
    from: "/resume-tailor/resume-versions/:versionId/analyses",
    to: (params) => routeConfig.resumeTailorAnalysisList.buildPath({ versionId: param(params, "versionId") }),
  },
  {
    from: "/resume-tailor/resume-versions/:versionId/analyses/:analysisId",
    to: (params) =>
      routeConfig.resumeTailorAnalysisDetail.buildPath({
        versionId: param(params, "versionId"),
        analysisId: param(params, "analysisId"),
      }),
  },
  { from: "/interviews", to: () => routeConfig.interview.buildPath() },
  {
    from: "/interviews/:sessionId",
    to: (params) => routeConfig.interviewSession.buildPath({ sessionId: param(params, "sessionId") }),
  },
  {
    from: "/interviews/:sessionId/result",
    to: (params) => routeConfig.interviewSessionResult.buildPath({ sessionId: param(params, "sessionId") }),
  },
  { from: "/practical-interviews", to: () => routeConfig.practicalInterviews.buildPath() },
  { from: "/practical-interviews/upload", to: () => routeConfig.practicalInterviewUpload.buildPath() },
  {
    from: "/practical-interviews/:recordId",
    to: (params) => routeConfig.practicalInterviewDetail.buildPath({ recordId: param(params, "recordId") }),
  },
  {
    from: "/practical-interviews/:recordId/transcript",
    to: (params) => routeConfig.practicalInterviewTranscript.buildPath({ recordId: param(params, "recordId") }),
  },
  {
    from: "/practical-interviews/:recordId/questions/:questionId",
    to: (params) =>
      routeConfig.practicalInterviewQuestion.buildPath({
        recordId: param(params, "recordId"),
        questionId: param(params, "questionId"),
      }),
  },
  {
    from: "/practical-interviews/:recordId/simulate",
    to: (params) => routeConfig.practicalInterviewSimulate.buildPath({ recordId: param(params, "recordId") }),
  },
];

function LegacyRedirectElement({ to }: Pick<LegacyRedirect, "to">) {
  const params = useParams();
  const { search, hash } = useLocation();

  return <Navigate replace to={`${to(params)}${search}${hash}`} />;
}

export const legacyRedirectRoutes: RouteObject[] = LEGACY_REDIRECTS.map(({ from, to }) => ({
  path: from,
  element: <LegacyRedirectElement to={to} />,
}));
