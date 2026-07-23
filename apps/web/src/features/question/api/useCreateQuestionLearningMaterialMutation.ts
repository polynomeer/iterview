import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  mapLearningMaterial,
  type QuestionDetailModel,
} from "../../../entities/question/model";
import { createQuestionLearningMaterialRequest } from "../../../shared/api/questionApi";
import { queryKeys } from "../../../shared/api/queryKeys";
import type {
  CreateQuestionLearningMaterialRequest,
  LearningMaterialDto,
} from "../../../shared/types/question";

type CreateQuestionLearningMaterialInput = {
  questionId: string;
  body: CreateQuestionLearningMaterialRequest;
};

export function useCreateQuestionLearningMaterialMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ questionId, body }: CreateQuestionLearningMaterialInput) =>
      createQuestionLearningMaterialRequest(questionId, body),
    onSuccess: async (createdMaterial, { questionId }) => {
      queryClient.setQueryData<LearningMaterialDto[] | undefined>(
        queryKeys.questions.learningMaterials(questionId),
        (current) => [...(current ?? []), createdMaterial],
      );

      queryClient.setQueryData<QuestionDetailModel | null | undefined>(
        queryKeys.questions.detail(questionId),
        (current) => {
          if (!current) {
            return current;
          }

          const nextMaterial = mapLearningMaterial(createdMaterial, current.learningMaterials.length);

          return {
            ...current,
            learningMaterials: [...current.learningMaterials, nextMaterial].sort(
              (left, right) => left.displayOrder - right.displayOrder,
            ),
          };
        },
      );

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.questions.detail(questionId) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.questions.learningMaterials(questionId) }),
      ]);
    },
  });
}
