import type { AnswerAnalysisDto, AnswerAttemptDetailResponseDto } from "../../shared/types/result";
import { toArray } from "../../shared/lib/collection";
import { formatApiDateTime } from "../../shared/lib/date";
import { translate } from "../../shared/i18n";

export type ResultDimensionModel = {
  id:
    | "structure"
    | "specificity"
    | "technicalAccuracy"
    | "roleFit"
    | "companyFit"
    | "communication";
  label: string;
  value: string;
  /** Raw 0-100 score, or null when the evaluator did not score this dimension. */
  score: number | null;
};

export type ResultFeedbackItemModel = {
  id: string;
  title: string;
  description: string;
  tone: "positive" | "neutral" | "improving";
};

export type ResultAnalysisModel = {
  answerAttemptId: string;
  questionId: string;
  questionTitle: string;
  totalScore: string;
  /** Raw total, for tones and deltas; totalScore stays a display string. */
  totalScoreValue: number | null;
  answerText: string | null;
  attemptNumber: number | null;
  evaluationResult: string;
  dimensions: ResultDimensionModel[];
  feedbackItems: ResultFeedbackItemModel[];
  detailedFeedback: string | null;
  strengthSummary: string | null;
  weaknessSummary: string | null;
  recommendedNextStep: string | null;
  narrativeLocale: string | null;
  narrativeModelLabel: string | null;
  strengthPoints: string[];
  improvementPoints: string[];
  missedPoints: string[];
  modelAnswer:
    | {
        text: string;
        sourceType: string;
        contentLocale: string | null;
        llmModel: string | null;
      }
    | null;
  progressStatusLabel: string | null;
  archiveDecisionLabel: string | null;
  nextReviewLabel: string | null;
  skillImpact: Array<{
    id: string;
    label: string;
    deltaLabel: string;
    scoreLabel?: string;
  }>;
  weakPatterns: Array<{
    id: string;
    title: string;
    severityLabel: string;
    description: string;
  }>;
  followUpRecommendations: Array<{
    id: string;
    title: string;
  }>;
};

