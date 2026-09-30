import type { useCreateInterviewSessionMutation } from "../../../../features/interview/api/useCreateInterviewSessionMutation";
import { useLocale } from "../../../../shared/i18n";
import { MetricCard } from "../../../../shared/ui/MetricCard";
import {
  localizeReplayModeLabel,
  localizeReviewPayloadText,
  type ReplayPresetModel,
  type ReviewModel,
} from "../reviewModel";

/** Replay launcher shown once a replay preset has been opened. */
export function ReplayLaunchPanel({
  replayPreset,
  review,
  selectedReplayMode,
  setSelectedReplayMode,
  selectedQuestionCount,
  setSelectedQuestionCount,
  createReplayMutation,
  handleStartReplay,
  setReplayPreset,
}: {
  replayPreset: NonNullable<ReplayPresetModel>;
  review: ReviewModel;
  selectedReplayMode: string;
  setSelectedReplayMode: (mode: string) => void;
  selectedQuestionCount: number;
  setSelectedQuestionCount: (count: number) => void;
  createReplayMutation: ReturnType<typeof useCreateInterviewSessionMutation>;
  handleStartReplay: () => Promise<void>;
  setReplayPreset: (preset: ReplayPresetModel) => void;
}) {
  const { t } = useLocale();

  return (
    <section className="page-card practical-replay-launch">
      <div className="practical-replay-launch__hero">
        <div>
          <span className="page-card__label">{t("practicalReview.replayLaunch")}</span>
          <h2 className="page-card__title">{localizeReviewPayloadText(replayPreset.presetTitle, t)}</h2>
          <p className="page-card__body">{localizeReviewPayloadText(replayPreset.presetDescription, t)}</p>
        </div>
        <div className="chip-list">
          <span className="question-status-badge question-status-badge--accent">
            {localizeReviewPayloadText(review.replayReadiness.statusBadgeText, t)}
          </span>
          {review.replayReadiness.ready ? (
            <span className="question-status-badge question-status-badge--positive">
              {t("practicalReview.replayReady")}
            </span>
          ) : (
            <span className="question-status-badge question-status-badge--warning">
              {t("practicalReview.reviewBlockers")}
            </span>
          )}
        </div>
      </div>
      <div className="interview-session-layout">
        <div className="interview-session-layout__main">
          <section className="page-card page-card--inset">
            <span className="page-card__label">{t("practicalReview.preset")}</span>
            <div className="stats-grid">
              <MetricCard label={t("practicalReview.recommendedMode")} value={localizeReplayModeLabel(replayPreset.recommendedReplayModeLabel ?? t("practicalReview.replay"), t)} />
              <MetricCard label={t("practicalReview.seedQuestions")} tone="accent" value={String(replayPreset.seedQuestionIds.length)} />
              <MetricCard label={t("practicalReview.replayable")} tone="muted" value={String(review.replayReadiness.replayableQuestionCount)} />
            </div>
            <div className="form-grid">
              <label className="form-field">
                <span className="form-field__label">{t("practicalReview.replayMode")}</span>
                <select
                  className="form-input"
                  onChange={(event) => setSelectedReplayMode(event.target.value)}
                  value={selectedReplayMode}
                >
                  {replayPreset.availableReplayModes.map((mode) => (
                    <option key={mode} value={mode}>
                      {localizeReplayModeLabel(replayPreset.availableReplayModeLabels[mode] ?? mode, t)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="form-field">
                <span className="form-field__label">{t("practicalReview.questionCount")}</span>
                <input
                  className="form-input"
                  max={10}
                  min={1}
                  onChange={(event) => setSelectedQuestionCount(Number(event.target.value))}
                  type="number"
                  value={selectedQuestionCount}
                />
              </label>
            </div>
          </section>
        </div>
        <div className="interview-facet-panels">
          <section className="page-card page-card--inset">
            <span className="page-card__label">{t("practicalReview.readiness")}</span>
            <h3 className="page-card__title">{t("practicalReview.serverReadinessSummary")}</h3>
            <p className="page-card__body">{localizeReviewPayloadText(review.replayReadiness.statusSummary, t)}</p>
            {review.replayReadiness.blockerDetails.length > 0 && !review.replayReadiness.ready ? (
              <div className="stack-list">
                {review.replayReadiness.blockerDetails.map((detail) => (
                  <article className="list-item-card practical-blocker-card" key={detail.id}>
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
        </div>
      </div>
      <div className="page-card__actions">
        <button
          className="primary-button"
          disabled={!review.actionRecommendations.canReplay || createReplayMutation.isPending}
          onClick={() => {
            void handleStartReplay();
          }}
          type="button"
        >
          {createReplayMutation.isPending
            ? t("practicalReview.startingReplay")
            : localizeReviewPayloadText(replayPreset.launchButtonLabel, t)}
        </button>
        <button
          className="secondary-button"
          onClick={() => setReplayPreset(null)}
          type="button"
        >
          {t("practicalReview.close")}
        </button>
      </div>
    </section>
  );
}
