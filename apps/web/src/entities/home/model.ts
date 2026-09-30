import type { HomeResponseDto } from "../../shared/types/home";
import { toArray } from "../../shared/lib/collection";
import { formatApiDate } from "../../shared/lib/date";

export type QuestionCardStatus = "new" | "retry" | "improving" | "archived";

export type HomeQuestionCardModel = {
  id: string;
  title: string;
  status: QuestionCardStatus;
  /** Raw API codes; screens localize them. */
  cardType: string | null;
  difficulty: string | null;
  scheduledLabel: string | null;
};

export type HomeRetryQuestionModel = {
  id: string;
  title: string;
  difficulty: string | null;
  scheduledLabel: string | null;
};

export type LearningMaterialModel = {
  id: string;
  title: string;
  sourceName: string | null;
  materialType: string | null;
  url?: string;
};

export type HomeSummaryModel = {
  dailyQuestionCount: number;
  retryQuestionCount: number;
  pendingReviewCount: number;
  archivedQuestionCount: number;
};

export type HomeModel = {
  todayQuestion: HomeQuestionCardModel | null;
  retryQuestions: HomeRetryQuestionModel[];
  learningMaterials: LearningMaterialModel[];
  summary: HomeSummaryModel | null;
  skillReadiness: Array<{ code: string; score: number | null }>;
  weakSkills: Array<{ code: string | null; label: string; gapScore: number | null }>;
  resumeRisks: Array<{ id: string; questionId: string | null; title: string; severity: string | null }>;
};

const idOf = (value: string | number | null | undefined) => (value === null || value === undefined ? "" : String(value));

function mapStatus(status: string | null | undefined): QuestionCardStatus {
  return status === "retry" || status === "improving" || status === "archived" ? status : "new";
}

export function mapHomeResponseDtoToModel(response: HomeResponseDto): HomeModel {
  const today = response.todayQuestion ?? null;
  const summary = response.summaryStats ?? null;

  return {
    todayQuestion: today
      ? {
          id: idOf(today.questionId),
          title: today.title,
          status: mapStatus(today.status),
          cardType: today.cardType ?? null,
          difficulty: today.difficulty ?? null,
          scheduledLabel: today.cardDate ? (formatApiDate(today.cardDate) ?? today.cardDate) : null,
        }
      : null,
    retryQuestions: toArray(response.retryQuestions).map((question, index) => ({
      id: idOf(question.questionId) || `retry-${index}`,
      title: question.title ?? "",
      difficulty: question.difficulty ?? null,
      scheduledLabel: question.scheduledFor ? (formatApiDate(question.scheduledFor) ?? question.scheduledFor) : null,
    })),
    learningMaterials: toArray(response.learningMaterials).map((material) => ({
      id: String(material.id),
      title: material.title ?? "",
      sourceName: material.sourceName ?? null,
      materialType: material.materialType ?? null,
      url: material.contentUrl ?? undefined,
    })),
    summary: summary
      ? {
          dailyQuestionCount: summary.dailyQuestionCount ?? 0,
          retryQuestionCount: summary.retryQuestionCount ?? 0,
          pendingReviewCount: summary.pendingReviewCount ?? 0,
          archivedQuestionCount: summary.archivedQuestionCount ?? 0,
        }
      : null,
    skillReadiness: toArray(response.skillRadarPreview)
      .filter((item) => item.categoryCode)
      .map((item) => ({ code: item.categoryCode as string, score: item.score ?? null })),
    weakSkills: toArray(response.weakSkillHighlights).map((item) => ({
      code: item.categoryCode ?? null,
      label: item.label ?? item.categoryCode ?? "",
      gapScore: item.gapScore ?? null,
    })),
    resumeRisks: toArray(response.resumeRiskPreview).map((item, index) => ({
      id: idOf(item.questionId) || `risk-${index}`,
      questionId: item.questionId === null || item.questionId === undefined ? null : String(item.questionId),
      title: item.title ?? "",
      severity: item.severity ?? null,
    })),
  };
}
