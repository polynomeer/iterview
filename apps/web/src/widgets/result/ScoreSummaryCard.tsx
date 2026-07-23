import type { ResultAnalysisModel } from "../../entities/result/model";
import { ScoreBadge } from "../../shared/ui/ScoreBadge";

type ScoreSummaryCardProps = {
  result: ResultAnalysisModel;
};

export function ScoreSummaryCard({ result }: ScoreSummaryCardProps) {
  return (
    <section className="result-score-card">
      <span className="page-card__label">Overall score</span>
      <div className="result-score-card__value">
        <ScoreBadge
          label="Score"
          tone={result.evaluationResult === "PASS" ? "positive" : "neutral"}
          value={result.totalScore}
        />
      </div>
      <h2 className="result-score-card__title">{result.evaluationResult}</h2>
      <p className="result-score-card__subtitle">{result.questionTitle}</p>
    </section>
  );
}
