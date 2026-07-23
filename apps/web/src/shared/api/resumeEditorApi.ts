import { apiEndpoints } from "./endpoints";
import { httpClient } from "./httpClient";
import type {
  CreateResumeEditorCommentReplyRequestDto,
  CreateResumeEditorCommentRequestDto,
  CreateResumeEditorPresenceRequestDto,
  CreateResumeEditorQuestionCardRequestDto,
  CreateResumeEditorQuestionSuggestionRequestDto,
  CreateResumeEditorRewriteSuggestionRequestDto,
  ImportResumeEditorMarkdownRequestDto,
  PatchResumeEditorDocumentOperationsRequestDto,
  ResumeEditorCommentThreadDto,
  ResumeEditorMergePreviewDto,
  ResumeEditorMergePreviewRequestDto,
  ResumeEditorPresenceDto,
  ResumeEditorPrintPreviewDto,
  ResumeEditorQuestionCardDto,
  ResumeEditorQuestionSuggestionResponseDto,
  ResumeEditorRevisionDto,
  ResumeEditorRevisionListItemDto,
  ResumeEditorRewriteSuggestionResponseDto,
  ResumeEditorTrackedChangesDto,
  ResumeEditorWorkspaceDto,
  UpdateResumeEditorCommentRequestDto,
  UpdateResumeEditorDocumentRequestDto,
  UpdateResumeEditorQuestionCardRequestDto,
} from "../types/resumeEditor";

export function getResumeEditorWorkspaceRequest(versionId: string, signal?: AbortSignal) {
  return httpClient.get<ResumeEditorWorkspaceDto>(apiEndpoints.resumeVersions.editor(versionId), {
    signal,
  });
}

export function updateResumeEditorDocumentRequest(
  versionId: string,
  payload: UpdateResumeEditorDocumentRequestDto,
) {
  return httpClient.put<ResumeEditorWorkspaceDto, UpdateResumeEditorDocumentRequestDto>(
    apiEndpoints.resumeVersions.editorDocument(versionId),
    { body: payload },
  );
}

export function patchResumeEditorDocumentOperationsRequest(
  versionId: string,
  payload: PatchResumeEditorDocumentOperationsRequestDto,
) {
  return httpClient.patch<ResumeEditorWorkspaceDto, PatchResumeEditorDocumentOperationsRequestDto>(
    apiEndpoints.resumeVersions.editorDocumentOperations(versionId),
    { body: payload },
  );
}

export function importResumeEditorMarkdownRequest(
  versionId: string,
  payload: ImportResumeEditorMarkdownRequestDto,
) {
  return httpClient.post<ResumeEditorWorkspaceDto, ImportResumeEditorMarkdownRequestDto>(
    apiEndpoints.resumeVersions.editorImportMarkdown(versionId),
    { body: payload },
  );
}

export function createResumeEditorCommentRequest(
  versionId: string,
  payload: CreateResumeEditorCommentRequestDto,
) {
  return httpClient.post<ResumeEditorCommentThreadDto, CreateResumeEditorCommentRequestDto>(
    apiEndpoints.resumeVersions.editorComments(versionId),
    { body: payload },
  );
}

export function updateResumeEditorCommentRequest(
  versionId: string,
  commentId: string,
  payload: UpdateResumeEditorCommentRequestDto,
) {
  return httpClient.patch<ResumeEditorCommentThreadDto, UpdateResumeEditorCommentRequestDto>(
    apiEndpoints.resumeVersions.editorComment(versionId, commentId),
    { body: payload },
  );
}

export function createResumeEditorCommentReplyRequest(
  versionId: string,
  commentId: string,
  payload: CreateResumeEditorCommentReplyRequestDto,
) {
  return httpClient.post<ResumeEditorCommentThreadDto, CreateResumeEditorCommentReplyRequestDto>(
    apiEndpoints.resumeVersions.editorCommentReplies(versionId, commentId),
    { body: payload },
  );
}

export function createResumeEditorPresenceRequest(
  versionId: string,
  payload: CreateResumeEditorPresenceRequestDto,
) {
  return httpClient.post<ResumeEditorPresenceDto[] | ResumeEditorPresenceDto, CreateResumeEditorPresenceRequestDto>(
    apiEndpoints.resumeVersions.editorPresence(versionId),
    { body: payload },
  );
}

export function createResumeEditorQuestionCardRequest(
  versionId: string,
  payload: CreateResumeEditorQuestionCardRequestDto,
) {
  return httpClient.post<ResumeEditorQuestionCardDto, CreateResumeEditorQuestionCardRequestDto>(
    apiEndpoints.resumeVersions.editorQuestionCards(versionId),
    { body: payload },
  );
}

export function updateResumeEditorQuestionCardRequest(
  versionId: string,
  cardId: string,
  payload: UpdateResumeEditorQuestionCardRequestDto,
) {
  return httpClient.patch<ResumeEditorQuestionCardDto, UpdateResumeEditorQuestionCardRequestDto>(
    apiEndpoints.resumeVersions.editorQuestionCard(versionId, cardId),
    { body: payload },
  );
}

export function createResumeEditorQuestionSuggestionsRequest(
  versionId: string,
  payload: CreateResumeEditorQuestionSuggestionRequestDto,
) {
  return httpClient.post<
    ResumeEditorQuestionSuggestionResponseDto,
    CreateResumeEditorQuestionSuggestionRequestDto
  >(apiEndpoints.resumeVersions.editorAutoQuestionSuggestions(versionId), {
    body: payload,
  });
}

export function createResumeEditorRewriteSuggestionsRequest(
  versionId: string,
  payload: CreateResumeEditorRewriteSuggestionRequestDto,
) {
  return httpClient.post<
    ResumeEditorRewriteSuggestionResponseDto,
    CreateResumeEditorRewriteSuggestionRequestDto
  >(apiEndpoints.resumeVersions.editorRewriteSuggestions(versionId), {
    body: payload,
  });
}

export function getResumeEditorPrintPreviewRequest(versionId: string, signal?: AbortSignal) {
  return httpClient.get<ResumeEditorPrintPreviewDto>(
    apiEndpoints.resumeVersions.editorPrintPreview(versionId),
    { signal },
  );
}

export function getResumeEditorRevisionsRequest(versionId: string, signal?: AbortSignal) {
  return httpClient.get<ResumeEditorRevisionListItemDto[]>(
    apiEndpoints.resumeVersions.editorRevisions(versionId),
    { signal },
  );
}

export function getResumeEditorRevisionDetailRequest(
  versionId: string,
  revisionId: string,
  signal?: AbortSignal,
) {
  return httpClient.get<ResumeEditorRevisionDto>(
    apiEndpoints.resumeVersions.editorRevision(versionId, revisionId),
    { signal },
  );
}

export function getResumeEditorTrackedChangesRequest(
  versionId: string,
  fromRevisionId: string,
  toRevisionId: string,
  signal?: AbortSignal,
) {
  const params = new URLSearchParams({
    fromRevisionId,
    toRevisionId,
  });

  return httpClient.get<ResumeEditorTrackedChangesDto>(
    `${apiEndpoints.resumeVersions.editorTrackedChanges(versionId)}?${params.toString()}`,
    { signal },
  );
}

export function createResumeEditorMergePreviewRequest(
  versionId: string,
  payload: ResumeEditorMergePreviewRequestDto,
) {
  return httpClient.post<ResumeEditorMergePreviewDto, ResumeEditorMergePreviewRequestDto>(
    apiEndpoints.resumeVersions.editorMergePreview(versionId),
    { body: payload },
  );
}
