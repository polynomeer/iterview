import { useMutation, useQueryClient } from "@tanstack/react-query";
import { mapResumeEditorMergePreviewDtoToModel, mapResumeEditorWorkspaceDtoToModel } from "../../../entities/resume-editor/model";
import {
  createResumeEditorMergePreviewRequest,
  importResumeEditorMarkdownRequest,
  patchResumeEditorDocumentOperationsRequest,
  updateResumeEditorDocumentRequest,
} from "../../../shared/api/resumeEditorApi";
import { queryKeys } from "../../../shared/api/queryKeys";
import type {
  ImportResumeEditorMarkdownRequestDto,
  PatchResumeEditorDocumentOperationsRequestDto,
  ResumeEditorMergePreviewRequestDto,
  UpdateResumeEditorDocumentRequestDto,
} from "../../../shared/types/resumeEditor";

export function useUpdateResumeEditorDocumentMutation(versionId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UpdateResumeEditorDocumentRequestDto) => {
      if (!versionId) {
        throw new Error("Resume version id is required.");
      }

      const response = await updateResumeEditorDocumentRequest(versionId, payload);

      return mapResumeEditorWorkspaceDtoToModel(response);
    },
    onSuccess: async () => {
      if (!versionId) {
        return;
      }

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.resumes.editor(versionId) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.resumes.editorRevisions(versionId) }),
      ]);
    },
  });
}

export function useImportResumeEditorMarkdownMutation(versionId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: ImportResumeEditorMarkdownRequestDto) => {
      if (!versionId) {
        throw new Error("Resume version id is required.");
      }

      const response = await importResumeEditorMarkdownRequest(versionId, payload);

      return mapResumeEditorWorkspaceDtoToModel(response);
    },
    onSuccess: async () => {
      if (!versionId) {
        return;
      }

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.resumes.editor(versionId) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.resumes.editorRevisions(versionId) }),
      ]);
    },
  });
}

export function usePatchResumeEditorDocumentOperationsMutation(versionId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: PatchResumeEditorDocumentOperationsRequestDto) => {
      if (!versionId) {
        throw new Error("Resume version id is required.");
      }

      const response = await patchResumeEditorDocumentOperationsRequest(versionId, payload);

      return mapResumeEditorWorkspaceDtoToModel(response);
    },
    onSuccess: async () => {
      if (!versionId) {
        return;
      }

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.resumes.editor(versionId) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.resumes.editorRevisions(versionId) }),
      ]);
    },
  });
}

export function useResumeEditorMergePreviewMutation(versionId: string | null) {
  return useMutation({
    mutationFn: async (payload: ResumeEditorMergePreviewRequestDto) => {
      if (!versionId) {
        throw new Error("Resume version id is required.");
      }

      const response = await createResumeEditorMergePreviewRequest(versionId, payload);

      return mapResumeEditorMergePreviewDtoToModel(response);
    },
  });
}
