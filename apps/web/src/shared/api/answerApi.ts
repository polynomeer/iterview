import { apiEndpoints } from "./endpoints";
import { httpClient } from "./httpClient";
import type { SubmitAnswerRequestDto, SubmitAnswerResponseDto } from "../types/answer";

export function submitAnswerRequest(
  questionId: string,
  payload: SubmitAnswerRequestDto,
) {
  return httpClient.post<SubmitAnswerResponseDto, SubmitAnswerRequestDto>(
    apiEndpoints.questions.answers(questionId),
    {
      body: payload,
    },
  );
}
