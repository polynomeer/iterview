import type { QuestionDetailModel } from "../../entities/question/model";

type ProgressSummaryCardProps = {
  progress: NonNullable<QuestionDetailModel["userProgressSummary"]>;
};

export function ProgressSummaryCard({ progress }: ProgressSummaryCardProps) {
  return (
    <section className="page-card">
      <div className="section-heading">
        <div>
          <p className="section-heading__eyebrow">Progress</p>
          <h2 className="page-card__title">Your current status on this question</h2>
        </div>
        <span className="section-heading__count section-heading__count--text">{progress.status}</span>
      </div>
      <div className="stats-grid">
        <article className="stat-tile">
          <p className="stat-tile__label">Attempts</p>
          <strong className="stat-tile__value">{progress.attemptsCount}</strong>
        </article>
        <article className="stat-tile">
          <p className="stat-tile__label">Best score</p>
          <strong className="stat-tile__value stat-tile__value--small">{progress.bestScoreLabel}</strong>
        </article>
        <article className="stat-tile stat-tile--wide">
          <p className="stat-tile__label">Last reviewed</p>
          <strong className="stat-tile__value stat-tile__value--small">{progress.lastReviewedLabel}</strong>
        </article>
        {progress.nextReviewLabel ? (
          <article className="stat-tile stat-tile--wide">
            <p className="stat-tile__label">Next review</p>
            <strong className="stat-tile__value stat-tile__value--small">{progress.nextReviewLabel}</strong>
          </article>
        ) : null}
        {progress.masteryLevelLabel ? (
          <article className="stat-tile">
            <p className="stat-tile__label">Mastery</p>
            <strong className="stat-tile__value stat-tile__value--small">{progress.masteryLevelLabel}</strong>
          </article>
        ) : null}
      </div>
    </section>
  );
}
