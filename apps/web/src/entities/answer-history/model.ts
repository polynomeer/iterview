import { toArray } from "../../shared/lib/collection";
import { formatApiDateTime } from "../../shared/lib/date";
import type { QuestionAnswerHistoryResponseDto } from "../../shared/types/answer-history";

export type AnswerHistoryItemModel = {
  answerAttemptId: string;
  submittedAtLabel: string;
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
      submittedAtLabel: formatApiDateTime(item.submittedAt) ?? "Recent attempt",
      totalScoreLabel:
        item.score?.totalScore !== undefined && item.score.totalScore !== null
          ? `Score ${item.score.totalScore}`
          : null,
      evaluationResultLabel: item.score?.evaluationResult ?? null,
      progressStatusLabel: item.answerMode ?? null,
    })),
  };
}
