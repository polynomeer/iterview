type RoutePathBuilder<TParams extends Record<string, string> | undefined> =
  TParams extends undefined ? () => string : (params: TParams) => string;

export type AppRouteDefinition<TParams extends Record<string, string> | undefined = undefined> = {
  path: string;
  label: string;
  requiresAuth: boolean;
  buildPath: RoutePathBuilder<TParams>;
};

function createStaticRoute(path: string, label: string, requiresAuth = false): AppRouteDefinition {
  return {
    path,
    label,
    requiresAuth,
    buildPath: (() => path) as RoutePathBuilder<undefined>,
  };
}

function createDynamicRoute<TParams extends Record<string, string>>(
  path: string,
  label: string,
  requiresAuth: boolean,
  buildPath: (params: TParams) => string,
): AppRouteDefinition<TParams> {
  return {
    path,
    label,
    requiresAuth,
    buildPath: buildPath as RoutePathBuilder<TParams>,
  };
}

export const routeConfig = {
  home: createStaticRoute("/", "Home"),
  practice: createStaticRoute("/practice", "Practice"),
  skills: createStaticRoute("/skills", "Skills", true),
  reviewQueue: createStaticRoute("/review-queue", "Review Queue", true),
  questionDetail: createDynamicRoute(
    "/questions/:questionId",
    "Question Detail",
    false,
    ({ questionId }) => `/questions/${questionId}`,
  ),
  questionTree: createDynamicRoute(
    "/questions/:questionId/tree",
    "Question Tree",
    false,
    ({ questionId }) => `/questions/${questionId}/tree`,
  ),
  answerEditor: createDynamicRoute(
    "/questions/:questionId/answer",
    "Answer Editor",
    true,
    ({ questionId }) => `/questions/${questionId}/answer`,
  ),
  resultAnalysis: createDynamicRoute(
    "/answer-attempts/:answerAttemptId/result",
    "Result Analysis",
    true,
    ({ answerAttemptId }) => `/answer-attempts/${answerAttemptId}/result`,
  ),
  archive: createStaticRoute("/archive", "Archive", true),
  feed: createStaticRoute("/feed", "Feed"),
  notes: createStaticRoute("/notes", "Notes", true),
  bookmarks: createStaticRoute("/bookmarks", "Bookmarks", true),
  targetCompanies: createStaticRoute("/target-companies", "Target Companies", true),
  profile: createStaticRoute("/profile", "Profile", true),
  resume: createStaticRoute("/profile/resumes", "Resume", true),
  resumeAnalysis: createStaticRoute("/profile/resumes/analysis", "Resume Analysis", true),
  resumeHeatmap: createDynamicRoute(
    "/resume-versions/:versionId/heatmap",
    "Resume Interview Heatmap",
    true,
    ({ versionId }) => `/resume-versions/${versionId}/heatmap`,
  ),
  resumeEditor: createDynamicRoute(
    "/resume-versions/:versionId/editor",
    "Resume Editor",
    true,
    ({ versionId }) => `/resume-versions/${versionId}/editor`,
  ),
  resumeHeatmapAnchor: createDynamicRoute(
    "/resume-versions/:versionId/heatmap/anchors/:anchorType/:anchorId",
    "Resume Heatmap Anchor Detail",
    true,
    ({ versionId, anchorType, anchorId }) =>
      `/resume-versions/${versionId}/heatmap/anchors/${anchorType}/${anchorId}`,
  ),
  resumeTailor: createStaticRoute("/resume-tailor", "Resume Tailor", true),
  resumeTailorJobPostings: createStaticRoute("/resume-tailor/job-postings", "Resume Tailor Job Postings", true),
  resumeTailorAnalysisList: createDynamicRoute(
    "/resume-tailor/resume-versions/:versionId/analyses",
    "Resume Tailor Analyses",
    true,
    ({ versionId }) => `/resume-tailor/resume-versions/${versionId}/analyses`,
  ),
  resumeTailorAnalysisDetail: createDynamicRoute(
    "/resume-tailor/resume-versions/:versionId/analyses/:analysisId",
    "Resume Tailor Analysis Detail",
    true,
    ({ versionId, analysisId }) => `/resume-tailor/resume-versions/${versionId}/analyses/${analysisId}`,
  ),
  interview: createStaticRoute("/interviews", "Interview", true),
  practicalInterviews: createStaticRoute("/practical-interviews", "Practical Interviews", true),
  practicalInterviewUpload: createStaticRoute(
    "/practical-interviews/upload",
    "Upload Practical Interview",
    true,
  ),
  practicalInterviewDetail: createDynamicRoute(
    "/practical-interviews/:recordId",
    "Practical Interview Review",
    true,
    ({ recordId }) => `/practical-interviews/${recordId}`,
  ),
  practicalInterviewTranscript: createDynamicRoute(
    "/practical-interviews/:recordId/transcript",
    "Practical Interview Transcript",
    true,
    ({ recordId }) => `/practical-interviews/${recordId}/transcript`,
  ),
  practicalInterviewQuestion: createDynamicRoute(
    "/practical-interviews/:recordId/questions/:questionId",
    "Practical Interview Question",
    true,
    ({ recordId, questionId }) => `/practical-interviews/${recordId}/questions/${questionId}`,
  ),
  practicalInterviewSimulate: createDynamicRoute(
    "/practical-interviews/:recordId/simulate",
    "Practical Interview Replay",
    true,
    ({ recordId }) => `/practical-interviews/${recordId}/simulate`,
  ),
  interviewSession: createDynamicRoute(
    "/interviews/:sessionId",
    "Interview Session",
    true,
    ({ sessionId }) => `/interviews/${sessionId}`,
  ),
  interviewSessionResult: createDynamicRoute(
    "/interviews/:sessionId/result",
    "Interview Result",
    true,
    ({ sessionId }) => `/interviews/${sessionId}/result`,
  ),
  login: createStaticRoute("/login", "Login"),
  signup: createStaticRoute("/signup", "Sign Up"),
} as const;

export const tabRoutes = [
  routeConfig.home,
  routeConfig.practice,
  routeConfig.archive,
  routeConfig.feed,
  routeConfig.profile,
] as const;

export const secondaryDesktopRoutes = [
  routeConfig.skills,
  routeConfig.interview,
  routeConfig.resumeTailor,
  routeConfig.practicalInterviews,
  routeConfig.resumeAnalysis,
] as const;
