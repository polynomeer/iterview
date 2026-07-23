export type PracticeQuestionStatusDto = "new" | "retry" | "improving" | "archived";

export type PracticeQuestionItemDto = {
  id: string;
  title: string;
  prompt: string;
  category?: string | null;
  company?: string | null;
  difficulty?: string | null;
  status?: PracticeQuestionStatusDto;
  resumeRelevance?: {
    score?: number | null;
    reason?: string | null;
  } | null;
  relatedSkillCodes?: string[] | null;
  userProgressSummary?: {
    attemptsCount?: number | null;
    bestScore?: number | null;
    progressStatus?: string | null;
  } | null;
};

export type PracticeFilterOptionDto = {
  id: string;
  label: string;
};

export type PracticeListResponseDto = {
  items?: PracticeQuestionItemDto[] | null;
  filters?: {
    categories?: PracticeFilterOptionDto[] | null;
    companies?: PracticeFilterOptionDto[] | null;
    difficulties?: PracticeFilterOptionDto[] | null;
    statuses?: PracticeFilterOptionDto[] | null;
  };
  page?: number | null;
  hasMore?: boolean | null;
};

export type PracticeListResponse = PracticeQuestionItemDto[] | PracticeListResponseDto;

export type PracticeListQueryParams = {
  category?: string;
  company?: string;
  difficulty?: string;
  status?: string;
  search?: string;
  page?: number;
};
