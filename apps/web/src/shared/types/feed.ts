export type FeedQuestionItemDto = {
  id: string;
  title: string;
  category?: string | null;
  difficulty?: string | null;
  companies?: string[] | null;
  tags?: string[] | null;
  userProgressSummary?: {
    attemptsCount?: number | null;
    bestScore?: number | null;
    progressStatus?: string | null;
  } | null;
};

export type FeedSectionDto = {
  title?: string | null;
  items?: FeedQuestionItemDto[] | null;
};

export type FeedResponseDto = {
  popular?: FeedSectionDto | null;
  trending?: FeedSectionDto | null;
  companyRelated?: FeedSectionDto | null;
};
