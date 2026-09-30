import type { useCreateInterviewSessionMutation } from "../../../../features/interview/api/useCreateInterviewSessionMutation";
import type { useConfirmInterviewRecordMutation } from "../../../../features/practical-interview/api/useConfirmInterviewRecordMutation";
import type { useUpdateInterviewReviewMutation } from "../../../../features/practical-interview/api/useUpdateInterviewReviewMutation";
import { getErrorDetails, userFacingErrorMessage } from "../../../../shared/api/errors";
import { useLocale } from "../../../../shared/i18n";
import { ErrorStateCard } from "../../../../shared/ui/ErrorStateCard";
import { FeedbackNotice } from "../../../../shared/ui/FeedbackNotice";
import { SectionPanel } from "../../../../shared/ui/layout";
import {
  deriveReviewSignals,
  localizeReviewPayloadText,
  type ReplayPresetModel,
  type ReviewModel,
  type ReviewRecordDetail,
} from "../reviewModel";

/** Review overview surface plus the review insight panel at the top of the workspace. */
export function ReviewOverview({
  detail,
  review,
  dirtyEditCount,
  updateReviewMutation,
  confirmMutation,
  createReplayMutation,
  applyTarget,
  handleConfirm,
  openReplayLauncher,
}: {
  detail: ReviewRecordDetail;
  review: ReviewModel;
  dirtyEditCount: number;
  updateReviewMutation: ReturnType<typeof useUpdateInterviewReviewMutation>;
  confirmMutation: ReturnType<typeof useConfirmInterviewRecordMutation>;
  createReplayMutation: ReturnType<typeof useCreateInterviewSessionMutation>;
  applyTarget: (target?: string | null, payload?: Record<string, string>) => void;
  handleConfirm: () => Promise<void>;
  openReplayLauncher: (preset: ReplayPresetModel) => void;
}) {
  const { locale, t } = useLocale();
  const { laneNeedsReviewTotal, primaryReviewLane, replayBlockerCount, reviewSignal } =
    deriveReviewSignals(review, t);

  return (
    <>
      <section className="practical-review-workspace-surface practical-review-layout__overview">
        <div className="practical-review-workspace-surface__header">
          <div className="practical-review-workspace-surface__intro">
            <div className="practical-review-workspace-surface__eyebrow-row">
              <p className="practical-review-workspace-surface__breadcrumbs">
                <span>{t("practicalReview.breadcrumbImportedInterview")}</span>
                <span>/</span>
                <span>{t("practicalReview.breadcrumbRecoveryLanes")}</span>
                <span>/</span>
                <span>{t("practicalReview.breadcrumbReplayReadiness")}</span>
              </p>
            <span className="detail-chip">{t("practicalReview.reviewStage")}</span>
            <span className="question-status-badge question-status-badge--accent">
                {localizeReviewPayloadText(detail.structuringStageLabel, t)}
            </span>
            </div>
            <span className="page-card__label">{t("practicalReview.reviewOverviewLabel")}</span>
            <h2 className="practical-review-workspace-surface__title">
              {review.overallSummary ?? detail.overallSummary ?? detail.title}
            </h2>
            <p className="practical-review-workspace-surface__body">
              {detail.aiEnrichedSummary ??
                detail.deterministicSummary ??
                t("practicalReview.overviewFallbackSummary")}
            </p>
          </div>
          <div className="practical-review-workspace-surface__stats">
            <article className="practical-review-workspace-surface__stat">
              <span>{t("practicalReview.statSegments")}</span>
              <strong>{review.totalSegmentCount}</strong>
            </article>
            <article className="practical-review-workspace-surface__stat">
              <span>{t("practicalReview.statQuestions")}</span>
              <strong>{review.totalQuestionCount}</strong>
            </article>
            <article className="practical-review-workspace-surface__stat">
              <span>{t("practicalReview.statLanesNeedingReview")}</span>
              <strong>{laneNeedsReviewTotal}</strong>
            </article>
            <article className="practical-review-workspace-surface__stat">
              <span>{t("practicalReview.statWeakAnswers")}</span>
              <strong>{review.weakAnswerCount}</strong>
            </article>
          </div>
        </div>
        <div className="practical-review-workspace-surface__chips">
          <span
            className={`question-status-badge ${
              review.requiresConfirmation
                ? "question-status-badge--warning"
                : "question-status-badge--positive"
            }`}
          >
            {review.requiresConfirmation
              ? t("practicalReview.confirmationRequired")
              : t("practicalReview.readyToConfirm")}
          </span>
          <span className="detail-chip">{t("practicalReview.changedQuestions", { count: review.changedQuestionCount })}</span>
          <span className="detail-chip">{t("practicalReview.followUps", { count: review.followUpQuestionCount })}</span>
          {detail.confirmedAtLabel ? (
            <span className="question-status-badge question-status-badge--neutral">
              {t("practicalReview.confirmedAt", { date: detail.confirmedAtLabel })}
            </span>
          ) : null}
        </div>
        <div className="practical-review-workspace-surface__guidance">
          <article className="practical-review-workspace-surface__guidance-card">
            <span>{t("practicalReview.reviewRuleLabel")}</span>
            <strong>
              {t("practicalReview.reviewRuleBody")}
            </strong>
          </article>
          <article className="practical-review-workspace-surface__guidance-card">
            <span>{t("practicalReview.nextRecoveryLabel")}</span>
            <strong>
              {primaryReviewLane
                ? t("practicalReview.nextRecoveryLane", {
                    lane: localizeReviewPayloadText(primaryReviewLane.badgeText, t),
                    reason:
                      locale === "ko"
                        ? localizeReviewPayloadText(primaryReviewLane.whyItMatters, t)
                        : primaryReviewLane.whyItMatters.toLowerCase(),
                  })
                : t("practicalReview.nextRecoveryFallback")}
            </strong>
          </article>
          <article className="practical-review-workspace-surface__guidance-card">
            <span>{t("practicalReview.exitRuleLabel")}</span>
            <strong>{t("practicalReview.exitRuleBody")}</strong>
          </article>
        </div>
        {(updateReviewMutation.isSuccess || confirmMutation.isSuccess) && (
          <FeedbackNotice
            message={
              confirmMutation.isSuccess
                ? t("practicalReview.reviewConfirmedNotice")
                : t("practicalReview.editsAppliedNotice")
            }
            tone="success"
          />
        )}
        {(updateReviewMutation.isError || confirmMutation.isError || createReplayMutation.isError) && (
          <ErrorStateCard
            body={
              userFacingErrorMessage(
                updateReviewMutation.error ?? confirmMutation.error ?? createReplayMutation.error,
                t("practicalReview.reviewActionFailedBody"),
              )
            }
            details={getErrorDetails(
              updateReviewMutation.error ?? confirmMutation.error ?? createReplayMutation.error,
            )}
            title={t("practicalReview.reviewActionFailedTitle")}
          />
        )}
        <div className="page-card__actions">
          <button
            className="primary-button"
            onClick={() =>
              applyTarget(
                review.actionRecommendations.primaryActionTarget,
                review.actionRecommendations.primaryActionTargetPayload,
              )
            }
            type="button"
          >
            {review.actionRecommendations.primaryActionLabel
              ? localizeReviewPayloadText(review.actionRecommendations.primaryActionLabel, t)
              : t("practicalReview.continueReview")}
          </button>
          <button
            className="secondary-button"
            disabled={
              dirtyEditCount > 0 ||
              !review.actionRecommendations.canConfirm ||
              confirmMutation.isPending
            }
            onClick={() => {
              void handleConfirm();
            }}
            type="button"
          >
            {confirmMutation.isPending ? t("practicalReview.confirming") : t("practicalReview.confirmReview")}
          </button>
          {review.actionRecommendations.canReplay && review.replayLaunchPreset ? (
            <button
              className="secondary-button"
              onClick={() => openReplayLauncher(review.replayLaunchPreset)}
              type="button"
            >
              {localizeReviewPayloadText(review.replayLaunchPreset.launchButtonLabel, t)}
            </button>
          ) : null}
        </div>
        {!review.actionRecommendations.canConfirm ? (
          <div className="stack-list">
            {review.actionRecommendations.blockingReasonDetails.map((detail) => (
              <article className="list-item-card" key={detail.id}>
                <div className="list-item-card__content">
                  <div className="list-item-card__meta">
                    <span>{localizeReviewPayloadText(detail.label, t)}</span>
                    <span>{localizeReviewPayloadText(detail.severity, t)}</span>
                  </div>
                  <p className="list-item-card__body">{detail.description}</p>
                </div>
              </article>
            ))}
          </div>
        ) : null}
      </section>

      <SectionPanel className="practical-review-insight-surface" variant="muted">
        <div className="practical-review-insight-surface__header">
          <div>
            <span className="page-card__label">{t("practicalReview.insightLabel")}</span>
            <h2 className="page-card__title">{t("practicalReview.insightTitle")}</h2>
            <p className="page-card__body">
              {t("practicalReview.insightBody")}
            </p>
          </div>
          <span className="detail-chip detail-chip--accent">{reviewSignal}</span>
        </div>
        <div className="practical-review-insight-surface__stats">
          <article>
            <span>{t("practicalReview.primaryLaneLabel")}</span>
            <strong>{primaryReviewLane ? localizeReviewPayloadText(primaryReviewLane.badgeText, t) : t("practicalReview.noLane")}</strong>
            <p>
              {primaryReviewLane
                ? t(
                    primaryReviewLane.needsReviewCount === 1
                      ? "practicalReview.laneNeedsReviewOne"
                      : "practicalReview.laneNeedsReviewOther",
                    { count: primaryReviewLane.needsReviewCount },
                  )
                : t("practicalReview.noPrioritizedLane")}
            </p>
          </article>
          <article>
            <span>{t("practicalReview.replayStateLabel")}</span>
            <strong>{replayBlockerCount > 0 ? localizeReviewPayloadText(review.replayReadiness.statusBadgeText, t) : t("practicalReview.replayClear")}</strong>
            <p>{replayBlockerCount > 0
                ? t(replayBlockerCount === 1 ? "practicalReview.replayBlockersOne" : "practicalReview.replayBlockersOther", {
                    count: replayBlockerCount,
                  })
                : t("practicalReview.replayCanStart")}</p>
          </article>
          <article>
            <span>{t("practicalReview.weakAnswerLoadLabel")}</span>
            <strong>{review.weakAnswerCount}</strong>
            <p>{t("practicalReview.weakAnswerLoadBody")}</p>
          </article>
        </div>
        <div className="practical-review-insight-surface__lanes">
          <div className="practical-review-insight-surface__lane">
            <strong>{t("practicalReview.stabilizeInterpretationTitle")}</strong>
            <span>{t("practicalReview.stabilizeInterpretationBody")}</span>
          </div>
          <div className="practical-review-insight-surface__lane">
            <strong>{t("practicalReview.recheckReplayabilityTitle")}</strong>
            <span>{t("practicalReview.recheckReplayabilityBody")}</span>
          </div>
          <div className="practical-review-insight-surface__lane">
            <strong>{t("practicalReview.recoverWeakestAnswerTitle")}</strong>
            <span>{t("practicalReview.recoverWeakestAnswerBody")}</span>
          </div>
        </div>
      </SectionPanel>
    </>
  );
}
