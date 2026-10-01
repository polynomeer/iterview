import type { useCreateInterviewSessionMutation } from "../../../../features/interview/api/useCreateInterviewSessionMutation";
import type { useConfirmInterviewRecordMutation } from "../../../../features/practical-interview/api/useConfirmInterviewRecordMutation";
import type { useUpdateInterviewReviewMutation } from "../../../../features/practical-interview/api/useUpdateInterviewReviewMutation";
import { getErrorDetails, userFacingErrorMessage } from "../../../../shared/api/errors";
import { routeConfig } from "../../../../shared/config/routes";
import { useLocale } from "../../../../shared/i18n";
import { Badge, Button, ButtonLink, Callout, Card, ErrorState, PageHeader, Stat } from "../../../../shared/ui/primitives";
import { interviewTypeLabelKey } from "../../interviewTypes";
import { localizeReviewPayloadText, type ReplayPresetModel, type ReviewModel, type ReviewRecordDetail } from "../reviewModel";

/** Page heading, the facts of the interview, and the two record-level actions: practice it again and confirm. */
export function ReviewSummary({
  detail,
  review,
  dirtyEditCount,
  updateReviewMutation,
  confirmMutation,
  createReplayMutation,
  handleConfirm,
  openReplayLauncher,
}: {
  detail: ReviewRecordDetail;
  review: ReviewModel;
  dirtyEditCount: number;
  updateReviewMutation: ReturnType<typeof useUpdateInterviewReviewMutation>;
  confirmMutation: ReturnType<typeof useConfirmInterviewRecordMutation>;
  createReplayMutation: ReturnType<typeof useCreateInterviewSessionMutation>;
  handleConfirm: () => Promise<void>;
  openReplayLauncher: (preset: ReplayPresetModel) => void;
}) {
  const { t } = useLocale();
  const { actionRecommendations: actions } = review;
  const typeKey = interviewTypeLabelKey(detail.interviewType);
  const confirmedAt = review.confirmedAtLabel ?? detail.confirmedAtLabel;
  const summary = review.overallSummary ?? detail.overallSummary ?? detail.aiEnrichedSummary ?? detail.deterministicSummary;
  const facts = [detail.interviewDateLabel, typeKey ? t(typeKey) : null, detail.linkedResumeVersionId ? t("recordReview.resumeLinked") : null].filter(Boolean);
  const actionError = updateReviewMutation.error ?? confirmMutation.error ?? createReplayMutation.error;

  return (
    <>
      <PageHeader
        actions={
          <>
            <ButtonLink to={routeConfig.practicalInterviews.buildPath()} variant="ghost">
              {t("recordReview.backToRecords")}
            </ButtonLink>
            {!confirmedAt ? (
              <Button
                disabled={dirtyEditCount > 0 || !actions.canConfirm}
                loading={confirmMutation.isPending}
                onClick={() => void handleConfirm()}
              >
                {t("recordReview.confirm")}
              </Button>
            ) : null}
            {actions.canReplay && review.replayLaunchPreset ? (
              <Button icon="interview" onClick={() => openReplayLauncher(review.replayLaunchPreset)} variant="primary">
                {t("recordReview.practiceAgain")}
              </Button>
            ) : null}
          </>
        }
        description={
          <span className="record-review__facts">
            {facts.map((fact) => (
              <span key={fact}>{fact}</span>
            ))}
            {confirmedAt ? (
              <Badge dot tone="success">
                {t("recordReview.confirmedAt", { date: confirmedAt })}
              </Badge>
            ) : (
              <Badge dot tone="warning">
                {t("recordReview.notConfirmed")}
              </Badge>
            )}
          </span>
        }
        title={detail.title}
      />

      <Card aria-label={t("recordReview.summary")} className="record-summary" padded>
        {summary ? <p className="record-summary__text">{summary}</p> : null}
        <div className="record-summary__stats">
          <Stat label={t("recordReview.statQuestions")} value={review.totalQuestionCount} />
          <Stat label={t("recordReview.statFollowUps")} value={review.followUpQuestionCount} />
          <Stat label={t("recordReview.statWeakAnswers")} tone={review.weakAnswerCount > 0 ? "danger" : "neutral"} value={review.weakAnswerCount} />
          <Stat label={t("recordReview.statReplayable")} value={review.replayReadiness.replayableQuestionCount} />
        </div>
      </Card>

      {!confirmedAt && !actions.canConfirm && actions.blockingReasonDetails.length > 0 ? (
        <Callout title={t("recordReview.beforeConfirming")} tone="warning">
          <ul className="record-review__reasons">
            {actions.blockingReasonDetails.map((reason) => (
              <li key={reason.id}>
                <strong>{localizeReviewPayloadText(reason.label, t)}</strong> {reason.description}
              </li>
            ))}
          </ul>
        </Callout>
      ) : null}

      {confirmMutation.isSuccess || updateReviewMutation.isSuccess ? (
        <Callout tone="success">
          <p>{confirmMutation.isSuccess ? t("recordReview.confirmedNotice") : t("recordReview.editsSavedNotice")}</p>
        </Callout>
      ) : null}

      {actionError ? (
        <ErrorState
          body={userFacingErrorMessage(actionError, t("recordReview.actionFailedBody"))}
          details={getErrorDetails(actionError)}
          title={t("recordReview.actionFailedTitle")}
        />
      ) : null}
    </>
  );
}
