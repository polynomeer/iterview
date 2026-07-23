import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  mapReferenceAnswer,
  type QuestionDetailModel,
} from "../../../entities/question/model";
import { createQuestionReferenceAnswerRequest } from "../../../shared/api/questionApi";
import { queryKeys } from "../../../shared/api/queryKeys";
import type {
  CreateQuestionReferenceAnswerRequest,
  QuestionReferenceAnswerDto,
} from "../../../shared/types/question";

type CreateQuestionReferenceAnswerInput = {
  questionId: string;
  body: CreateQuestionReferenceAnswerRequest;
};

export function useCreateQuestionReferenceAnswerMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ questionId, body }: CreateQuestionReferenceAnswerInput) =>
      createQuestionReferenceAnswerRequest(questionId, body),
    onSuccess: async (createdAnswer, { questionId }) => {
      queryClient.setQueryData<QuestionReferenceAnswerDto[] | undefined>(
        queryKeys.questions.referenceAnswers(questionId),
        (current) => [...(current ?? []), createdAnswer],
      );

      queryClient.setQueryData<QuestionDetailModel | null | undefined>(
        queryKeys.questions.detail(questionId),
        (current) => {
          if (!current) {
            return current;
          }

          const nextAnswer = mapReferenceAnswer(createdAnswer, current.referenceAnswers.length);

          return {
            ...current,
            referenceAnswers: [...current.referenceAnswers, nextAnswer].sort(
              (left, right) => left.displayOrder - right.displayOrder,
            ),
          };
        },
      );

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.questions.detail(questionId) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.questions.referenceAnswers(questionId) }),
      ]);
    },
  });
}
