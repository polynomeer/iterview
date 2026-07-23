export type ReviewQueueItemDto = {
  id: string | number;
  questionId: string | number;
  questionTitle: string;
  questionDifficulty?: string | null;
  scheduledFor?: string | null;
  reasonType?: string | null;
  priority?: number | null;
  status?: string | null;
};

export type ReviewQueueResponseDto = ReviewQueueItemDto[];

export type ReviewQueueActionResponseDto = {
  id?: string | number | null;
  status?: string | null;
  updatedAt?: string | null;
};
