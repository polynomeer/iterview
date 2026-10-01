import { apiEndpoints } from "./endpoints";
import { httpClient } from "./httpClient";
import type { LibraryResponseDto, QuestionLibraryStateDto } from "../types/library";

export function getLibraryRequest(signal?: AbortSignal) {
  return httpClient.get<LibraryResponseDto>(apiEndpoints.library, { signal });
}

export function getQuestionLibraryStateRequest(questionId: string, signal?: AbortSignal) {
  return httpClient.get<QuestionLibraryStateDto>(apiEndpoints.questions.libraryState(questionId), { signal });
}

export function setQuestionBookmarkRequest(questionId: string, bookmarked: boolean) {
  const path = apiEndpoints.questions.bookmark(questionId);
  return bookmarked ? httpClient.put<QuestionLibraryStateDto>(path) : httpClient.delete<QuestionLibraryStateDto>(path);
}

export function saveQuestionNoteRequest(questionId: string, body: string) {
  return httpClient.put<QuestionLibraryStateDto, { body: string }>(apiEndpoints.questions.note(questionId), { body: { body } });
}
