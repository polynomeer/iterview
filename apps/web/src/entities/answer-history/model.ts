import { toArray } from "../../shared/lib/collection";
import { formatApiDateTime } from "../../shared/lib/date";
import type { QuestionAnswerHistoryResponseDto } from "../../shared/types/answer-history";
import { translate } from "../../shared/i18n";

export type AnswerHistoryItemModel = {
  answerAttemptId: string;
  submittedAtLabel: string;
  totalScore: number | null;
  totalScoreLabel: string | null;
  evaluationResultLabel: string | null;
  progressStatusLabel: string | null;
};

export type AnswerHistoryModel = {
  items: AnswerHistoryItemModel[];
};

export function mapQuestionAnswerHistoryResponseDtoToModel(
  response: QuestionAnswerHistoryResponseDto,
): AnswerHistoryModel {
  return {
    items: toArray(response).map((item) => ({
      answerAttemptId: String(item.id),
      totalScore: item.score?.totalScore ?? null,
      submittedAtLabel: formatApiDateTime(item.submittedAt) ?? translate("modelCommon.recentAttempt"),
      totalScoreLabel:
        item.score?.totalScore !== undefined && item.score.totalScore !== null
          ? translate("modelCommon.scoreValue", { score: item.score.totalScore })
          : null,
      evaluationResultLabel: item.score?.evaluationResult ?? null,
      progressStatusLabel: item.answerMode ?? null,
    })),
  };
}
