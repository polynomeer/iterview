export const apiEndpoints = {
  home: {
    root: "/api/home",
  },
  questions: {
    list: "/api/questions",
    detail: (questionId: string) => `/api/questions/${questionId}`,
    referenceAnswers: (questionId: string) => `/api/questions/${questionId}/reference-answers`,
    learningMaterials: (questionId: string) => `/api/questions/${questionId}/learning-materials`,
    tree: (questionId: string) => `/api/questions/${questionId}/tree`,
    recommendedFollowups: (questionId: string) =>
      `/api/questions/${questionId}/recommended-followups`,
    resumeBased: "/api/questions/resume-based",
    answers: (questionId: string) => `/api/questions/${questionId}/answers`,
  },
  answerAttempts: {
    detail: (answerAttemptId: string) => `/api/answer-attempts/${answerAttemptId}`,
    analysis: (answerAttemptId: string) => `/api/answer-attempts/${answerAttemptId}/analysis`,
  },
  archive: {
    root: "/api/archive",
  },
  reviewQueue: {
    root: "/api/review-queue",
    skip: (queueItemId: string) => `/api/review-queue/${queueItemId}/skip`,
    done: (queueItemId: string) => `/api/review-queue/${queueItemId}/done`,
  },
  feed: {
    root: "/api/feed",
  },
  auth: {
    signup: "/api/auth/signup",
    login: "/api/auth/login",
  },
  users: {
    currentUser: "/api/me",
    profile: "/api/me/profile",
    profileImage: "/api/me/profile-image",
    settings: "/api/me/settings",
    targetCompanies: "/api/me/target-companies",
    jobRoles: "/api/job-roles",
  },
  resumes: {
    root: "/api/resumes",
    latest: "/api/resumes/latest",
    versions: (resumeId: string) => `/api/resumes/${resumeId}/versions`,
    uploadVersion: (resumeId: string) => `/api/resumes/${resumeId}/versions/upload`,
  },
  jobPostings: {
    root: "/api/job-postings",
    detail: (jobPostingId: string) => `/api/job-postings/${jobPostingId}`,
  },
  resumeVersions: {
    detail: (versionId: string) => `/api/resume-versions/${versionId}`,
    extraction: (versionId: string) => `/api/resume-versions/${versionId}/extraction`,
    reExtract: (versionId: string) => `/api/resume-versions/${versionId}/re-extract`,
    file: (versionId: string) => `/api/resume-versions/${versionId}/file`,
    questionHeatmap: (versionId: string) => `/api/resume-versions/${versionId}/question-heatmap`,
    questionHeatmapOverlayTargets: (versionId: string) =>
      `/api/resume-versions/${versionId}/question-heatmap/overlay-targets`,
    questionHeatmapLinks: (versionId: string) =>
      `/api/resume-versions/${versionId}/question-heatmap/links`,
    questionHeatmapLink: (versionId: string, linkId: string) =>
      `/api/resume-versions/${versionId}/question-heatmap/links/${linkId}`,
    editor: (versionId: string) => `/api/resume-versions/${versionId}/editor`,
    editorDocument: (versionId: string) => `/api/resume-versions/${versionId}/editor/document`,
    editorDocumentOperations: (versionId: string) =>
      `/api/resume-versions/${versionId}/editor/document/operations`,
    editorImportMarkdown: (versionId: string) =>
      `/api/resume-versions/${versionId}/editor/import-markdown`,
    editorComments: (versionId: string) => `/api/resume-versions/${versionId}/editor/comments`,
    editorComment: (versionId: string, commentId: string) =>
      `/api/resume-versions/${versionId}/editor/comments/${commentId}`,
    editorCommentReplies: (versionId: string, commentId: string) =>
      `/api/resume-versions/${versionId}/editor/comments/${commentId}/replies`,
    editorPresence: (versionId: string) => `/api/resume-versions/${versionId}/editor/presence`,
    editorQuestionCards: (versionId: string) =>
      `/api/resume-versions/${versionId}/editor/question-cards`,
    editorQuestionCard: (versionId: string, cardId: string) =>
      `/api/resume-versions/${versionId}/editor/question-cards/${cardId}`,
    editorAutoQuestionSuggestions: (versionId: string) =>
      `/api/resume-versions/${versionId}/editor/auto-question-suggestions`,
    editorRewriteSuggestions: (versionId: string) =>
      `/api/resume-versions/${versionId}/editor/rewrite-suggestions`,
    editorPrintPreview: (versionId: string) =>
      `/api/resume-versions/${versionId}/editor/print-preview`,
    editorRevisions: (versionId: string) =>
      `/api/resume-versions/${versionId}/editor/revisions`,
    editorRevision: (versionId: string, revisionId: string) =>
      `/api/resume-versions/${versionId}/editor/revisions/${revisionId}`,
    editorTrackedChanges: (versionId: string) =>
      `/api/resume-versions/${versionId}/editor/tracked-changes`,
    editorMergePreview: (versionId: string) =>
      `/api/resume-versions/${versionId}/editor/merge-preview`,
    profile: (versionId: string) => `/api/resume-versions/${versionId}/profile`,
    contacts: (versionId: string) => `/api/resume-versions/${versionId}/contacts`,
    competencies: (versionId: string) => `/api/resume-versions/${versionId}/competencies`,
    activate: (versionId: string) => `/api/resume-versions/${versionId}/activate`,
    skills: (versionId: string) => `/api/resume-versions/${versionId}/skills`,
    experiences: (versionId: string) => `/api/resume-versions/${versionId}/experiences`,
    projects: (versionId: string) => `/api/resume-versions/${versionId}/projects`,
    achievements: (versionId: string) => `/api/resume-versions/${versionId}/achievements`,
    education: (versionId: string) => `/api/resume-versions/${versionId}/education`,
    certifications: (versionId: string) => `/api/resume-versions/${versionId}/certifications`,
    awards: (versionId: string) => `/api/resume-versions/${versionId}/awards`,
    risks: (versionId: string) => `/api/resume-versions/${versionId}/risks`,
    analyses: (versionId: string) => `/api/resume-versions/${versionId}/analyses`,
    analysisDetail: (versionId: string, analysisId: string) =>
      `/api/resume-versions/${versionId}/analyses/${analysisId}`,
    analysisSuggestion: (versionId: string, analysisId: string, suggestionId: string) =>
      `/api/resume-versions/${versionId}/analyses/${analysisId}/suggestions/${suggestionId}`,
    analysisExports: (versionId: string, analysisId: string) =>
      `/api/resume-versions/${versionId}/analyses/${analysisId}/exports`,
    analysisExportFile: (versionId: string, analysisId: string, exportId: string) =>
      `/api/resume-versions/${versionId}/analyses/${analysisId}/exports/${exportId}/file`,
  },
  skills: {
    radar: "/api/skills/radar",
    gaps: "/api/skills/gaps",
    progress: "/api/skills/progress",
  },
  interviewSessions: {
    root: "/api/interview-sessions",
    detail: (sessionId: string) => `/api/interview-sessions/${sessionId}`,
    coverage: (sessionId: string) => `/api/interview-sessions/${sessionId}/coverage`,
    resumeMap: (sessionId: string) => `/api/interview-sessions/${sessionId}/resume-map`,
    answers: (sessionId: string) => `/api/interview-sessions/${sessionId}/answers`,
    skipQuestion: (sessionId: string) => `/api/interview-sessions/${sessionId}/skip-question`,
    nextQuestion: (sessionId: string) => `/api/interview-sessions/${sessionId}/next-question`,
  },
  interviewRecords: {
    root: "/api/interview-records",
    detail: (recordId: string) => `/api/interview-records/${recordId}`,
    audio: (recordId: string) => `/api/interview-records/${recordId}/audio`,
    transcript: (recordId: string) => `/api/interview-records/${recordId}/transcript`,
    retryTranscription: (recordId: string) =>
      `/api/interview-records/${recordId}/retry-transcription`,
    transcriptSegment: (recordId: string, segmentId: string) =>
      `/api/interview-records/${recordId}/transcript/segments/${segmentId}`,
    questions: (recordId: string) => `/api/interview-records/${recordId}/questions`,
    analysis: (recordId: string) => `/api/interview-records/${recordId}/analysis`,
    interviewerProfile: (recordId: string) =>
      `/api/interview-records/${recordId}/interviewer-profile`,
    review: (recordId: string) => `/api/interview-records/${recordId}/review`,
    confirm: (recordId: string) => `/api/interview-records/${recordId}/confirm`,
  },
} as const;
