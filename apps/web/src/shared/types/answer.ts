export type SubmitAnswerRequestDto = {
  resumeVersionId?: string | number | null;
  answerMode: "text";
  contentText: string;
};

export type SubmitAnswerResponseDto = {
  answerAttemptId: string | number;
  scoreSummary?: {
    totalScore?: number | null;
    structureScore?: number | null;
    specificityScore?: number | null;
    technicalAccuracyScore?: number | null;
    roleFitScore?: number | null;
    companyFitScore?: number | null;
    communicationScore?: number | null;
    evaluationResult?: string | null;
  } | null;
  feedback?:
    | Array<{
        id?: string | number | null;
        feedbackType?: string | null;
        severity?: string | null;
        title?: string | null;
        body?: string | null;
        displayOrder?: number | null;
      }>
    | null;
  progressStatus?: string | null;
  nextReviewAt?: string | null;
  archiveDecision?: boolean | null;
};