export function mapAnswerAttemptDetailAndAnalysisToModel(
  response: AnswerAttemptDetailResponseDto,
  analysis: AnswerAnalysisDto | null | undefined,
  questionTitle?: string,
  followUpRecommendations?: Array<{ id: string; title: string }> | null,
): ResultAnalysisModel {
  const score = response.score ?? {};
  const answerAttempt = response.answerAttempt;
  const resolvedAnalysis = response.analysis ?? analysis ?? null;

  return {
    answerAttemptId: answerAttempt?.id === undefined || answerAttempt.id === null ? "" : String(answerAttempt.id),
    questionId:
      answerAttempt?.questionId === undefined || answerAttempt.questionId === null
        ? ""
        : String(answerAttempt.questionId),
    questionTitle: questionTitle ?? translate("resultModel.interviewQuestion"),
    totalScore: `${score.totalScore ?? "-"}`,
    totalScoreValue: score.totalScore ?? null,
    answerText: answerAttempt?.contentText ?? null,
    attemptNumber: answerAttempt?.attemptNo ?? null,
    evaluationResult: score.evaluationResult ?? translate("resultModel.pending"),
    dimensions: [
      { id: "structure", label: translate("resultModel.structure"), value: `${score.structureScore ?? "-"}`, score: score.structureScore ?? null },
      { id: "specificity", label: translate("resultModel.specificity"), value: `${score.specificityScore ?? "-"}`, score: score.specificityScore ?? null },
      {
        id: "technicalAccuracy",
        label: translate("resultModel.technicalAccuracy"),
        value: `${score.technicalAccuracyScore ?? "-"}`,
        score: score.technicalAccuracyScore ?? null,
      },
      { id: "roleFit", label: translate("resultModel.roleFit"), value: `${score.roleFitScore ?? "-"}`, score: score.roleFitScore ?? null },
      { id: "companyFit", label: translate("resultModel.companyFit"), value: `${score.companyFitScore ?? "-"}`, score: score.companyFitScore ?? null },
      { id: "communication", label: translate("resultModel.communication"), value: `${score.communicationScore ?? "-"}`, score: score.communicationScore ?? null },
    ],
    feedbackItems: toArray(response.feedback).map((item) => ({
      id: String(item.id),
      title: item.title ?? translate("resultModel.feedback"),
      description: item.body ?? "",
      tone:
        item.severity === "high" ? "improving" : item.feedbackType === "strength" ? "positive" : "neutral",
    })),
    detailedFeedback: resolvedAnalysis?.detailedFeedback ?? null,
    strengthSummary: resolvedAnalysis?.strengthSummary ?? null,
    weaknessSummary: resolvedAnalysis?.weaknessSummary ?? null,
    recommendedNextStep: resolvedAnalysis?.recommendedNextStep ?? null,
    narrativeLocale: resolvedAnalysis?.contentLocale ?? null,
    narrativeModelLabel: resolvedAnalysis?.llmModel ?? null,
    strengthPoints: toArray(resolvedAnalysis?.strengthPoints).filter(Boolean),
    improvementPoints: toArray(resolvedAnalysis?.improvementPoints).filter(Boolean),
    missedPoints: toArray(resolvedAnalysis?.missedPoints).filter(Boolean),
    modelAnswer: resolvedAnalysis?.modelAnswer?.text
      ? {
          text: resolvedAnalysis.modelAnswer.text,
          sourceType: resolvedAnalysis.modelAnswer.sourceType ?? translate("resultModel.generated"),
          contentLocale: resolvedAnalysis.modelAnswer.contentLocale ?? null,
          llmModel: resolvedAnalysis.modelAnswer.llmModel ?? null,
        }
      : null,
    progressStatusLabel: response.progressSummary?.currentStatus ?? null,
    archiveDecisionLabel:
      response.progressSummary?.masteryLevel
        ? translate("resultModel.mastery", { level: response.progressSummary.masteryLevel })
        : null,
    nextReviewLabel: formatApiDateTime(response.progressSummary?.nextReviewAt),
    skillImpact: [
      {
        id: "depth",
        label: translate("resultModel.depth"),
        deltaLabel: `${resolvedAnalysis?.depthScore ?? "-"}`,
        scoreLabel: resolvedAnalysis?.strengthSummary ?? undefined,
      },
      {
        id: "clarity",
        label: translate("resultModel.clarity"),
        deltaLabel: `${resolvedAnalysis?.clarityScore ?? "-"}`,
        scoreLabel: resolvedAnalysis?.recommendedNextStep ?? undefined,
      },
      {
        id: "accuracy",
        label: translate("resultModel.accuracy"),
        deltaLabel: `${resolvedAnalysis?.accuracyScore ?? "-"}`,
        scoreLabel:
          resolvedAnalysis?.createdAt
            ? translate("resultModel.analyzedAt", { time: String(formatApiDateTime(resolvedAnalysis.createdAt)) })
            : undefined,
      },
    ],
    weakPatterns: [
      resolvedAnalysis?.weaknessSummary
        ? {
            id: "weakness-summary",
            title: translate("resultModel.primaryWeakness"),
            severityLabel: translate("resultModel.needsWork"),
            description: resolvedAnalysis.weaknessSummary,
          }
        : null,
      resolvedAnalysis?.recommendedNextStep
        ? {
            id: "next-step",
            title: translate("resultModel.recommendedNextStep"),
            severityLabel: translate("resultModel.nextAction"),
            description: resolvedAnalysis.recommendedNextStep,
          }
        : null,
    ].filter((item): item is ResultAnalysisModel["weakPatterns"][number] => item !== null),
    followUpRecommendations: followUpRecommendations ?? [],
  };
}
