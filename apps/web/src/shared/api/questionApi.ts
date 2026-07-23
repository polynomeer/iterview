import { apiEndpoints } from "./endpoints";
import { httpClient } from "./httpClient";
import type {
  CreateQuestionLearningMaterialRequest,
  CreateQuestionReferenceAnswerRequest,
  LearningMaterialDto,
  QuestionDetailResponseDto,
  QuestionReferenceAnswerDto,
  RecommendedFollowUpDto,
  ResumeBasedQuestionDto,
} from "../types/question";
import type { QuestionAnswerHistoryResponseDto } from "../types/answer-history";
import type { QuestionTreeResponseDto } from "../types/question-tree";

export function getQuestionDetailRequest(questionId: string, signal?: AbortSignal) {
  return httpClient.get<QuestionDetailResponseDto>(apiEndpoints.questions.detail(questionId), {
    signal,
  });
}

export function getQuestionReferenceAnswersRequest(questionId: string, signal?: AbortSignal) {
  return httpClient.get<QuestionReferenceAnswerDto[]>(
    apiEndpoints.questions.referenceAnswers(questionId),
    { signal },
  );
}

export function getQuestionLearningMaterialsRequest(questionId: string, signal?: AbortSignal) {
  return httpClient.get<LearningMaterialDto[]>(
    apiEndpoints.questions.learningMaterials(questionId),
    { signal },
  );
}

export function createQuestionReferenceAnswerRequest(
  questionId: string,
  body: CreateQuestionReferenceAnswerRequest,
) {
  return httpClient.post<QuestionReferenceAnswerDto, CreateQuestionReferenceAnswerRequest>(
    apiEndpoints.questions.referenceAnswers(questionId),
    { body },
  );
}

export function createQuestionLearningMaterialRequest(
  questionId: string,
  body: CreateQuestionLearningMaterialRequest,
) {
  return httpClient.post<LearningMaterialDto, CreateQuestionLearningMaterialRequest>(
    apiEndpoints.questions.learningMaterials(questionId),
    { body },
  );
}

export function getQuestionAnswerHistoryRequest(questionId: string, signal?: AbortSignal) {
  return httpClient.get<QuestionAnswerHistoryResponseDto>(apiEndpoints.questions.answers(questionId), {
    signal,
  });
}

export function getQuestionTreeRequest(questionId: string, signal?: AbortSignal) {
  return httpClient.get<QuestionTreeResponseDto>(apiEndpoints.questions.tree(questionId), {
    signal,
  });
}

export function getRecommendedFollowupsRequest(questionId: string, signal?: AbortSignal) {
  return httpClient.get<RecommendedFollowUpDto[]>(
    apiEndpoints.questions.recommendedFollowups(questionId),
    { signal },
  );
}

export function getResumeBasedQuestionsRequest(limit = 10, signal?: AbortSignal) {
  return httpClient.get<ResumeBasedQuestionDto[]>(
    `${apiEndpoints.questions.resumeBased}?limit=${limit}`,
    { signal },
  );
}
