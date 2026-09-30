import { useLocale } from "../../../../shared/i18n";
import { MetricCard } from "../../../../shared/ui/MetricCard";
import {
  localizeReviewPayloadText,
  type PlayRange,
  type ReplayPresetModel,
  type ReviewModel,
} from "../reviewModel";

/** Thread lane: follow-up chains with replay and preset launch actions. */
export function ThreadReviewPanel({
  review,
  selectedThreadRootQuestionId,
  setSelectedThreadRootQuestionId,
  jumpToQuestion,
  playRange,
  openReplayLauncher,
}: {
  review: ReviewModel;
  selectedThreadRootQuestionId: string | null;
  setSelectedThreadRootQuestionId: (threadRootQuestionId: string | null) => void;
  jumpToQuestion: (targetQuestionId: string | null) => void;
  playRange: PlayRange;
  openReplayLauncher: (preset: ReplayPresetModel) => void;
}) {
  const { t } = useLocale();

  return (
    <div className="page-stack">
      <span className="page-card__label">{t("practicalReviewPanels.threads")}</span>
      <h2 className="page-card__title">{t("practicalReviewPanels.followUpChainsReplay")}</h2>
      <div className="stack-list">
        {review.followUpThreads.map((thread) => (
          <article
            className={`page-card page-card--inset practical-thread-row${selectedThreadRootQuestionId === thread.id ? " practical-thread-row--selected" : ""}`}
            id={`practical-thread-${thread.id}`}
            key={thread.id}
          >
            <div className="section-heading">
              <div>
                <p className="section-heading__eyebrow">
                  {t("practicalReviewPanels.rootLabel", { number: thread.rootOrderIndex + 1 })}
                </p>
                <h3 className="page-card__title">{thread.rootText}</h3>
              </div>
              <div className="chip-list">
                {thread.weakQuestionCount > 0 ? (
                  <span className="detail-chip detail-chip--accent">{t("practicalReviewPanels.weakChain")}</span>
                ) : null}
                {thread.quantifiedQuestionCount > 0 ? (
                  <span className="detail-chip">{t("practicalReviewPanels.quantified")}</span>
                ) : null}
                {thread.structuredQuestionCount > 0 ? (
                  <span className="detail-chip">{t("practicalReviewPanels.structured")}</span>
                ) : null}
                {thread.tradeoffAwareQuestionCount > 0 ? (
                  <span className="detail-chip">{t("practicalReviewPanels.tradeoffAware")}</span>
                ) : null}
                {thread.uncertainQuestionCount > 0 ? (
                  <span className="detail-chip detail-chip--accent">{t("practicalReviewPanels.uncertain")}</span>
                ) : null}
              </div>
            </div>
            <div className="practical-review-meta">
              <div className="practical-review-meta__row">
                <span className="practical-review-meta__label">{t("practicalReviewPanels.recommendedAction")}</span>
                <span className="practical-review-meta__value">
                  {thread.recommendedAction
                    ? localizeReviewPayloadText(thread.recommendedAction, t)
                    : t("practicalReviewPanels.continueReview")}
                </span>
              </div>
              {thread.structuringSources.length > 0 ? (
                <div className="practical-review-meta__row">
                  <span className="practical-review-meta__label">{t("practicalReviewPanels.structuringSources")}</span>
                  <span className="practical-review-meta__value">
                    {thread.structuringSources.map((item) => localizeReviewPayloadText(item, t)).join(" · ")}
                  </span>
                </div>
              ) : null}
            </div>
            <div className="stats-grid">
              <MetricCard label={t("practicalReviewPanels.questions")} value={String(thread.questionIds.length)} />
              <MetricCard label={t("practicalReviewPanels.followUps")} tone="muted" value={String(thread.followUpCount)} />
              <MetricCard label={t("practicalReviewPanels.answered")} tone="accent" value={String(thread.answeredQuestionCount)} />
            </div>
            <div className="page-card__actions">
              <button
                className="secondary-button"
                onClick={() => {
                  setSelectedThreadRootQuestionId(thread.id);
                  jumpToQuestion(thread.id);
                }}
                type="button"
              >
                {t("practicalReviewPanels.focusRootQuestion")}
              </button>
              {thread.threadRange ? (
                <button
                  className="secondary-button"
                  onClick={() => {
                    setSelectedThreadRootQuestionId(thread.id);
                    void playRange(thread.threadRange, t("practicalReviewPanels.threadLabel", { number: thread.rootOrderIndex + 1 }));
                  }}
                  type="button"
                >
                  {t("practicalReviewPanels.playThread")}
                </button>
              ) : null}
              {thread.replayLaunchPreset ? (
                <button
                  className="primary-button"
                  onClick={() => openReplayLauncher(thread.replayLaunchPreset)}
                  type="button"
                >
                  {localizeReviewPayloadText(thread.replayLaunchPreset.launchButtonLabel, t)}
                </button>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
