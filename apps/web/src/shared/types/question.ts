export type QuestionReferenceAnswerDto = {
  id?: string | number | null;
  title?: string | null;
  answerText?: string | null;
  answerFormat?: string | null;
  sourceType?: string | null;
  sourceLabel?: string | null;
  contentLocale?: string | null;
  isUserGenerated?: boolean | null;
  targetRoleId?: string | number | null;
  companyId?: string | number | null;
  isOfficial?: boolean | null;
  displayOrder?: number | null;
};

export type LearningMaterialDto = {
  id?: string | number | null;
  title?: string | null;
  materialType?: string | null;
  sourceType?: string | null;
  sourceLabel?: string | null;
  description?: string | null;
  contentText?: string | null;
  contentUrl?: string | null;
  sourceName?: string | null;
  contentLocale?: string | null;
  isUserGenerated?: boolean | null;
  difficultyLevel?: string | null;
  estimatedMinutes?: number | null;
  isOfficial?: boolean | null;
  displayOrder?: number | null;
  relationshipType?: string | null;
  labelOverride?: string | null;
  relevanceScore?: number | null;
};

export type CreateQuestionReferenceAnswerRequest = {
  title: string;
  answerText: string;
  answerFormat: string;
};

export type CreateQuestionLearningMaterialRequest = {
  title: string;
  materialType: string;
  description?: string;
  contentText?: string;
  contentUrl?: string;
  sourceName?: string;
  difficultyLevel?: string;
  estimatedMinutes?: number;
  relationshipType?: string;
  labelOverride?: string;
  relevanceScore?: number;
};

export type QuestionTagDto = {
  id: string | number;
  name: string;
};

export type RelatedCompanyDto = {
  id: string | number;
  name: string;
  relevanceScore?: number | null;
  pastFrequent?: boolean | null;
  trendingRecent?: boolean | null;
};

export type UserProgressSummaryDto = {
  currentStatus?: string | null;
  latestScore?: number | null;
  attemptsCount?: number | null;
  totalAttemptCount?: number | null;
  bestScore?: number | null;
  lastAnsweredAt?: string | null;
  nextReviewAt?: string | null;
  masteryLevel?: string | null;
};

export type QuestionDetailDto = {
  id: string | number;
  title: string;
  body: string;
  categoryId?: string | number | null;
  categoryName?: string | null;
  questionType?: string | null;
  difficultyLevel?: string | null;
  qualityStatus?: string | null;
  expectedAnswerSeconds?: number | null;
};

export type QuestionDetailResponseDto = {
  question?: QuestionDetailDto | null;
  tags?: QuestionTagDto[] | null;
  companies?: RelatedCompanyDto[] | null;
  roles?: Array<{ id: string | number; name: string; relevanceScore?: number | null }> | null;
  learningMaterials?: LearningMaterialDto[] | null;
  referenceAnswers?: QuestionReferenceAnswerDto[] | null;
  userProgressSummary?: UserProgressSummaryDto | null;
};

export type RecommendedFollowUpDto = {
  questionId?: string | number | null;
  title?: string | null;
  difficulty?: string | null;
  relationshipType?: string | null;
  depth?: number | null;
  nodeStatus?: string | null;
};

export type ResumeBasedQuestionDto = {
  questionId?: string | number | null;
  title?: string | null;
  difficulty?: string | null;
  matchScore?: number | null;
  matchedSkills?: string[] | null;
};
