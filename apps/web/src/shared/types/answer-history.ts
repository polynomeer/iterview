export type QuestionAnswerHistoryItemDto = {
  id: string | number;
  attemptNo?: number | null;
  answerMode?: string | null;
  submittedAt?: string | null;
  score?: {
    totalScore?: number | null;
    evaluationResult?: string | null;
  } | null;
};

export type QuestionAnswerHistoryResponseDto = QuestionAnswerHistoryItemDto[];
