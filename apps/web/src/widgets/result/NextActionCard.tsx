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
      <div className="section-heading">
        <div>
          <p className="section-heading__eyebrow">Next step</p>
          <h2 className="page-card__title">What to do after this result</h2>
        </div>
      </div>
      <div className="result-next-action-card__signals">
        {progressStatusLabel ? (
          <article className="result-next-action-card__signal">
            <span>Status</span>
            <strong>{progressStatusLabel}</strong>
          </article>
        ) : null}
        {archiveDecisionLabel ? (
          <article className="result-next-action-card__signal">
            <span>Decision</span>
            <strong>{archiveDecisionLabel}</strong>
          </article>
        ) : null}
        {nextReviewLabel ? (
          <article className="result-next-action-card__signal">
            <span>Next review</span>
            <strong>{nextReviewLabel}</strong>
          </article>
        ) : null}
      </div>
      <div className="result-next-action-card__playbook">
        <div className="result-next-action-card__playbook-step">
          <strong>1. Re-read the weakest branch</strong>
          <span>Focus the dimension or feedback point with the least evidence before editing the whole answer.</span>
        </div>
        <div className="result-next-action-card__playbook-step">
          <strong>2. Decide retry vs. depth</strong>
          <span>Immediate retry for phrasing issues, follow-up tree exploration for weak source-of-truth issues.</span>
        </div>
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
