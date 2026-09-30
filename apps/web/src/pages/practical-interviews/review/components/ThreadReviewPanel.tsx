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
  const { locale } = useLocale();
  const isKorean = locale === "ko";

  return (
    <div className="page-stack">
      <span className="page-card__label">{isKorean ? "스레드" : "Threads"}</span>
      <h2 className="page-card__title">{isKorean ? "꼬리질문 체인과 리플레이 프리셋" : "Follow-up chains and replay presets"}</h2>
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
                  {isKorean ? `루트 #${thread.rootOrderIndex + 1}` : `Root #${thread.rootOrderIndex + 1}`}
                </p>
                <h3 className="page-card__title">{thread.rootText}</h3>
              </div>
              <div className="chip-list">
                {thread.weakQuestionCount > 0 ? (
                  <span className="detail-chip detail-chip--accent">{isKorean ? "약한 체인" : "Weak chain"}</span>
                ) : null}
                {thread.quantifiedQuestionCount > 0 ? (
                  <span className="detail-chip">{isKorean ? "수치화됨" : "Quantified"}</span>
                ) : null}
                {thread.structuredQuestionCount > 0 ? (
                  <span className="detail-chip">{isKorean ? "구조화됨" : "Structured"}</span>
                ) : null}
                {thread.tradeoffAwareQuestionCount > 0 ? (
                  <span className="detail-chip">{isKorean ? "트레이드오프 인식" : "Tradeoff-aware"}</span>
                ) : null}
                {thread.uncertainQuestionCount > 0 ? (
                  <span className="detail-chip detail-chip--accent">{isKorean ? "불확실" : "Uncertain"}</span>
                ) : null}
              </div>
            </div>
            <div className="practical-review-meta">
              <div className="practical-review-meta__row">
                <span className="practical-review-meta__label">{isKorean ? "권장 동작" : "Recommended action"}</span>
                <span className="practical-review-meta__value">
                  {thread.recommendedAction
                    ? localizeReviewPayloadText(thread.recommendedAction, isKorean)
                    : isKorean
                      ? "리뷰 계속"
                      : "Continue review"}
                </span>
              </div>
              {thread.structuringSources.length > 0 ? (
                <div className="practical-review-meta__row">
                  <span className="practical-review-meta__label">{isKorean ? "구조화 출처" : "Structuring sources"}</span>
                  <span className="practical-review-meta__value">
                    {thread.structuringSources.map((item) => localizeReviewPayloadText(item, isKorean)).join(" · ")}
                  </span>
                </div>
              ) : null}
            </div>
            <div className="stats-grid">
              <MetricCard label={isKorean ? "질문" : "Questions"} value={String(thread.questionIds.length)} />
              <MetricCard label={isKorean ? "꼬리질문" : "Follow-ups"} tone="muted" value={String(thread.followUpCount)} />
              <MetricCard label={isKorean ? "답변 완료" : "Answered"} tone="accent" value={String(thread.answeredQuestionCount)} />
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
                {isKorean ? "루트 질문 집중" : "Focus root question"}
              </button>
              {thread.threadRange ? (
                <button
                  className="secondary-button"
                  onClick={() => {
                    setSelectedThreadRootQuestionId(thread.id);
                    void playRange(thread.threadRange, isKorean ? `${thread.rootOrderIndex + 1}번 스레드` : `Thread ${thread.rootOrderIndex + 1}`);
                  }}
                  type="button"
                >
                  {isKorean ? "스레드 재생" : "Play thread"}
                </button>
              ) : null}
              {thread.replayLaunchPreset ? (
                <button
                  className="primary-button"
                  onClick={() => openReplayLauncher(thread.replayLaunchPreset)}
                  type="button"
                >
                  {localizeReviewPayloadText(thread.replayLaunchPreset.launchButtonLabel, isKorean)}
                </button>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
