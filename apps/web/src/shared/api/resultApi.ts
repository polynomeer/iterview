import { apiEndpoints } from "./endpoints";
import { httpClient } from "./httpClient";
import type { AnswerAttemptDetailResponseDto, AnswerAnalysisDto } from "../types/result";

export function getAnswerAttemptDetailRequest(
  answerAttemptId: string,
  signal?: AbortSignal,
) {
  return httpClient.get<AnswerAttemptDetailResponseDto>(
    apiEndpoints.answerAttempts.detail(answerAttemptId),
    { signal },
  );
}

export function getAnswerAnalysisRequest(answerAttemptId: string, signal?: AbortSignal) {
  return httpClient.get<AnswerAnalysisDto>(apiEndpoints.answerAttempts.analysis(answerAttemptId), {
    signal,
  });
}
