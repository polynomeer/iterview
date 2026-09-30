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
  const { t } = useLocale();
  const isProcessing = detail.isTranscriptPending || detail.isTranscriptProcessing;
  const canRetry = detail.isTranscriptFailed && detail.canRetryTranscription;

  return (
    <PageContainer
      description={
        isProcessing
          ? t("practicalReview.uploadedInterviewRecordWas")
          : t("practicalReview.uploadSucceededButTranscript")
      }
      eyebrow={t("practicalReview.practicalInterviewEyebrow")}
      title={detail.title}
    >
      <div className="page-stack">
        <section className="page-card">
          <span className="page-card__label">{t("practicalReview.processing")}</span>
          <h2 className="page-card__title">
            {detail.isTranscriptFailed
              ? t("practicalReview.transcriptExtractionNeedsAttention")
              : t("practicalReview.transcriptExtractionProgress")}
          </h2>
          <p className="page-card__body">
            {detail.isTranscriptFailed
              ? detail.transcriptErrorMessage ??
                detail.transcriptErrorLabel ??
                t("practicalReview.uploadSucceededButServer")
              : t("practicalReview.uploadSucceededIfYou")}
          </p>
          <div className="stats-grid">
            <MetricCard label={t("practicalReview.transcript")} value={detail.transcriptStatusLabel} />
            <MetricCard label={t("practicalReview.analysis")} tone="accent" value={detail.analysisStatusLabel} />
            <MetricCard label={t("practicalReview.statQuestions")} tone="muted" value={String(detail.questionCount)} />
            <MetricCard
              label={t("practicalReview.retries")}
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
              {t("practicalReview.refreshStatus")}
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
                  ? t("practicalReview.retrying")
                  : t("practicalReview.retryTranscription")}
              </button>
            ) : null}
            <Link
              className="secondary-button"
              to={routeConfig.practicalInterviews.buildPath()}
            >
              {t("practicalReview.backPracticalInterviews")}
            </Link>
          </div>
        </section>

        <FeedbackNotice
          message={
            detail.isTranscriptFailed
              ? t("practicalReview.failedTranscriptNotSame")
              : t("practicalReview.pendingTranscriptExtractionNot")
          }
          tone={detail.isTranscriptFailed ? "error" : "info"}
        />

        {retryTranscriptionMutation.isError ? (
          <ErrorStateCard
            body={
              userFacingErrorMessage(retryTranscriptionMutation.error, t("practicalReview.transcriptRetryRequestFailed"))
            }
            details={getErrorDetails(retryTranscriptionMutation.error)}
            onAction={() => retryTranscriptionMutation.reset()}
            title={t("practicalReview.unableRetryTranscription")}
          />
        ) : null}

        <section className="page-card">
          <span className="page-card__label">{t("practicalReview.currentStatus")}</span>
          <h2 className="page-card__title">{t("practicalReview.whatHappensNext")}</h2>
          <div className="stack-list">
            <article className="list-item-card">
              <div className="list-item-card__content">
                <div className="list-item-card__meta">
                  <span>{t("practicalReview.audio")}</span>
                  {detail.sourceAudioFileName ? <span>{detail.sourceAudioFileName}</span> : null}
                </div>
                <h3 className="list-item-card__title">{t("practicalReview.uploadedSourceStored")}</h3>
                <p className="list-item-card__body">
                  {detail.isTranscriptFailed
                    ? t("practicalReview.uploadedAudioStillStored")
                    : t("practicalReview.onceTranscriptConfirmedTranscript")}
                </p>
              </div>
            </article>
            <article className="list-item-card">
              <div className="list-item-card__content">
                <div className="list-item-card__meta">
                  <span>{t("practicalReview.structuringStage")}</span>
                </div>
                <h3 className="list-item-card__title">{detail.structuringStageLabel}</h3>
                <p className="list-item-card__body">
                  {detail.overallSummary ??
                    detail.aiEnrichedSummary ??
                    detail.deterministicSummary ??
                    (detail.isTranscriptFailed
                      ? t("practicalReview.backendDidNotFinish")
                      : t("practicalReview.backendWillContinueProcessing"))}
                </p>
                <p className="list-item-card__body">
                  {detail.transcriptLastAttemptAtLabel
                    ? t("practicalReview.lastAttempt", { time: detail.transcriptLastAttemptAtLabel })
                    : detail.transcriptProcessingStartedAtLabel
                      ? t("practicalReview.processingStarted", { time: detail.transcriptProcessingStartedAtLabel })
                      : t("practicalReview.transcriptWorkerHasNot")}
                  {detail.transcriptNextRetryAtLabel
                    ? t("practicalReview.nextRetry", { time: detail.transcriptNextRetryAtLabel })
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
