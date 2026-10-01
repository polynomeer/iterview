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
  practice: createStaticRoute("/questions", "Questions"),
  skills: createStaticRoute("/questions/skills", "Skill Map", true),
  reviewQueue: createStaticRoute("/review", "Review", true),
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
    "/attempts/:answerAttemptId",
    "Result Analysis",
    true,
    ({ answerAttemptId }) => `/attempts/${answerAttemptId}`,
  ),
  archive: createStaticRoute("/review/done", "Done", true),
  feed: createStaticRoute("/explore", "Explore"),
  settings: createStaticRoute("/settings", "Settings", true),
  profile: createStaticRoute("/settings/profile", "Profile", true),
  resume: createStaticRoute("/resume", "Resume", true),
  resumeOverview: createDynamicRoute(
    "/resume/:versionId",
    "Resume Overview",
    true,
    ({ versionId }) => `/resume/${versionId}`,
  ),
  resumeVersions: createDynamicRoute(
    "/resume/:versionId/versions",
    "Resume Versions",
    true,
    ({ versionId }) => `/resume/${versionId}/versions`,
  ),
  resumeHeatmap: createDynamicRoute(
    "/resume/:versionId/heatmap",
    "Resume Interview Heatmap",
    true,
    ({ versionId }) => `/resume/${versionId}/heatmap`,
  ),
  resumeEditor: createDynamicRoute(
    "/resume/:versionId/claims",
    "Resume Claims",
    true,
    ({ versionId }) => `/resume/${versionId}/claims`,
  ),
  resumeDocumentEditor: createDynamicRoute(
    "/resume/:versionId/claims/document",
    "Resume Document Editor",
    true,
    ({ versionId }) => `/resume/${versionId}/claims/document`,
  ),
  resumeHeatmapAnchor: createDynamicRoute(
    "/resume/:versionId/heatmap/anchors/:anchorType/:anchorId",
    "Resume Heatmap Anchor Detail",
    true,
    ({ versionId, anchorType, anchorId }) =>
      `/resume/${versionId}/heatmap/anchors/${anchorType}/${anchorId}`,
  ),
  resumeTailor: createStaticRoute("/resume/tailor", "Resume Tailor", true),
  resumeTailorJobPostings: createStaticRoute("/resume/tailor/job-postings", "Resume Tailor Job Postings", true),
  resumeTailorAnalysisList: createDynamicRoute(
    "/resume/:versionId/tailor",
    "Resume Tailor Analyses",
    true,
    ({ versionId }) => `/resume/${versionId}/tailor`,
  ),
  resumeTailorAnalysisDetail: createDynamicRoute(
    "/resume/:versionId/tailor/:analysisId",
    "Resume Tailor Analysis Detail",
    true,
    ({ versionId, analysisId }) => `/resume/${versionId}/tailor/${analysisId}`,
  ),
  interview: createStaticRoute("/interview", "Interview", true),
  practicalInterviews: createStaticRoute("/interview/records", "Practical Interviews", true),
  practicalInterviewUpload: createStaticRoute(
    "/interview/records/upload",
    "Upload Practical Interview",
    true,
  ),
  practicalInterviewDetail: createDynamicRoute(
    "/interview/records/:recordId",
    "Practical Interview Review",
    true,
    ({ recordId }) => `/interview/records/${recordId}`,
  ),
  practicalInterviewTranscript: createDynamicRoute(
    "/interview/records/:recordId/transcript",
    "Practical Interview Transcript",
    true,
    ({ recordId }) => `/interview/records/${recordId}/transcript`,
  ),
  practicalInterviewQuestion: createDynamicRoute(
    "/interview/records/:recordId/questions/:questionId",
    "Practical Interview Question",
    true,
    ({ recordId, questionId }) => `/interview/records/${recordId}/questions/${questionId}`,
  ),
  practicalInterviewSimulate: createDynamicRoute(
    "/interview/records/:recordId/simulate",
    "Practical Interview Replay",
    true,
    ({ recordId }) => `/interview/records/${recordId}/simulate`,
  ),
  interviewSession: createDynamicRoute(
    "/interview/sessions/:sessionId",
    "Interview Session",
    true,
    ({ sessionId }) => `/interview/sessions/${sessionId}`,
  ),
  interviewSessionResult: createDynamicRoute(
    "/interview/sessions/:sessionId/result",
    "Interview Result",
    true,
    ({ sessionId }) => `/interview/sessions/${sessionId}/result`,
  ),
  login: createStaticRoute("/login", "Login"),
  signup: createStaticRoute("/signup", "Sign Up"),
} as const;
