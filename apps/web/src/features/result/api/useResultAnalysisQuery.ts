import { useQuery } from "@tanstack/react-query";
import { mapAnswerAttemptDetailAndAnalysisToModel } from "../../../entities/result/model";
import {
  getAnswerAnalysisRequest,
  getAnswerAttemptDetailRequest,
} from "../../../shared/api/resultApi";
import { getQuestionDetailRequest, getRecommendedFollowupsRequest } from "../../../shared/api/questionApi";
import { queryKeys } from "../../../shared/api/queryKeys";
import { toArray } from "../../../shared/lib/collection";
import type { RecommendedFollowUpDto } from "../../../shared/types/question";

export function useResultAnalysisQuery(answerAttemptId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.answerAttempts.detail(answerAttemptId ?? ""),
    queryFn: async ({ signal }) => {
      const detail = await getAnswerAttemptDetailRequest(answerAttemptId ?? "", signal);
      let analysis = detail.analysis ?? null;

      if (!analysis) {
        try {
          analysis = await getAnswerAnalysisRequest(answerAttemptId ?? "", signal);
        } catch {
          analysis = null;
        }
      }

      const questionId =
        detail.answerAttempt?.questionId === null || detail.answerAttempt?.questionId === undefined
          ? null
          : String(detail.answerAttempt.questionId);

      let questionDetail = null;
      let followUps: RecommendedFollowUpDto[] = [];

      if (questionId) {
        [questionDetail, followUps] = await Promise.all([
          getQuestionDetailRequest(questionId, signal),
          getRecommendedFollowupsRequest(questionId, signal),
        ]);
      }

      return mapAnswerAttemptDetailAndAnalysisToModel(
        detail,
        analysis,
        questionDetail?.question?.title ?? undefined,
        toArray(followUps).map((item, index) => ({
          id:
            item.questionId === null || item.questionId === undefined
              ? `follow-up-${index}`
              : String(item.questionId),
          title: item.title ?? "Follow-up recommendation",
        })),
      );
    },
    enabled: Boolean(answerAttemptId),
  });
}
