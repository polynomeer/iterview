import type {
  LearningMaterialDto,
  QuestionDetailResponseDto,
  QuestionReferenceAnswerDto,
  RecommendedFollowUpDto,
  ResumeBasedQuestionDto,
  UserProgressSummaryDto,
} from "../../shared/types/question";
import { toArray } from "../../shared/lib/collection";
import { formatApiDateTime } from "../../shared/lib/date";
import { getCurrentAppLocale } from "../../shared/i18n/locale";

export type QuestionDetailModel = {
  id: string;
  title: string;
  body: string;
  category: string;
  difficulty: string;
  tags: string[];
  companies: string[];
  roles: string[];
  relatedSkills: string[];
  learningMaterials: Array<{
    id: string;
    title: string;
    description: string;
    resourceTypeLabel: string;
    sourceLabel: string;
    sourceType: string;
    sourceName: string | null;
    contentText: string | null;
    url?: string;
    contentLocale: string | null;
    isUserGenerated: boolean;
    isOfficial: boolean;
    displayOrder: number;
    difficultyLevel: string | null;
    estimatedMinutes: number | null;
    relationshipType: string | null;
    labelOverride: string | null;
    relevanceScore: number | null;
  }>;
  referenceAnswers: Array<{
    id: string;
    title: string;
    answerText: string;
    answerFormat: string;
    sourceLabel: string;
    sourceType: string;
    contentLocale: string | null;
    isUserGenerated: boolean;
    isOfficial: boolean;
    displayOrder: number;
  }>;
  userProgressSummary: {
    status: string;
    attemptsCount: number;
    bestScoreLabel: string;
    lastReviewedLabel: string;
    nextReviewLabel: string | null;
    masteryLevelLabel: string | null;
  } | null;
  recommendedQuestions: Array<{
    id: string;
    title: string;
    reason?: string;
    metadataLabel?: string;
  }>;
};

export function mapLearningMaterial(material: LearningMaterialDto, index = 0) {
  const isKorean = getCurrentAppLocale() === "ko";
  return {
    id:
      material.id === null || material.id === undefined
        ? `learning-material-${index}`
        : String(material.id),
    title: material.title ?? (isKorean ? "제목 없는 자료" : "Untitled material"),
    description: material.description ?? "",
    resourceTypeLabel: material.materialType ?? (isKorean ? "참고 자료" : "Reference"),
    sourceLabel: material.sourceLabel ?? material.sourceType ?? (isKorean ? "참고 자료" : "Reference"),
    sourceType: material.sourceType ?? (isKorean ? "참고" : "reference"),
    sourceName: material.sourceName ?? null,
    contentText: material.contentText ?? null,
    url: material.contentUrl ?? undefined,
    contentLocale: material.contentLocale ?? null,
    isUserGenerated: material.isUserGenerated ?? false,
    isOfficial: material.isOfficial ?? false,
    displayOrder: material.displayOrder ?? index,
    difficultyLevel: material.difficultyLevel ?? null,
    estimatedMinutes: material.estimatedMinutes ?? null,
    relationshipType: material.relationshipType ?? null,
    labelOverride: material.labelOverride ?? null,
    relevanceScore: material.relevanceScore ?? null,
  };
}

export function mapReferenceAnswer(answer: QuestionReferenceAnswerDto, index: number) {
  const isKorean = getCurrentAppLocale() === "ko";
  return {
    id:
      answer.id === null || answer.id === undefined ? `reference-answer-${index}` : String(answer.id),
    title: answer.title ?? (isKorean ? "큐레이션 답변" : "Curated answer"),
    answerText: answer.answerText ?? (isKorean ? "아직 답변 본문이 없습니다." : "No answer text is available yet."),
    answerFormat: answer.answerFormat ?? (isKorean ? "일반" : "General"),
    sourceLabel: answer.sourceLabel ?? answer.sourceType ?? (isKorean ? "큐레이션" : "Curated"),
    sourceType: answer.sourceType ?? (isKorean ? "큐레이션" : "curated"),
    contentLocale: answer.contentLocale ?? null,
    isUserGenerated: answer.isUserGenerated ?? false,
    isOfficial: answer.isOfficial ?? false,
    displayOrder: answer.displayOrder ?? index,
  };
}

