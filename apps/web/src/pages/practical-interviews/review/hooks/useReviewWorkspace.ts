import { useMemo } from "react";
import { useCreateInterviewSessionMutation } from "../../../../features/interview/api/useCreateInterviewSessionMutation";
import { useConfirmInterviewRecordMutation } from "../../../../features/practical-interview/api/useConfirmInterviewRecordMutation";
import { useInterviewRecordDetailQuery } from "../../../../features/practical-interview/api/useInterviewRecordDetailQuery";
import { useInterviewRecordQuestionsQuery } from "../../../../features/practical-interview/api/useInterviewRecordQuestionsQuery";
import { useRetryInterviewRecordTranscriptionMutation } from "../../../../features/practical-interview/api/useRetryInterviewRecordTranscriptionMutation";
import { useInterviewRecordReviewQuery } from "../../../../features/practical-interview/api/useInterviewRecordReviewQuery";
import { useInterviewRecordTranscriptQuery } from "../../../../features/practical-interview/api/useInterviewRecordTranscriptQuery";
import { useUpdateInterviewReviewMutation } from "../../../../features/practical-interview/api/useUpdateInterviewReviewMutation";
import { useUpdateInterviewTranscriptSegmentMutation } from "../../../../features/practical-interview/api/useUpdateInterviewTranscriptSegmentMutation";

/**
 * Server state for one interview record review: the record detail, the review payloads
 * (fetched once the transcript is confirmed), and the review mutations.
 */
export function useReviewWorkspace(recordId: string | undefined) {
  const detailQuery = useInterviewRecordDetailQuery(recordId);
  const isRecordReadyForReview = detailQuery.data?.isTranscriptConfirmed ?? false;
  const reviewQuery = useInterviewRecordReviewQuery(recordId, isRecordReadyForReview);
  const transcriptQuery = useInterviewRecordTranscriptQuery(recordId, isRecordReadyForReview);
  const questionsQuery = useInterviewRecordQuestionsQuery(recordId, isRecordReadyForReview);
  const structuredQuestionById = useMemo(
    () => new Map((questionsQuery.data?.items ?? []).map((item) => [item.id, item])),
    [questionsQuery.data?.items],
  );
  const updateSegmentMutation = useUpdateInterviewTranscriptSegmentMutation(recordId);
  const updateReviewMutation = useUpdateInterviewReviewMutation(recordId);
  const confirmMutation = useConfirmInterviewRecordMutation(recordId);
  const retryTranscriptionMutation = useRetryInterviewRecordTranscriptionMutation(recordId);
  const createReplayMutation = useCreateInterviewSessionMutation();
  const isLoading =
    detailQuery.isLoading ||
    (isRecordReadyForReview &&
      (reviewQuery.isLoading ||
        transcriptQuery.isLoading ||
        questionsQuery.isLoading));
  const hasError =
    detailQuery.isError ||
    (isRecordReadyForReview &&
      (reviewQuery.isError ||
        transcriptQuery.isError ||
        questionsQuery.isError));
  const transcriptTimeline = useMemo(
    () =>
      (transcriptQuery.data?.segments ?? [])
        .filter((segment) => segment.endMs > segment.startMs)
        .map((segment) => ({
          id: segment.id,
          sequence: segment.sequence,
          startMs: segment.startMs,
          endMs: segment.endMs,
          timestampLabel: segment.timestampLabel,
          speakerLabel: segment.speakerLabel,
          text: segment.confirmedText || segment.cleanedText || segment.rawText,
        })),
    [transcriptQuery.data?.segments],
  );
  const chapterItems = useMemo(
    () =>
      (reviewQuery.data?.questionSummaries ?? [])
        .map((question) => {
          const range = question.questionAnswerRange ?? question.answerRange ?? question.questionRange;

          if (!range) {
            return null;
          }

          return {
            id: question.id,
            label: `Q${question.orderIndex + 1}. ${question.text}`,
            startMs: range.startMs,
            endMs: range.endMs,
            timestampLabel: range.startTimestampLabel,
            supportingText: question.answerSummary,
            isFollowUp: question.isFollowUp,
          };
        })
        .filter((chapter): chapter is NonNullable<typeof chapter> => chapter !== null),
    [reviewQuery.data?.questionSummaries],
  );

  return {
    detailQuery,
    isRecordReadyForReview,
    reviewQuery,
    transcriptQuery,
    questionsQuery,
    structuredQuestionById,
    updateSegmentMutation,
    updateReviewMutation,
    confirmMutation,
    retryTranscriptionMutation,
    createReplayMutation,
    isLoading,
    hasError,
    transcriptTimeline,
    chapterItems,
  };
}
