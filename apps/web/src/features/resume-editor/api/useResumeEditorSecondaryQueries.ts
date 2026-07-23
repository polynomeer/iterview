import { useQuery } from "@tanstack/react-query";
import {
  mapResumeEditorPrintPreviewDtoToModel,
  mapResumeEditorRevisionDtoToModel,
  mapResumeEditorRevisionListDtoToModel,
  mapResumeEditorTrackedChangesDtoToModel,
} from "../../../entities/resume-editor/model";
import {
  getResumeEditorPrintPreviewRequest,
  getResumeEditorRevisionDetailRequest,
  getResumeEditorRevisionsRequest,
  getResumeEditorTrackedChangesRequest,
} from "../../../shared/api/resumeEditorApi";
import { queryKeys } from "../../../shared/api/queryKeys";

export function useResumeEditorPrintPreviewQuery(versionId: string | null, enabled = true) {
  return useQuery({
    queryKey: versionId
      ? queryKeys.resumes.editorPrintPreview(versionId)
      : ["resumes", "editor-print-preview", "missing"],
    queryFn: async ({ signal }) => {
      if (!versionId) {
        throw new Error("Resume version id is required.");
      }

      const response = await getResumeEditorPrintPreviewRequest(versionId, signal);

      return mapResumeEditorPrintPreviewDtoToModel(response);
    },
    enabled: Boolean(versionId) && enabled,
  });
}

export function useResumeEditorRevisionsQuery(versionId: string | null, enabled = true) {
  return useQuery({
    queryKey: versionId
      ? queryKeys.resumes.editorRevisions(versionId)
      : ["resumes", "editor-revisions", "missing"],
    queryFn: async ({ signal }) => {
      if (!versionId) {
        throw new Error("Resume version id is required.");
      }

      const response = await getResumeEditorRevisionsRequest(versionId, signal);

      return mapResumeEditorRevisionListDtoToModel(response);
    },
    enabled: Boolean(versionId) && enabled,
  });
}

export function useResumeEditorRevisionDetailQuery(
  versionId: string | null,
  revisionId: string | null,
  enabled = true,
) {
  return useQuery({
    queryKey:
      versionId && revisionId
        ? queryKeys.resumes.editorRevision(versionId, revisionId)
        : ["resumes", "editor-revision", "missing"],
    queryFn: async ({ signal }) => {
      if (!versionId || !revisionId) {
        throw new Error("Version id and revision id are required.");
      }

      const response = await getResumeEditorRevisionDetailRequest(versionId, revisionId, signal);

      return mapResumeEditorRevisionDtoToModel(response);
    },
    enabled: Boolean(versionId && revisionId) && enabled,
  });
}

export function useResumeEditorTrackedChangesQuery(
  versionId: string | null,
  fromRevisionId: string | null,
  toRevisionId: string | null,
  enabled = true,
) {
  return useQuery({
    queryKey:
      versionId && fromRevisionId && toRevisionId
        ? queryKeys.resumes.editorTrackedChanges(versionId, fromRevisionId, toRevisionId)
        : ["resumes", "editor-tracked-changes", "missing"],
    queryFn: async ({ signal }) => {
      if (!versionId || !fromRevisionId || !toRevisionId) {
        throw new Error("Version and revision ids are required.");
      }

      const response = await getResumeEditorTrackedChangesRequest(
        versionId,
        fromRevisionId,
        toRevisionId,
        signal,
      );

      return mapResumeEditorTrackedChangesDtoToModel(response);
    },
    enabled: Boolean(versionId && fromRevisionId && toRevisionId) && enabled,
  });
}
