import { apiEndpoints } from "./endpoints";
import { httpClient } from "./httpClient";
import type {
  CreateInterviewSessionRequestDto,
  InterviewSessionAdvanceResponseDto,
  InterviewSessionAnswerResponseDto,
  InterviewSessionCoverageResponseDto,
  InterviewSessionDetailResponseDto,
  InterviewSessionListItemDto,
  InterviewSessionResumeMapResponseDto,
  SkipInterviewSessionQuestionRequestDto,
  SubmitInterviewSessionAnswerRequestDto,
} from "../types/interview";

export function getInterviewSessionsRequest(signal?: AbortSignal) {
  return httpClient.get<InterviewSessionListItemDto[]>(apiEndpoints.interviewSessions.root, {
    signal,
  });
}

export function createInterviewSessionRequest(payload: CreateInterviewSessionRequestDto) {
  return httpClient.post<InterviewSessionDetailResponseDto, CreateInterviewSessionRequestDto>(
    apiEndpoints.interviewSessions.root,
    { body: payload },
  );
}

export function getInterviewSessionDetailRequest(sessionId: string, signal?: AbortSignal) {
  return httpClient.get<InterviewSessionDetailResponseDto>(
    apiEndpoints.interviewSessions.detail(sessionId),
    { signal },
  );
}

export function getInterviewSessionCoverageRequest(sessionId: string, signal?: AbortSignal) {
  return httpClient.get<InterviewSessionCoverageResponseDto>(
    apiEndpoints.interviewSessions.coverage(sessionId),
    { signal },
  );
}

export function getInterviewSessionResumeMapRequest(sessionId: string, signal?: AbortSignal) {
  return httpClient.get<InterviewSessionResumeMapResponseDto>(
    apiEndpoints.interviewSessions.resumeMap(sessionId),
    { signal },
  );
}

export function submitInterviewSessionAnswerRequest(
  sessionId: string,
  payload: SubmitInterviewSessionAnswerRequestDto,
) {
  return httpClient.post<
    InterviewSessionAnswerResponseDto,
    SubmitInterviewSessionAnswerRequestDto
  >(apiEndpoints.interviewSessions.answers(sessionId), {
    body: payload,
  });
}

export function advanceInterviewSessionRequest(sessionId: string) {
  return httpClient.post<InterviewSessionAdvanceResponseDto>(
    apiEndpoints.interviewSessions.nextQuestion(sessionId),
  );
}

export function skipInterviewSessionQuestionRequest(
  sessionId: string,
  payload: SkipInterviewSessionQuestionRequestDto,
) {
  return httpClient.post<
    InterviewSessionAdvanceResponseDto,
    SkipInterviewSessionQuestionRequestDto
  >(apiEndpoints.interviewSessions.skipQuestion(sessionId), {
    body: payload,
  });
}
