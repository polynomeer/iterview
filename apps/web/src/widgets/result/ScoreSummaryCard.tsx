import type { ResultAnalysisModel } from "../../entities/result/model";
import { ScoreBadge } from "../../shared/ui/ScoreBadge";

type ScoreSummaryCardProps = {
  result: ResultAnalysisModel;
};

export function ScoreSummaryCard({ result }: ScoreSummaryCardProps) {
  const summaryPoints = [
    { label: "Decision", value: result.archiveDecisionLabel ? `Route: ${result.archiveDecisionLabel}` : "Keep iterating" },
    { label: "Progress", value: result.progressStatusLabel ?? "Not labeled" },
    { label: "Next review", value: result.nextReviewLabel ?? "Retry immediately" },
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
        <div className="result-score-card__supporting">
          {summaryPoints.map((point) => (
            <article className="result-score-card__supporting-item" key={point.label}>
              <span>{point.label}</span>
              <strong>{point.value}</strong>
            </article>
          ))}
        </div>
      </div>
      <h2 className="result-score-card__title">{result.evaluationResult}</h2>
      <p className="result-score-card__subtitle">{result.questionTitle}</p>
      <p className="result-score-card__body">
        Use this verdict as a branch decision, not a final grade. The next iteration should target the weakest
        reasoning step instead of rewriting everything.
      </p>
      <div className="result-score-card__chips">
        <span className="detail-chip">Question verdict</span>
        {result.progressStatusLabel ? <span className="detail-chip detail-chip--accent">{result.progressStatusLabel}</span> : null}
      </div>
    </section>
  );
}
