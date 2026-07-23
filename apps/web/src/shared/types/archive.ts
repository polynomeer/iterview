export type ArchiveItemDto = {
  questionId?: string | number | null;
  title?: string | null;
  difficulty?: string | null;
  archivedAt?: string | null;
  bestScore?: number | null;
  totalAttemptCount?: number | null;
  sourceType?: string | null;
  sourceLabel?: string | null;
  sourceSessionId?: string | number | null;
  sourceSessionQuestionId?: string | number | null;
  sourceInterviewRecordId?: string | number | null;
  sourceInterviewQuestionId?: string | number | null;
  isFollowUp?: boolean | null;
};

export type ArchiveFilterOptionDto = {
  id: string;
  label: string;
};

export type ArchiveResponseDto = ArchiveItemDto[];

export type ArchiveQueryParams = {
  category?: string;
  company?: string;
  tag?: string;
  sourceInterviewRecordId?: string;
  sourceInterviewQuestionId?: string;
};