export function mapLearningMaterialsToModel(
  materials: LearningMaterialDto[] | null | undefined,
): QuestionDetailModel["learningMaterials"] {
  return toArray(materials)
    .map((material, index) => mapLearningMaterial(material, index))
    .sort((left, right) => left.displayOrder - right.displayOrder);
}

export function mapReferenceAnswersToModel(
  referenceAnswers: QuestionReferenceAnswerDto[] | null | undefined,
): QuestionDetailModel["referenceAnswers"] {
  return toArray(referenceAnswers)
    .map(mapReferenceAnswer)
    .sort((left, right) => left.displayOrder - right.displayOrder);
}

function mapProgressSummary(
  progress: UserProgressSummaryDto | null | undefined,
): QuestionDetailModel["userProgressSummary"] {
  if (!progress) {
    return null;
  }

  const isKorean = getCurrentAppLocale() === "ko";
  return {
    status: progress.currentStatus ?? (isKorean ? "신규" : "new"),
    attemptsCount: progress.totalAttemptCount ?? progress.attemptsCount ?? 0,
    bestScoreLabel:
      progress.bestScore !== undefined && progress.bestScore !== null ? `${progress.bestScore}` : isKorean ? "아직 점수 없음" : "Not scored yet",
    lastReviewedLabel: formatApiDateTime(progress.lastAnsweredAt) ?? (isKorean ? "아직 복습 없음" : "No review yet"),
    nextReviewLabel: formatApiDateTime(progress.nextReviewAt),
    masteryLevelLabel: progress.masteryLevel ?? null,
  };
}

export function mapRecommendedQuestionsToModel(
  followups: RecommendedFollowUpDto[] | null | undefined,
  resumeBased: ResumeBasedQuestionDto[] | null | undefined,
): QuestionDetailModel["recommendedQuestions"] {
  const isKorean = getCurrentAppLocale() === "ko";
  const followupItems = toArray(followups).map((question) => ({
    id:
      question.questionId === null || question.questionId === undefined
        ? ""
        : String(question.questionId),
    title: question.title ?? (isKorean ? "권장 꼬리질문" : "Recommended follow-up"),
    reason: question.relationshipType ?? (isKorean ? "꼬리질문 경로" : "Follow-up path"),
    metadataLabel: [
      question.difficulty ?? null,
      question.depth !== null && question.depth !== undefined ? isKorean ? `깊이 ${question.depth}` : `Depth ${question.depth}` : null,
      question.nodeStatus ?? null,
    ]
      .filter(Boolean)
      .join(" · "),
  }));

  const resumeBasedItems = toArray(resumeBased).map((question) => ({
    id:
      question.questionId === null || question.questionId === undefined
        ? ""
        : String(question.questionId),
    title: question.title ?? (isKorean ? "이력서 기반 질문" : "Resume-based question"),
    reason:
      question.matchScore === null || question.matchScore === undefined
        ? isKorean
          ? "이력서 기반 추천"
          : "Resume-based recommendation"
        : isKorean
          ? `${Math.round(question.matchScore)}% 이력서 일치`
          : `${Math.round(question.matchScore)}% resume match`,
    metadataLabel: [question.difficulty ?? null, ...(question.matchedSkills ?? [])]
      .filter(Boolean)
      .join(" · "),
  }));

  return [...followupItems, ...resumeBasedItems].filter((item) => item.id.length > 0);
}

export function mapQuestionDetailResponseDtoToModel(
  response: QuestionDetailResponseDto,
): QuestionDetailModel | null {
  if (!response.question) {
    return null;
  }

  const isKorean = getCurrentAppLocale() === "ko";
  return {
    id: String(response.question.id),
    title: response.question.title,
    body: response.question.body,
    category: response.question.categoryName ?? (isKorean ? "일반" : "General"),
    difficulty: response.question.difficulty ?? response.question.difficultyLevel ?? (isKorean ? "일반" : "General"),
    tags: toArray(response.tags).map((tag) => tag.name),
    companies: toArray(response.companies).map((company) => company.name),
    roles: toArray(response.roles).map((role) => role.name),
    relatedSkills: [],
    learningMaterials: mapLearningMaterialsToModel(response.learningMaterials),
    referenceAnswers: mapReferenceAnswersToModel(response.referenceAnswers),
    userProgressSummary: mapProgressSummary(response.userProgressSummary),
    recommendedQuestions: [],
  };
}
