import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createResumeEditorCommentReplyRequest,
  createResumeEditorCommentRequest,
  createResumeEditorQuestionCardRequest,
  createResumeEditorQuestionSuggestionsRequest,
  createResumeEditorRewriteSuggestionsRequest,
  updateResumeEditorCommentRequest,
  updateResumeEditorQuestionCardRequest,
} from "../../../shared/api/resumeEditorApi";
import { queryKeys } from "../../../shared/api/queryKeys";
import type {
  CreateResumeEditorCommentReplyRequestDto,
  CreateResumeEditorCommentRequestDto,
  CreateResumeEditorQuestionCardRequestDto,
  CreateResumeEditorQuestionSuggestionRequestDto,
  CreateResumeEditorRewriteSuggestionRequestDto,
  UpdateResumeEditorCommentRequestDto,
  UpdateResumeEditorQuestionCardRequestDto,
} from "../../../shared/types/resumeEditor";
import {
  mapResumeEditorQuestionCardDtoToModel,
  mapResumeEditorQuestionSuggestionResponseDtoToModel,
  mapResumeEditorRewriteSuggestionResponseDtoToModel,
} from "../../../entities/resume-editor/model";

function invalidateWorkspace(queryClient: ReturnType<typeof useQueryClient>, versionId: string | null) {
  if (!versionId) {
    return Promise.resolve();
  }

  return Promise.all([
    queryClient.invalidateQueries({ queryKey: queryKeys.resumes.editor(versionId) }),
    queryClient.invalidateQueries({ queryKey: queryKeys.resumes.editorRevisions(versionId) }),
  ]);
}

export function useCreateResumeEditorCommentMutation(versionId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateResumeEditorCommentRequestDto) => {
      if (!versionId) {
        throw new Error("Resume version id is required.");
      }

      return createResumeEditorCommentRequest(versionId, payload);
    },
    onSuccess: async () => {
      await invalidateWorkspace(queryClient, versionId);
    },
  });
}

export function useUpdateResumeEditorCommentMutation(versionId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      commentId,
      payload,
    }: {
      commentId: string;
      payload: UpdateResumeEditorCommentRequestDto;
    }) => {
      if (!versionId) {
        throw new Error("Resume version id is required.");
      }

      return updateResumeEditorCommentRequest(versionId, commentId, payload);
    },
    onSuccess: async () => {
      await invalidateWorkspace(queryClient, versionId);
    },
  });
}

export function useCreateResumeEditorCommentReplyMutation(versionId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      commentId,
      payload,
    }: {
      commentId: string;
      payload: CreateResumeEditorCommentReplyRequestDto;
    }) => {
      if (!versionId) {
        throw new Error("Resume version id is required.");
      }

      return createResumeEditorCommentReplyRequest(versionId, commentId, payload);
    },
    onSuccess: async () => {
      await invalidateWorkspace(queryClient, versionId);
    },
  });
}

export function useCreateResumeEditorQuestionCardMutation(versionId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateResumeEditorQuestionCardRequestDto) => {
      if (!versionId) {
        throw new Error("Resume version id is required.");
      }

      const response = await createResumeEditorQuestionCardRequest(versionId, payload);

      return mapResumeEditorQuestionCardDtoToModel(response, 0);
    },
    onSuccess: async () => {
      await invalidateWorkspace(queryClient, versionId);
    },
  });
}

export function useUpdateResumeEditorQuestionCardMutation(versionId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      cardId,
      payload,
    }: {
      cardId: string;
      payload: UpdateResumeEditorQuestionCardRequestDto;
    }) => {
      if (!versionId) {
        throw new Error("Resume version id is required.");
      }

      const response = await updateResumeEditorQuestionCardRequest(versionId, cardId, payload);

      return mapResumeEditorQuestionCardDtoToModel(response, 0);
    },
    onSuccess: async () => {
      await invalidateWorkspace(queryClient, versionId);
    },
  });
}

export function useResumeEditorQuestionSuggestionsMutation(versionId: string | null) {
  return useMutation({
    mutationFn: async (payload: CreateResumeEditorQuestionSuggestionRequestDto) => {
      if (!versionId) {
        throw new Error("Resume version id is required.");
      }

      const response = await createResumeEditorQuestionSuggestionsRequest(versionId, payload);

      return mapResumeEditorQuestionSuggestionResponseDtoToModel(response);
    },
  });
}

export function useResumeEditorRewriteSuggestionsMutation(versionId: string | null) {
  return useMutation({
    mutationFn: async (payload: CreateResumeEditorRewriteSuggestionRequestDto) => {
      if (!versionId) {
        throw new Error("Resume version id is required.");
      }

      const response = await createResumeEditorRewriteSuggestionsRequest(versionId, payload);

      return mapResumeEditorRewriteSuggestionResponseDtoToModel(response);
    },
  });
}
