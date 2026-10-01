export const queryKeys = {
  home: {
    root: ["home"] as const,
    detail: ["home", "detail"] as const,
  },
  questions: {
    root: ["questions"] as const,
    listRoot: ["questions", "list"] as const,
    list: (params: Record<string, string | number | undefined>) => ["questions", "list", params] as const,
    detailRoot: ["questions", "detail"] as const,
    detail: (questionId: string) => ["questions", "detail", questionId] as const,
    referenceAnswers: (questionId: string) => ["questions", "reference-answers", questionId] as const,
    learningMaterials: (questionId: string) => ["questions", "learning-materials", questionId] as const,
    tree: (questionId: string) => ["questions", "tree", questionId] as const,
    recommendedFollowups: (questionId: string) =>
      ["questions", "recommended-followups", questionId] as const,
    resumeBased: (limit: number) => ["questions", "resume-based", limit] as const,
    answerHistory: (questionId: string) => ["questions", "answer-history", questionId] as const,
    libraryState: (questionId: string) => ["questions", "library-state", questionId] as const,
  },
  library: {
    root: ["library"] as const,
  },
  answerAttempts: {
    root: ["answer-attempts"] as const,
    detail: (answerAttemptId: string) => ["answer-attempts", "detail", answerAttemptId] as const,
    analysis: (answerAttemptId: string) => ["answer-attempts", "analysis", answerAttemptId] as const,
  },
  archive: {
    root: ["archive"] as const,
    list: (params: Record<string, string | number | undefined>) => ["archive", "list", params] as const,
  },
  reviewQueue: {
    root: ["review-queue"] as const,
    list: ["review-queue", "list"] as const,
  },
  feed: {
    root: ["feed"] as const,
    detail: ["feed", "detail"] as const,
  },
  resumes: {
    root: ["resumes"] as const,
    list: ["resumes", "list"] as const,
    latest: ["resumes", "latest"] as const,
    versionDetail: (versionId: string) => ["resumes", "version-detail", versionId] as const,
    extraction: (versionId: string) => ["resumes", "extraction", versionId] as const,
    profile: (versionId: string) => ["resumes", "profile", versionId] as const,
    contacts: (versionId: string) => ["resumes", "contacts", versionId] as const,
    competencies: (versionId: string) => ["resumes", "competencies", versionId] as const,
    analysis: (versionId: string) => ["resumes", "analysis", versionId] as const,
    skills: (versionId: string) => ["resumes", "skills", versionId] as const,
    experiences: (versionId: string) => ["resumes", "experiences", versionId] as const,
    projects: (versionId: string) => ["resumes", "projects", versionId] as const,
    achievements: (versionId: string) => ["resumes", "achievements", versionId] as const,
    education: (versionId: string) => ["resumes", "education", versionId] as const,
    certifications: (versionId: string) => ["resumes", "certifications", versionId] as const,
    awards: (versionId: string) => ["resumes", "awards", versionId] as const,
    risks: (versionId: string) => ["resumes", "risks", versionId] as const,
    heatmapRoot: (versionId: string) => ["resumes", "heatmap", versionId] as const,
    heatmap: (versionId: string, filters: Record<string, string | boolean | undefined>) =>
      ["resumes", "heatmap", versionId, filters] as const,
    heatmapOverlayTargets: (versionId: string, filters: Record<string, string | boolean | undefined>) =>
      ["resumes", "heatmap-overlay-targets", versionId, filters] as const,
    editor: (versionId: string) => ["resumes", "editor", versionId] as const,
    editorPrintPreview: (versionId: string) => ["resumes", "editor-print-preview", versionId] as const,
    editorRevisions: (versionId: string) => ["resumes", "editor-revisions", versionId] as const,
    editorRevision: (versionId: string, revisionId: string) =>
      ["resumes", "editor-revision", versionId, revisionId] as const,
    editorTrackedChanges: (versionId: string, fromRevisionId: string, toRevisionId: string) =>
      ["resumes", "editor-tracked-changes", versionId, fromRevisionId, toRevisionId] as const,
    snapshots: (versionId: string) => ["resumes", "snapshots", versionId] as const,
    resultSections: (versionId: string) => ["resumes", "result-sections", versionId] as const,
    analyses: (versionId: string) => ["resumes", "analyses", versionId] as const,
    analysisDetail: (versionId: string, analysisId: string) =>
      ["resumes", "analysis-detail", versionId, analysisId] as const,
    analysisExports: (versionId: string, analysisId: string) =>
      ["resumes", "analysis-exports", versionId, analysisId] as const,
  },
  jobPostings: {
    root: ["job-postings"] as const,
    list: ["job-postings", "list"] as const,
    detail: (jobPostingId: string) => ["job-postings", "detail", jobPostingId] as const,
  },
  skills: {
    root: ["skills"] as const,
    radar: ["skills", "radar"] as const,
    gaps: ["skills", "gaps"] as const,
    progress: ["skills", "progress"] as const,
  },
  interviewSessions: {
    root: ["interview-sessions"] as const,
    list: ["interview-sessions", "list"] as const,
    detail: (sessionId: string) => ["interview-sessions", "detail", sessionId] as const,
    coverage: (sessionId: string) => ["interview-sessions", "coverage", sessionId] as const,
    resumeMap: (sessionId: string) => ["interview-sessions", "resume-map", sessionId] as const,
  },
  interviewRecords: {
    root: ["interview-records"] as const,
    list: ["interview-records", "list"] as const,
    detail: (recordId: string) => ["interview-records", "detail", recordId] as const,
    transcript: (recordId: string) => ["interview-records", "transcript", recordId] as const,
    questions: (recordId: string) => ["interview-records", "questions", recordId] as const,
    analysis: (recordId: string) => ["interview-records", "analysis", recordId] as const,
    interviewerProfile: (recordId: string) =>
      ["interview-records", "interviewer-profile", recordId] as const,
    review: (recordId: string) => ["interview-records", "review", recordId] as const,
  },
  auth: {
    root: ["auth"] as const,
    currentUser: ["auth", "current-user"] as const,
    jobRoles: ["auth", "job-roles"] as const,
  },
} as const;
