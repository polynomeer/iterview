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
    <section className="page-card result-next-action-card">
      <div className="result-next-action-card__topline">
        <span className="page-card__label">Next step</span>
        <span className="question-status-badge question-status-badge--accent">Action lane</span>
      </div>
      <h2 className="page-card__title">What to do after this result</h2>
      <p className="page-card__body">
        Choose one path only: immediate revision, later retry, or archive review after the
        answer is stable enough.
      </p>
      <div className="result-next-action-card__summary-row" role="list" aria-label="Next action summary">
        {progressStatusLabel ? (
          <span className="result-next-action-card__summary-item" role="listitem">{`Status ${progressStatusLabel}`}</span>
        ) : null}
        {archiveDecisionLabel ? (
          <span className="result-next-action-card__summary-item result-next-action-card__summary-item--accent" role="listitem">
            {`Decision ${archiveDecisionLabel}`}
          </span>
        ) : null}
        {nextReviewLabel ? (
          <span className="result-next-action-card__summary-item" role="listitem">{`Review ${nextReviewLabel}`}</span>
        ) : null}
      </div>
      <div className="result-next-action-card__principles" role="list" aria-label="Next action principles">
        <span role="listitem">Re-read the weakest branch before editing the whole answer.</span>
        <span role="listitem">Use immediate retry for phrasing issues and follow-up depth for thin evidence.</span>
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
