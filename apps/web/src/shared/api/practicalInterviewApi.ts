import { apiEndpoints } from "./endpoints";
import { httpClient } from "./httpClient";
import type {
  BulkUpdateInterviewTranscriptSegmentsRequestDto,
  CreateInterviewRecordRequestDto,
  InterviewRecordAnalysisDto,
  InterviewRecordDetailDto,
  InterviewRecordListItemDto,
  InterviewRecordQuestionsResponseDto,
  InterviewRecordReviewDto,
  InterviewRecordTranscriptDto,
  InterviewerProfileDto,
  UpdateInterviewTranscriptSegmentRequestDto,
} from "../types/practicalInterview";

export function getInterviewRecordsRequest(signal?: AbortSignal) {
  return httpClient.get<InterviewRecordListItemDto[]>(apiEndpoints.interviewRecords.root, {
    signal,
  });
}

export function createInterviewRecordRequest(payload: CreateInterviewRecordRequestDto) {
  return httpClient.post<InterviewRecordDetailDto, CreateInterviewRecordRequestDto>(
    apiEndpoints.interviewRecords.root,
    { body: payload },
  );
}

export function getInterviewRecordDetailRequest(recordId: string, signal?: AbortSignal) {
  return httpClient.get<InterviewRecordDetailDto>(apiEndpoints.interviewRecords.detail(recordId), {
    signal,
  });
}

export function getInterviewRecordTranscriptRequest(recordId: string, signal?: AbortSignal) {
  return httpClient.get<InterviewRecordTranscriptDto>(
    apiEndpoints.interviewRecords.transcript(recordId),
    { signal },
  );
}

export function retryInterviewRecordTranscriptionRequest(recordId: string) {
  return httpClient.post<InterviewRecordDetailDto>(
    apiEndpoints.interviewRecords.retryTranscription(recordId),
  );
}

export function updateInterviewTranscriptSegmentRequest(
  recordId: string,
  segmentId: string,
  payload: UpdateInterviewTranscriptSegmentRequestDto,
) {
  return httpClient.patch<
    InterviewRecordTranscriptDto,
    UpdateInterviewTranscriptSegmentRequestDto
  >(apiEndpoints.interviewRecords.transcriptSegment(recordId, segmentId), {
    body: payload,
  });
}

export function getInterviewRecordQuestionsRequest(recordId: string, signal?: AbortSignal) {
  return httpClient.get<InterviewRecordQuestionsResponseDto>(
    apiEndpoints.interviewRecords.questions(recordId),
    { signal },
  );
}

export function getInterviewRecordAnalysisRequest(recordId: string, signal?: AbortSignal) {
  return httpClient.get<InterviewRecordAnalysisDto>(
    apiEndpoints.interviewRecords.analysis(recordId),
    { signal },
  );
}

export function getInterviewerProfileRequest(recordId: string, signal?: AbortSignal) {
  return httpClient.get<InterviewerProfileDto>(
    apiEndpoints.interviewRecords.interviewerProfile(recordId),
    { signal },
  );
}

export function getInterviewRecordReviewRequest(recordId: string, signal?: AbortSignal) {
  return httpClient.get<InterviewRecordReviewDto>(
    apiEndpoints.interviewRecords.review(recordId),
    { signal },
  );
}

export function updateInterviewRecordReviewRequest(
  recordId: string,
  payload: BulkUpdateInterviewTranscriptSegmentsRequestDto,
) {
  return httpClient.patch<
    InterviewRecordReviewDto,
    BulkUpdateInterviewTranscriptSegmentsRequestDto
  >(apiEndpoints.interviewRecords.review(recordId), {
    body: payload,
  });
}

export function confirmInterviewRecordRequest(recordId: string) {
  return httpClient.post<InterviewRecordDetailDto>(apiEndpoints.interviewRecords.confirm(recordId));
}
