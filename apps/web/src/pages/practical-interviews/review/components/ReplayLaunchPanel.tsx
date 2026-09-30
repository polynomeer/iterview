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
  const { locale } = useLocale();
  const isKorean = locale === "ko";

  return (
    <section className="page-card practical-replay-launch">
      <div className="practical-replay-launch__hero">
        <div>
          <span className="page-card__label">{isKorean ? "리플레이 시작" : "Replay launch"}</span>
          <h2 className="page-card__title">{localizeReviewPayloadText(replayPreset.presetTitle, isKorean)}</h2>
          <p className="page-card__body">{localizeReviewPayloadText(replayPreset.presetDescription, isKorean)}</p>
        </div>
        <div className="chip-list">
          <span className="question-status-badge question-status-badge--accent">
            {localizeReviewPayloadText(review.replayReadiness.statusBadgeText, isKorean)}
          </span>
          {review.replayReadiness.ready ? (
            <span className="question-status-badge question-status-badge--positive">
              {isKorean ? "리플레이 준비 완료" : "Replay ready"}
            </span>
          ) : (
            <span className="question-status-badge question-status-badge--warning">
              {isKorean ? "리뷰 차단 요인" : "Review blockers"}
            </span>
          )}
        </div>
      </div>
      <div className="interview-session-layout">
        <div className="interview-session-layout__main">
          <section className="page-card page-card--inset">
            <span className="page-card__label">{isKorean ? "프리셋" : "Preset"}</span>
            <div className="stats-grid">
              <MetricCard label={isKorean ? "권장 모드" : "Recommended mode"} value={localizeReplayModeLabel(replayPreset.recommendedReplayModeLabel ?? (isKorean ? "리플레이" : "Replay"), isKorean)} />
              <MetricCard label={isKorean ? "시드 질문" : "Seed questions"} tone="accent" value={String(replayPreset.seedQuestionIds.length)} />
              <MetricCard label={isKorean ? "리플레이 가능" : "Replayable"} tone="muted" value={String(review.replayReadiness.replayableQuestionCount)} />
            </div>
            <div className="form-grid">
              <label className="form-field">
                <span className="form-field__label">{isKorean ? "리플레이 모드" : "Replay mode"}</span>
                <select
                  className="form-input"
                  onChange={(event) => setSelectedReplayMode(event.target.value)}
                  value={selectedReplayMode}
                >
                  {replayPreset.availableReplayModes.map((mode) => (
                    <option key={mode} value={mode}>
                      {localizeReplayModeLabel(replayPreset.availableReplayModeLabels[mode] ?? mode, isKorean)}
                    </option>
                  ))}
                </select>
              </label>
              <label className="form-field">
                <span className="form-field__label">{isKorean ? "질문 수" : "Question count"}</span>
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
            <span className="page-card__label">{isKorean ? "준비 상태" : "Readiness"}</span>
            <h3 className="page-card__title">{isKorean ? "서버 준비 상태 요약" : "Server readiness summary"}</h3>
            <p className="page-card__body">{localizeReviewPayloadText(review.replayReadiness.statusSummary, isKorean)}</p>
            {review.replayReadiness.blockerDetails.length > 0 && !review.replayReadiness.ready ? (
              <div className="stack-list">
                {review.replayReadiness.blockerDetails.map((detail) => (
                  <article className="list-item-card practical-blocker-card" key={detail.id}>
                    <div className="list-item-card__content">
                      <div className="list-item-card__meta">
                        <span>{localizeReviewPayloadText(detail.label, isKorean)}</span>
                        <span>{localizeReviewPayloadText(detail.severity, isKorean)}</span>
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
            ? isKorean
              ? "리플레이 시작 중..."
              : "Starting replay..."
            : localizeReviewPayloadText(replayPreset.launchButtonLabel, isKorean)}
        </button>
        <button
          className="secondary-button"
          onClick={() => setReplayPreset(null)}
          type="button"
        >
          {isKorean ? "닫기" : "Close"}
        </button>
      </div>
    </section>
  );
}
