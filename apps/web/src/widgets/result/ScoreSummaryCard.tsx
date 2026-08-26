import type { ResultAnalysisModel } from "../../entities/result/model";
import { ScoreBadge } from "../../shared/ui/ScoreBadge";

type ScoreSummaryCardProps = {
  result: ResultAnalysisModel;
};

export function ScoreSummaryCard({ result }: ScoreSummaryCardProps) {
  const summaryPoints = [
    result.archiveDecisionLabel ? `Route ${result.archiveDecisionLabel}` : "Keep iterating",
    result.progressStatusLabel ?? "Progress not labeled",
    result.nextReviewLabel ? `Review ${result.nextReviewLabel}` : "Retry immediately",
  ];

  return (
    <section className="result-score-card result-score-card--workspace">
      <div className="result-score-card__topline">
        <span className="page-card__label">Overall score</span>
        <span className="result-score-card__eyebrow-pill">Evaluation readout</span>
      </div>
      <p className="result-score-card__kicker">Interview evaluation</p>
      <div className="result-score-card__hero">
        <div className="result-score-card__value">
          <ScoreBadge
            label="Score"
            tone={result.evaluationResult === "PASS" ? "positive" : "neutral"}
            value={result.totalScore}
          />
        </div>
        <div className="result-score-card__summary-row" role="list" aria-label="Score summary">
          {summaryPoints.map((point) => (
            <span className="result-score-card__summary-item" key={point} role="listitem">
              {point}
            </span>
          ))}
        </div>
      </div>
      <h2 className="result-score-card__title">{result.evaluationResult}</h2>
      <p className="result-score-card__subtitle">{result.questionTitle}</p>
      <p className="result-score-card__body">
        Use this verdict as a branch decision, not a final grade. The next iteration should target the weakest
        reasoning step instead of rewriting everything.
      </p>
      <div className="result-score-card__principles" role="list" aria-label="Score card principles">
        <span role="listitem">Read the score as routing information, not as the final outcome.</span>
        <span role="listitem">Target the weakest reasoning step before rewriting the full answer.</span>
      </div>
    </section>
  );
}
