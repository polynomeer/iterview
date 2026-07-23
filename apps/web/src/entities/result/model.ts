import type { AnswerAnalysisDto, AnswerAttemptDetailResponseDto } from "../../shared/types/result";
import { toArray } from "../../shared/lib/collection";
import { formatApiDateTime } from "../../shared/lib/date";

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
    questionTitle: questionTitle ?? "Interview question",
    totalScore: `${score.totalScore ?? "-"}`,
    evaluationResult: score.evaluationResult ?? "Pending",
    dimensions: [
      { id: "structure", label: "Structure", value: `${score.structureScore ?? "-"}` },
      { id: "specificity", label: "Specificity", value: `${score.specificityScore ?? "-"}` },
      {
        id: "technicalAccuracy",
        label: "Technical accuracy",
        value: `${score.technicalAccuracyScore ?? "-"}`,
      },
      { id: "roleFit", label: "Role fit", value: `${score.roleFitScore ?? "-"}` },
      { id: "companyFit", label: "Company fit", value: `${score.companyFitScore ?? "-"}` },
      { id: "communication", label: "Communication", value: `${score.communicationScore ?? "-"}` },
    ],
    feedbackItems: toArray(response.feedback).map((item) => ({
      id: String(item.id),
      title: item.title ?? "Feedback",
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
          sourceType: resolvedAnalysis.modelAnswer.sourceType ?? "generated",
          contentLocale: resolvedAnalysis.modelAnswer.contentLocale ?? null,
          llmModel: resolvedAnalysis.modelAnswer.llmModel ?? null,
        }
      : null,
    progressStatusLabel: response.progressSummary?.currentStatus ?? null,
    archiveDecisionLabel:
      response.progressSummary?.masteryLevel ? `Mastery ${response.progressSummary.masteryLevel}` : null,
    nextReviewLabel: formatApiDateTime(response.progressSummary?.nextReviewAt),
    skillImpact: [
      {
        id: "depth",
        label: "Depth",
        deltaLabel: `${resolvedAnalysis?.depthScore ?? "-"}`,
        scoreLabel: resolvedAnalysis?.strengthSummary ?? undefined,
      },
      {
        id: "clarity",
        label: "Clarity",
        deltaLabel: `${resolvedAnalysis?.clarityScore ?? "-"}`,
        scoreLabel: resolvedAnalysis?.recommendedNextStep ?? undefined,
      },
      {
        id: "accuracy",
        label: "Accuracy",
        deltaLabel: `${resolvedAnalysis?.accuracyScore ?? "-"}`,
        scoreLabel:
          resolvedAnalysis?.createdAt ? `Analyzed ${formatApiDateTime(resolvedAnalysis.createdAt)}` : undefined,
      },
    ],
    weakPatterns: [
      resolvedAnalysis?.weaknessSummary
        ? {
            id: "weakness-summary",
            title: "Primary weakness",
            severityLabel: "Needs work",
            description: resolvedAnalysis.weaknessSummary,
          }
        : null,
      resolvedAnalysis?.recommendedNextStep
        ? {
            id: "next-step",
            title: "Recommended next step",
            severityLabel: "Next action",
            description: resolvedAnalysis.recommendedNextStep,
          }
        : null,
    ].filter((item): item is ResultAnalysisModel["weakPatterns"][number] => item !== null),
    followUpRecommendations: followUpRecommendations ?? [],
  };
}
