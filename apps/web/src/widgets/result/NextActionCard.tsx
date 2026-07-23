import { Link } from "react-router-dom";

type NextActionCardProps = {
  progressStatusLabel: string | null;
  archiveDecisionLabel: string | null;
  nextReviewLabel: string | null;
  archivePath: string;
  questionPath: string;
  answerPath: string;
};

export function NextActionCard({
  progressStatusLabel,
  archiveDecisionLabel,
  nextReviewLabel,
  archivePath,
  questionPath,
  answerPath,
}: NextActionCardProps) {
  const showArchiveAction = archiveDecisionLabel?.toLowerCase().includes("archive") ?? false;

  return (
    <section className="page-card">
      <div className="section-heading">
        <div>
          <p className="section-heading__eyebrow">Next step</p>
          <h2 className="page-card__title">What to do after this result</h2>
        </div>
      </div>
      <div className="stack-list">
        {progressStatusLabel ? (
          <article className="list-item-card">
            <div className="list-item-card__content">
              <div className="list-item-card__meta">
                <span>Status</span>
              </div>
              <h3 className="list-item-card__title">{progressStatusLabel}</h3>
            </div>
          </article>
        ) : null}
        {archiveDecisionLabel ? (
          <article className="list-item-card">
            <div className="list-item-card__content">
              <div className="list-item-card__meta">
                <span>Decision</span>
              </div>
              <h3 className="list-item-card__title">{archiveDecisionLabel}</h3>
            </div>
          </article>
        ) : null}
        {nextReviewLabel ? (
          <article className="list-item-card">
            <div className="list-item-card__content">
              <div className="list-item-card__meta">
                <span>Next review</span>
              </div>
              <h3 className="list-item-card__title">{nextReviewLabel}</h3>
            </div>
          </article>
        ) : null}
      </div>
      <div className="page-card__actions">
        <Link className="secondary-button" to={questionPath}>
          Go back to question
        </Link>
        <Link className="secondary-button" to={answerPath}>
          Revise answer
        </Link>
        {nextReviewLabel ? (
          <span className="secondary-button secondary-button--static">
            Retry later
          </span>
        ) : null}
        {showArchiveAction ? (
          <Link className="primary-button" to={archivePath}>
            Go to archive
          </Link>
        ) : (
          <Link className="primary-button" to={answerPath}>
            Try this question again
          </Link>
        )}
      </div>
    </section>
  );
}
