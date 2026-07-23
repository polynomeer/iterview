export type DimensionScoresDto = {
  structureScore?: number | null;
  specificityScore?: number | null;
  technicalAccuracyScore?: number | null;
  roleFitScore?: number | null;
  companyFitScore?: number | null;
  communicationScore?: number | null;
};

export type FeedbackItemDto = {
  id: string | number;
  feedbackType?: string | null;
  severity?: string | null;
  title?: string | null;
  body?: string | null;
  displayOrder?: number | null;
};

export type AnswerAttemptDto = {
  id: string | number;
  questionId: string | number;
  resumeVersionId?: string | number | null;
  attemptNo?: number | null;
  answerMode?: string | null;
  contentText?: string | null;
  submittedAt?: string | null;
};

export type AnswerAttemptScoreDto = {
  totalScore?: number | null;
  structureScore?: number | null;
  specificityScore?: number | null;
  technicalAccuracyScore?: number | null;
  roleFitScore?: number | null;
  companyFitScore?: number | null;
  communicationScore?: number | null;
  evaluationResult?: string | null;
};

export type AnswerAttemptProgressDto = {
  currentStatus?: string | null;
  latestScore?: number | null;
  bestScore?: number | null;
  totalAttemptCount?: number | null;
  lastAnsweredAt?: string | null;
  nextReviewAt?: string | null;
  masteryLevel?: string | null;
};

export type AnswerAttemptDetailResponseDto = {
  answerAttempt?: AnswerAttemptDto | null;
  score?: AnswerAttemptScoreDto | null;
  feedback?: FeedbackItemDto[] | null;
  analysis?: AnswerAnalysisDto | null;
  progressSummary?: AnswerAttemptProgressDto | null;
};

export type AnswerModelAnswerDto = {
  sourceType?: string | null;
  contentLocale?: string | null;
  llmModel?: string | null;
  text?: string | null;
};

export type AnswerAnalysisDto = {
  answerAttemptId?: string | number | null;
  overallScore?: number | null;
  depthScore?: number | null;
  clarityScore?: number | null;
  accuracyScore?: number | null;
  exampleScore?: number | null;
  tradeoffScore?: number | null;
  confidenceScore?: number | null;
  strengthSummary?: string | null;
  weaknessSummary?: string | null;
  recommendedNextStep?: string | null;
  detailedFeedback?: string | null;
  strengthPoints?: string[] | null;
  improvementPoints?: string[] | null;
  missedPoints?: string[] | null;
  modelAnswer?: AnswerModelAnswerDto | null;
  llmModel?: string | null;
  contentLocale?: string | null;
  createdAt?: string | null;
};
