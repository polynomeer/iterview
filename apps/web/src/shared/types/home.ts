export type HomeQuestionCardDto = {
  dailyCardId?: string | number | null;
  questionId?: string | number | null;
  title: string;
  difficulty?: string | null;
  cardDate?: string | null;
  cardType?: string | null;
  status?: string | null;
};

export type LearningMaterialDto = {
  id: string | number;
  title?: string | null;
  materialType?: string | null;
  contentUrl?: string | null;
  sourceName?: string | null;
};

export type SummaryStatDto = {
  dailyQuestionCount?: number | null;
  retryQuestionCount?: number | null;
  pendingReviewCount?: number | null;
  archivedQuestionCount?: number | null;
};

export type SkillRadarPreviewItemDto = {
  categoryCode?: string | null;
  score?: number | null;
  gapScore?: number | null;
};

export type SkillGapPreviewItemDto = {
  categoryCode?: string | null;
  label?: string | null;
  gapScore?: number | null;
};

export type ResumeRiskPreviewItemDto = {
  questionId?: string | number | null;
  title?: string | null;
  severity?: string | null;
};

export type HomeResponseDto = {
  todayQuestion?: HomeQuestionCardDto | null;
  retryQuestions?: Array<{
    reviewQueueId?: string | number | null;
    questionId?: string | number | null;
    title?: string | null;
    difficulty?: string | null;
    priority?: number | null;
    scheduledFor?: string | null;
  }> | null;
  learningMaterials?: LearningMaterialDto[] | null;
  summaryStats?: SummaryStatDto | null;
  skillRadarPreview?: SkillRadarPreviewItemDto[] | null;
  weakSkillHighlights?: SkillGapPreviewItemDto[] | null;
  resumeRiskPreview?: ResumeRiskPreviewItemDto[] | null;
};
