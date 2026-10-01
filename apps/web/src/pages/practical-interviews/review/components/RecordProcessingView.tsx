import type { useRetryInterviewRecordTranscriptionMutation } from "../../../../features/practical-interview/api/useRetryInterviewRecordTranscriptionMutation";
import { getErrorDetails, userFacingErrorMessage } from "../../../../shared/api/errors";
import { routeConfig } from "../../../../shared/config/routes";
import { useLocale } from "../../../../shared/i18n";
import { Badge, Button, ButtonLink, Callout, Card, ErrorState, PageHeader } from "../../../../shared/ui/primitives";
import type { ReviewRecordDetail } from "../reviewModel";

/** Shown until the transcript is confirmed: pending, processing, or failed with a retry. */
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
  const failed = detail.isTranscriptFailed;
  const canRetry = failed && detail.canRetryTranscription;
  const lastAttempt = detail.transcriptLastAttemptAtLabel ?? detail.transcriptProcessingStartedAtLabel;
  const facts = [
    detail.interviewDateLabel ? { label: t("recordReview.interviewDate"), value: detail.interviewDateLabel } : null,
    detail.sourceAudioFileName ? { label: t("recordReview.recording"), value: detail.sourceAudioFileName } : null,
    lastAttempt ? { label: t("recordReview.lastAttempt"), value: lastAttempt } : null,
    detail.transcriptNextRetryAtLabel ? { label: t("recordReview.nextRetry"), value: detail.transcriptNextRetryAtLabel } : null,
    detail.transcriptRetryCount > 0 ? { label: t("recordReview.retries"), value: String(detail.transcriptRetryCount) } : null,
  ].filter((fact): fact is { label: string; value: string } => fact !== null);

  return (
    <div className="ui-page record-review">
      <PageHeader
        actions={
          <ButtonLink to={routeConfig.practicalInterviews.buildPath()} variant="ghost">
            {t("recordReview.backToRecords")}
          </ButtonLink>
        }
        description={failed ? t("recordReview.failedDescription") : t("recordReview.processingDescription")}
        title={detail.title}
      />

      <Card aria-labelledby="record-processing-title" className="record-processing" padded>
        <div className="record-processing__head">
          <h2 className="record-processing__title" id="record-processing-title">
            {failed ? t("recordReview.transcriptFailedTitle") : t("recordReview.transcribingTitle")}
          </h2>
          <Badge dot tone={failed ? "danger" : "accent"}>
            {failed ? t("recordReview.statusFailed") : t("recordReview.statusTranscribing")}
          </Badge>
        </div>
        <p className="record-processing__body">
          {failed
            ? detail.transcriptErrorMessage ?? detail.transcriptErrorLabel ?? t("recordReview.transcriptFailedBody")
            : t("recordReview.transcribingBody")}
        </p>
        {facts.length > 0 ? (
          <dl className="record-facts">
            {facts.map((fact) => (
              <div key={fact.label}>
                <dt>{fact.label}</dt>
                <dd>{fact.value}</dd>
              </div>
            ))}
          </dl>
        ) : null}
        <div className="record-processing__actions">
          {canRetry ? (
            <Button loading={retryTranscriptionMutation.isPending} onClick={() => void retryTranscriptionMutation.mutateAsync()} variant="primary">
              {t("recordReview.retryTranscription")}
            </Button>
          ) : null}
          <Button onClick={onRefresh} variant={canRetry ? "secondary" : "primary"}>
            {t("recordReview.refreshStatus")}
          </Button>
        </div>
      </Card>

      {failed ? (
        <Callout tone="accent">
          <p>{t("recordReview.audioKept")}</p>
        </Callout>
      ) : null}

      {retryTranscriptionMutation.isError ? (
        <ErrorState
          body={userFacingErrorMessage(retryTranscriptionMutation.error, t("recordReview.retryFailedBody"))}
          details={getErrorDetails(retryTranscriptionMutation.error)}
          title={t("recordReview.retryFailedTitle")}
        />
      ) : null}
    </div>
  );
}
