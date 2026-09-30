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
import { translate } from "../../shared/i18n";

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
  return {
    id:
      material.id === null || material.id === undefined
        ? `learning-material-${index}`
        : String(material.id),
    title: material.title ?? translate("questionModel.untitledMaterial"),
    description: material.description ?? "",
    resourceTypeLabel: material.materialType ?? translate("questionModel.referenceMaterial"),
    sourceLabel: material.sourceLabel ?? material.sourceType ?? translate("questionModel.referenceMaterial"),
    sourceType: material.sourceType ?? translate("questionModel.referenceSourceType"),
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
  return {
    id:
      answer.id === null || answer.id === undefined ? `reference-answer-${index}` : String(answer.id),
    title: answer.title ?? translate("questionModel.curatedAnswer"),
    answerText: answer.answerText ?? translate("questionModel.noAnswerText"),
    answerFormat: answer.answerFormat ?? translate("modelCommon.general"),
    sourceLabel: answer.sourceLabel ?? answer.sourceType ?? translate("questionModel.curatedLabel"),
    sourceType: answer.sourceType ?? translate("questionModel.curatedSourceType"),
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

  return {
    status: progress.currentStatus ?? translate("questionModel.newStatus"),
    attemptsCount: progress.totalAttemptCount ?? progress.attemptsCount ?? 0,
    bestScoreLabel:
      progress.bestScore !== undefined && progress.bestScore !== null ? `${progress.bestScore}` : translate("questionModel.notScoredYet"),
    lastReviewedLabel: formatApiDateTime(progress.lastAnsweredAt) ?? translate("questionModel.noReviewYet"),
    nextReviewLabel: formatApiDateTime(progress.nextReviewAt),
    masteryLevelLabel: progress.masteryLevel ?? null,
  };
}

export function mapRecommendedQuestionsToModel(
  followups: RecommendedFollowUpDto[] | null | undefined,
  resumeBased: ResumeBasedQuestionDto[] | null | undefined,
): QuestionDetailModel["recommendedQuestions"] {
  const followupItems = toArray(followups).map((question) => ({
    id:
      question.questionId === null || question.questionId === undefined
        ? ""
        : String(question.questionId),
    title: question.title ?? translate("questionModel.recommendedFollowUp"),
    reason: question.relationshipType ?? translate("questionModel.followUpPath"),
    metadataLabel: [
      question.difficulty ?? null,
      question.depth !== null && question.depth !== undefined ? translate("questionModel.depthValue", { depth: question.depth }) : null,
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
    title: question.title ?? translate("questionModel.resumeBasedQuestion"),
    reason:
      question.matchScore === null || question.matchScore === undefined
        ? translate("questionModel.resumeBasedRecommendation")
        : translate("questionModel.resumeMatchPercent", { score: Math.round(question.matchScore) }),
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

  return {
    id: String(response.question.id),
    title: response.question.title,
    body: response.question.body,
    category: response.question.categoryName ?? translate("modelCommon.general"),
    difficulty: response.question.difficulty ?? response.question.difficultyLevel ?? translate("modelCommon.general"),
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
