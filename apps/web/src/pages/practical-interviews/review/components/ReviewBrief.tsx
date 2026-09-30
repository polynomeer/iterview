import { useLocale } from "../../../../shared/i18n";
import { MetricCard } from "../../../../shared/ui/MetricCard";
import {
  deriveReviewSignals,
  localizeReviewPayloadText,
  type ReviewAnalysis,
  type ReviewInterviewerProfile,
  type ReviewModel,
  type ReviewQuestions,
  type ReviewTranscript,
} from "../reviewModel";

/** Replay readiness, lane priorities, provenance, and supporting payload counts. */
export function ReviewBrief({
  review,
  transcript,
  questions,
  analysis,
  interviewerProfile,
  applyTarget,
}: {
  review: ReviewModel;
  transcript: ReviewTranscript;
  questions: ReviewQuestions;
  analysis: ReviewAnalysis;
  interviewerProfile: ReviewInterviewerProfile;
  applyTarget: (target?: string | null, payload?: Record<string, string>) => void;
}) {
  const { t } = useLocale();
  const { primaryReviewLane, replayBlockerCount } = deriveReviewSignals(review, t);

  return (
    <section className="page-card practical-review-brief">
      <div className="section-heading">
        <div>
          <span className="page-card__label">{t("practicalReview.reviewBrief")}</span>
          <h2 className="page-card__title">{t("practicalReview.keepReplayContextAbove")}</h2>
        </div>
        <p className="page-card__body practical-review-brief__summary">
          {t("practicalReview.transcriptStaysPrimaryReplay")}
        </p>
      </div>
      <div className="practical-review-brief__summary-grid">
        <article className="practical-review-brief__summary-card">
          <span>{t("practicalReview.openFirst")}</span>
          <strong>{primaryReviewLane ? localizeReviewPayloadText(primaryReviewLane.summaryText, t) : t("practicalReview.noLanePriorityAvailable")}</strong>
        </article>
        <article className="practical-review-brief__summary-card">
          <span>{t("practicalReview.replayBlockers")}</span>
          <strong>
            {replayBlockerCount > 0
              ? t(
                  replayBlockerCount === 1
                    ? "practicalReview.clearBlockersBeforeReplayOne"
                    : "practicalReview.clearBlockersBeforeReplayOther",
                  { count: replayBlockerCount },
                )
              : t("practicalReview.replayCanStartOnce")}
          </strong>
        </article>
        <article className="practical-review-brief__summary-card">
          <span>{t("practicalReview.weakAnswerLoad")}</span>
          <strong>{t("practicalReview.weakAnswersNeedInspection", { count: review.weakAnswerCount })}</strong>
        </article>
      </div>
      <div className="practical-review-brief__grid">
        <section className="page-card page-card--inset practical-review-brief__card">
          <span className="page-card__label">{t("practicalReview.breadcrumbReplayReadiness")}</span>
          <h3 className="page-card__title">{localizeReviewPayloadText(review.replayReadiness.statusBadgeText, t)}</h3>
          <p className="page-card__body">{review.replayReadiness.statusSummary}</p>
          <div className="stats-grid">
            <MetricCard label={t("practicalReview.replayable")} value={String(review.replayReadiness.replayableQuestionCount)} />
            <MetricCard label={t("practicalReview.linked")} value={String(review.replayReadiness.linkedQuestionCount)} />
            <MetricCard label={t("practicalReview.threads")} tone="accent" value={String(review.replayReadiness.followUpThreadCount)} />
          </div>
          {review.replayReadiness.blockerDetails.length > 0 ? (
            <div className="stack-list">
              {review.replayReadiness.blockerDetails.slice(0, 2).map((blocker) => (
                <article className="list-item-card practical-blocker-card" key={blocker.id}>
                  <div className="list-item-card__content">
                    <div className="list-item-card__meta">
                      <span>{localizeReviewPayloadText(blocker.label, t)}</span>
                      <span>{localizeReviewPayloadText(blocker.severity, t)}</span>
                    </div>
                    <p className="list-item-card__body">{blocker.description}</p>
                  </div>
                </article>
              ))}
            </div>
          ) : null}
        </section>

        <section className="page-card page-card--inset practical-review-brief__card">
          <span className="page-card__label">{t("practicalReview.lanePriorities")}</span>
          <h3 className="page-card__title">{t("practicalReview.serverPrioritizedLanes")}</h3>
          <div className="stack-list">
            {review.laneItems.map((lane) => (
              <article
                className={`list-item-card practical-lane-card practical-lane-card--${lane.highlightVariant}`}
                key={lane.key}
              >
                <div className="list-item-card__content">
                  <div className="list-item-card__meta">
                    <span>{localizeReviewPayloadText(lane.badgeText, t)}</span>
                    <span>{localizeReviewPayloadText(lane.readiness, t)}</span>
                    <span>{t("practicalReview.laneNeedReviewCount", { count: lane.needsReviewCount })}</span>
                  </div>
                  <h3 className="list-item-card__title">{localizeReviewPayloadText(lane.summaryText, t)}</h3>
                  <p className="list-item-card__body">{localizeReviewPayloadText(lane.whyItMatters, t)}</p>
                </div>
                <div className="list-item-card__actions">
                  {lane.primaryActionLabel ? (
                    <button
                      className="secondary-button"
                      onClick={() =>
                        applyTarget(lane.primaryActionTarget, lane.primaryActionTargetPayload)
                      }
                      type="button"
                    >
                      {localizeReviewPayloadText(lane.primaryActionLabel, t)}
                    </button>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="page-card page-card--inset practical-review-brief__card">
          <span className="page-card__label">{t("practicalReview.provenance")}</span>
          <h3 className="page-card__title">{t("practicalReview.provenanceTitle")}</h3>
          <div className="stack-list">
            <article className="list-item-card">
              <div className="list-item-card__content">
                <div className="list-item-card__meta">
                  <span>{t("practicalReview.questionSource")}</span>
                  <span>{localizeReviewPayloadText(review.provenanceComparisonSummary.currentQuestionSource, t)}</span>
                </div>
                <p className="list-item-card__body">
                  {t("practicalReview.changedQuestionsFromDeterministic", { count: review.provenanceComparisonSummary.changedQuestionCountFromDeterministic })}
                </p>
              </div>
            </article>
            <article className="list-item-card">
              <div className="list-item-card__content">
                <div className="list-item-card__meta">
                  <span>{t("practicalReview.answerSource")}</span>
                  <span>{localizeReviewPayloadText(review.provenanceComparisonSummary.currentAnswerSource, t)}</span>
                </div>
                <p className="list-item-card__body">
                  {t("practicalReview.changedAnswersFromDeterministic", { count: review.provenanceComparisonSummary.changedAnswerCountFromDeterministic })}
                </p>
              </div>
            </article>
          </div>
        </section>

        <section className="page-card page-card--inset practical-review-brief__card">
          <span className="page-card__label">{t("practicalReview.supportingPayloads")}</span>
          <h3 className="page-card__title">{t("practicalReview.loadedContext")}</h3>
          <div className="stats-grid">
            <MetricCard label={t("practicalReview.transcriptRows")} value={String(transcript.segments.length)} />
            <MetricCard label={t("practicalReview.structuredQuestions")} value={String(questions.items.length)} />
            <MetricCard label={t("practicalReview.topics")} tone="muted" value={String(analysis.topicTags.length)} />
            <MetricCard label={t("practicalReview.interviewerProfile")} tone="accent" value={interviewerProfile ? t("practicalReview.ready") : t("practicalReview.missing")} />
          </div>
          {interviewerProfile ? (
            <div className="chip-list">
              {interviewerProfile.styleTags.map((tag) => (
                <span className="detail-chip detail-chip--accent" key={tag}>
                  {localizeReviewPayloadText(tag, t)}
                </span>
              ))}
            </div>
          ) : null}
        </section>
      </div>
    </section>
  );
}
