export type SkillRadarCategoryDto = {
  categoryCode?: string | null;
  label?: string | null;
  score?: number | null;
  benchmarkScore?: number | null;
  gapScore?: number | null;
};

export type SkillRadarResponseDto = {
  updatedAt?: string | null;
  categories?: SkillRadarCategoryDto[] | null;
};

export type SkillGapItemDto = {
  categoryCode?: string | null;
  label?: string | null;
  score?: number | null;
  benchmarkScore?: number | null;
  gapScore?: number | null;
};

export type SkillGapResponseDto = SkillGapItemDto[];

export type SkillProgressItemDto = {
  categoryCode?: string | null;
  label?: string | null;
  score?: number | null;
  benchmarkScore?: number | null;
  gapScore?: number | null;
  answeredQuestionCount?: number | null;
  weakQuestionCount?: number | null;
  calculatedAt?: string | null;
};

export type SkillProgressResponseDto = SkillProgressItemDto[];
