import type { HomeResponseDto, LearningMaterialDto, ResumeRiskPreviewItemDto, SkillGapPreviewItemDto, SkillRadarPreviewItemDto, SummaryStatDto } from "../../shared/types/home";
import { toArray } from "../../shared/lib/collection";
import { formatApiDate, formatApiDateTime } from "../../shared/lib/date";

export type QuestionCardStatus = "new" | "retry" | "improving" | "archived";

export type HomeQuestionCardModel = {
  id: string;
  title: string;
  prompt: string;
  status: QuestionCardStatus;
  categoryLabel: string;
  difficultyLabel: string;
};

export type LearningMaterialModel = {
  id: string;
  title: string;
  description: string;
  resourceTypeLabel: string;
  url?: string;
};

export type SummaryStatModel = {
  id: string;
  label: string;
  value: string;
  helperText?: string;
};

export type HomeModel = {
  todayQuestion: HomeQuestionCardModel | null;
  retryQuestions: HomeQuestionCardModel[];
  learningMaterials: LearningMaterialModel[];
  summaryStats: SummaryStatModel[];
  skillRadarPreview: Array<{
    id: string;
    label: string;
    scoreLabel: string;
    helperText?: string;
  }>;
  skillGapPreview: Array<{
    id: string;
    label: string;
    gapScoreLabel: string;
    helperText?: string;
  }>;
  resumeRiskPreview: Array<{
    id: string;
    title: string;
    severityLabel: string;
    description: string;
    relatedSkillLabel?: string;
  }>;
};

function mapQuestionCard(question: HomeResponseDto["todayQuestion"]): HomeQuestionCardModel | null {
  if (!question) {
    return null;
  }

  const status: QuestionCardStatus =
    question.status === "retry" ||
    question.status === "improving" ||
    question.status === "archived"
      ? question.status
      : "new";

  return {
    id:
      question.questionId === null || question.questionId === undefined
        ? ""
        : String(question.questionId),
    title: question.title,
    prompt: question.cardDate ? `Scheduled for ${formatApiDate(question.cardDate) ?? question.cardDate}` : "Daily interview prompt",
    status,
    categoryLabel: question.cardType ?? "daily",
    difficultyLabel: question.difficulty ?? "General",
  };
}

function mapLearningMaterial(material: LearningMaterialDto): LearningMaterialModel {
  return {
    id: String(material.id),
    title: material.title ?? "Untitled material",
    description: material.sourceName ?? "",
    resourceTypeLabel: material.materialType ?? "Reference",
    url: material.contentUrl ?? undefined,
  };
}

function mapSummaryStats(stat: SummaryStatDto | null | undefined): SummaryStatModel[] {
  if (!stat) {
    return [];
  }

  return [
    { id: "daily-question-count", label: "Daily questions", value: String(stat.dailyQuestionCount ?? 0) },
    { id: "retry-question-count", label: "Retry questions", value: String(stat.retryQuestionCount ?? 0) },
    { id: "pending-review-count", label: "Pending reviews", value: String(stat.pendingReviewCount ?? 0) },
    { id: "archived-question-count", label: "Archived", value: String(stat.archivedQuestionCount ?? 0) },
  ];
}

function mapSkillRadarPreviewItem(item: SkillRadarPreviewItemDto, index: number) {
  return {
    id: item.categoryCode ?? `radar-${index}`,
    label: item.categoryCode ?? "Skill",
    scoreLabel: item.score === null || item.score === undefined ? "-" : `${item.score}`,
    helperText:
      item.gapScore === null || item.gapScore === undefined ? undefined : `Gap ${item.gapScore}`,
  };
}

function mapSkillGapPreviewItem(item: SkillGapPreviewItemDto, index: number) {
  return {
    id: item.categoryCode ?? item.label ?? `gap-${index}`,
    label: item.label ?? "Gap",
    gapScoreLabel:
      item.gapScore === null || item.gapScore === undefined ? "-" : `${item.gapScore}`,
    helperText: item.categoryCode ?? undefined,
  };
}

function mapResumeRiskPreviewItem(item: ResumeRiskPreviewItemDto, index: number) {
  return {
    id:
      item.questionId === null || item.questionId === undefined
        ? `risk-${index}`
        : String(item.questionId),
    title: item.title ?? "Resume risk",
    severityLabel: item.severity ?? "Needs review",
    description: "Review this resume-backed defense point before the next interview loop.",
    relatedSkillLabel: undefined,
  };
}

export function mapHomeResponseDtoToModel(response: HomeResponseDto): HomeModel {
  return {
    todayQuestion: mapQuestionCard(response.todayQuestion ?? null),
    retryQuestions: toArray(response.retryQuestions).map((question) => ({
      id:
        question.questionId === null || question.questionId === undefined
          ? ""
          : String(question.questionId),
      title: question.title ?? "Retry question",
      prompt:
        question.scheduledFor
          ? `Scheduled ${formatApiDateTime(question.scheduledFor) ?? question.scheduledFor}`
          : "Queued for review",
      status: "retry",
      categoryLabel:
        question.priority === null || question.priority === undefined
          ? "Priority -"
          : `Priority ${question.priority}`,
      difficultyLabel: question.difficulty ?? "General",
    })),
    learningMaterials: toArray(response.learningMaterials).map(mapLearningMaterial),
    summaryStats: mapSummaryStats(response.summaryStats),
    skillRadarPreview: toArray(response.skillRadarPreview).map(mapSkillRadarPreviewItem),
    skillGapPreview: toArray(response.weakSkillHighlights).map(mapSkillGapPreviewItem),
    resumeRiskPreview: toArray(response.resumeRiskPreview).map(mapResumeRiskPreviewItem),
  };
}
