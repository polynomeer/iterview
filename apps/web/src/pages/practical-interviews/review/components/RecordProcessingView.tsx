import { Link } from "react-router-dom";
import type { useRetryInterviewRecordTranscriptionMutation } from "../../../../features/practical-interview/api/useRetryInterviewRecordTranscriptionMutation";
import { getErrorDetails, userFacingErrorMessage } from "../../../../shared/api/errors";
import { routeConfig } from "../../../../shared/config/routes";
import { useLocale } from "../../../../shared/i18n";
import { ErrorStateCard } from "../../../../shared/ui/ErrorStateCard";
import { FeedbackNotice } from "../../../../shared/ui/FeedbackNotice";
import { MetricCard } from "../../../../shared/ui/MetricCard";
import { PageContainer } from "../../../../shared/ui/PageContainer";
import type { ReviewRecordDetail } from "../reviewModel";

/** Shown while the transcript is pending, processing, or failed (with retry). */
export function RecordProcessingView({
  detail,
  onRefresh,
  retryTranscriptionMutation,
}: {
  detail: ReviewRecordDetail;
  onRefresh: () => void;
  retryTranscriptionMutation: ReturnType<typeof useRetryInterviewRecordTranscriptionMutation>;
}) {
  const { locale } = useLocale();
  const isKorean = locale === "ko";
  const isProcessing = detail.isTranscriptPending || detail.isTranscriptProcessing;
  const canRetry = detail.isTranscriptFailed && detail.canRetryTranscription;

  return (
    <PageContainer
      description={
        isProcessing
          ? isKorean
            ? "업로드한 면접 기록은 생성되었고, 전사 추출 또는 구조화가 아직 진행 중입니다."
            : "The uploaded interview record was created successfully, and transcript extraction or structuring is still in progress."
          : isKorean
            ? "업로드는 성공했지만 전사 추출이 아직 끝나지 않았습니다."
            : "The upload succeeded, but transcript extraction did not complete yet."
      }
      eyebrow={isKorean ? "실전 면접" : "Practical Interview"}
      title={detail.title}
    >
      <div className="page-stack">
        <section className="page-card">
          <span className="page-card__label">{isKorean ? "처리 중" : "Processing"}</span>
          <h2 className="page-card__title">
            {detail.isTranscriptFailed
              ? isKorean
                ? "전사 추출에 확인이 필요합니다"
                : "Transcript extraction needs attention"
              : isKorean
                ? "전사 추출 진행 중"
                : "Transcript extraction in progress"}
          </h2>
          <p className="page-card__body">
            {detail.isTranscriptFailed
              ? detail.transcriptErrorMessage ??
                detail.transcriptErrorLabel ??
                (isKorean
                  ? "업로드는 성공했지만 서버가 아직 전사를 준비하지 못했습니다."
                  : "The upload succeeded, but the server could not prepare a transcript yet.")
              : isKorean
                ? "업로드는 성공했습니다. 전사를 직접 붙여넣지 않았다면 서버가 오디오에서 전사를 추출하고 구조화 파이프라인을 진행하는 중입니다."
                : "The upload succeeded. If you did not paste a transcript, the server is now trying to extract one from the audio and run the structuring pipeline."}
          </p>
          <div className="stats-grid">
            <MetricCard label={isKorean ? "전사" : "Transcript"} value={detail.transcriptStatusLabel} />
            <MetricCard label={isKorean ? "분석" : "Analysis"} tone="accent" value={detail.analysisStatusLabel} />
            <MetricCard label={isKorean ? "질문" : "Questions"} tone="muted" value={String(detail.questionCount)} />
            <MetricCard
              label={isKorean ? "재시도" : "Retries"}
              tone="muted"
              value={String(detail.transcriptRetryCount)}
            />
          </div>
          <div className="page-card__actions">
            <button
              className="primary-button"
              onClick={() => {
                onRefresh();
              }}
              type="button"
            >
              {isKorean ? "상태 새로고침" : "Refresh status"}
            </button>
            {canRetry ? (
              <button
                className="secondary-button"
                disabled={retryTranscriptionMutation.isPending}
                onClick={() => {
                  void retryTranscriptionMutation.mutateAsync();
                }}
                type="button"
              >
                {retryTranscriptionMutation.isPending
                  ? isKorean
                    ? "재시도 요청 중..."
                    : "Retrying..."
                  : isKorean
                    ? "전사 다시 시도"
                    : "Retry transcription"}
              </button>
            ) : null}
            <Link
              className="secondary-button"
              to={routeConfig.practicalInterviews.buildPath()}
            >
              {isKorean ? "실전 면접 목록으로" : "Back to practical interviews"}
            </Link>
          </div>
        </section>

        <FeedbackNotice
          message={
            detail.isTranscriptFailed
              ? isKorean
                ? "전사 실패는 업로드 실패와 다릅니다. 가능하면 전사 재시도를 사용하고, 아니면 서버 재시도 시간이 지난 뒤 기록을 다시 여세요."
                : "A failed transcript is not the same as a failed upload. Use retry transcription when available, or reopen the record after the server retry window."
              : isKorean
                ? "전사 대기는 오류가 아닙니다. 처리가 끝난 뒤 이 기록을 다시 열면 리뷰 작업공간이 자동으로 나타납니다."
                : "Pending transcript extraction is not an error. Re-open this record after processing completes and the review workspace will appear automatically."
          }
          tone={detail.isTranscriptFailed ? "error" : "info"}
        />

        {retryTranscriptionMutation.isError ? (
          <ErrorStateCard
            body={
              userFacingErrorMessage(retryTranscriptionMutation.error, isKorean
                  ? "전사 재시도 요청에 실패했습니다."
                  : "The transcript retry request failed.")
            }
            details={getErrorDetails(retryTranscriptionMutation.error)}
            onAction={() => retryTranscriptionMutation.reset()}
            title={isKorean ? "전사를 다시 시도할 수 없습니다" : "Unable to retry transcription"}
          />
        ) : null}

        <section className="page-card">
          <span className="page-card__label">{isKorean ? "현재 상태" : "Current status"}</span>
          <h2 className="page-card__title">{isKorean ? "다음에 일어나는 일" : "What happens next"}</h2>
          <div className="stack-list">
            <article className="list-item-card">
              <div className="list-item-card__content">
                <div className="list-item-card__meta">
                  <span>{isKorean ? "오디오" : "Audio"}</span>
                  {detail.sourceAudioFileName ? <span>{detail.sourceAudioFileName}</span> : null}
                </div>
                <h3 className="list-item-card__title">{isKorean ? "업로드한 원본이 보관되었습니다" : "Uploaded source is stored"}</h3>
                <p className="list-item-card__body">
                  {detail.isTranscriptFailed
                    ? isKorean
                      ? "업로드한 오디오는 계속 보관됩니다. 파일을 다시 올리지 않아도 전사를 재시도할 수 있습니다."
                      : "The uploaded audio is still stored. You can retry transcription without re-uploading the file."
                    : isKorean
                      ? "전사가 확정되면 여기에서 전사, 질문 리뷰, 스레드 리뷰 영역을 사용할 수 있습니다."
                      : "Once the transcript is confirmed, the transcript, question review, and thread review lanes will become available here."}
                </p>
              </div>
            </article>
            <article className="list-item-card">
              <div className="list-item-card__content">
                <div className="list-item-card__meta">
                  <span>{isKorean ? "구조화 단계" : "Structuring stage"}</span>
                </div>
                <h3 className="list-item-card__title">{detail.structuringStageLabel}</h3>
                <p className="list-item-card__body">
                  {detail.overallSummary ??
                    detail.aiEnrichedSummary ??
                    detail.deterministicSummary ??
                    (detail.isTranscriptFailed
                      ? isKorean
                        ? "백엔드가 전사 준비를 끝내지 못했습니다. 전사가 성공할 때까지 리뷰 데이터 묶음이 막혀 있습니다."
                        : "The backend did not finish transcript preparation. Review payloads will stay blocked until transcription succeeds."
                      : isKorean
                        ? "백엔드가 이 면접 기록 처리를 계속 진행하고, 준비가 되면 리뷰 데이터 묶음을 갱신합니다."
                        : "The backend will continue processing this interview record and update the review payload when ready.")}
                </p>
                <p className="list-item-card__body">
                  {detail.transcriptLastAttemptAtLabel
                    ? isKorean
                      ? `마지막 시도 ${detail.transcriptLastAttemptAtLabel}`
                      : `Last attempt ${detail.transcriptLastAttemptAtLabel}`
                    : detail.transcriptProcessingStartedAtLabel
                      ? isKorean
                        ? `처리 시작 ${detail.transcriptProcessingStartedAtLabel}`
                        : `Processing started ${detail.transcriptProcessingStartedAtLabel}`
                      : isKorean
                        ? "전사 워커가 아직 완료된 시도를 보고하지 않았습니다."
                        : "The transcript worker has not reported a completed attempt yet."}
                  {detail.transcriptNextRetryAtLabel
                    ? isKorean
                      ? ` 다음 재시도 ${detail.transcriptNextRetryAtLabel}.`
                      : ` Next retry ${detail.transcriptNextRetryAtLabel}.`
                    : ""}
                </p>
              </div>
            </article>
          </div>
        </section>
      </div>
    </PageContainer>
  );
}
