import type { ResultAnalysisModel } from "../../entities/result/model";

type DetailedFeedbackSectionProps = {
  result: ResultAnalysisModel;
};

function PointList({
  title,
  items,
  tone = "neutral",
}: {
  title: string;
  items: string[];
  tone?: "positive" | "neutral" | "warning";
}) {
  if (items.length === 0) {
    return null;
  }

  return (
    <article className={`feedback-card feedback-card--${tone === "warning" ? "improving" : tone}`}>
      <h3 className="list-item-card__title">{title}</h3>
      <ul className="feedback-bullet-list">
        {items.map((item, index) => (
          <li key={`${title}-${index}`}>{item}</li>
        ))}
      </ul>
    </article>
  );
}

export function DetailedFeedbackSection({ result }: DetailedFeedbackSectionProps) {
  const hasNarrative =
    Boolean(result.detailedFeedback) ||
    Boolean(result.strengthSummary) ||
    Boolean(result.weaknessSummary) ||
    Boolean(result.recommendedNextStep) ||
    result.strengthPoints.length > 0 ||
    result.improvementPoints.length > 0 ||
    result.missedPoints.length > 0;

  return (
    <section className="page-card result-analysis-section-card">
      <div className="section-heading">
        <div>
          <p className="section-heading__eyebrow">Detailed feedback</p>
          <h2 className="page-card__title">How to improve this answer</h2>
          <p className="page-card__body">
            Read this as the main improvement narrative, then use the smaller cards below as
            supporting evidence.
          </p>
        </div>
      </div>

      {!hasNarrative ? (
        <p className="page-card__body">Detailed analysis is not available for this attempt yet.</p>
      ) : (
        <div className="page-stack">
          {result.detailedFeedback ? (
            <div className="result-analysis-narrative">
              <p className="page-card__body">{result.detailedFeedback}</p>
              {(result.narrativeLocale || result.narrativeModelLabel) && (
                <div className="list-item-card__meta">
                  {result.narrativeLocale ? <span>{result.narrativeLocale.toUpperCase()}</span> : null}
                  {result.narrativeModelLabel ? <span>{result.narrativeModelLabel}</span> : null}
                </div>
              )}
            </div>
          ) : null}

          <div className="stack-list">
            {result.strengthSummary ? (
              <article className="feedback-card feedback-card--positive">
                <h3 className="list-item-card__title">Strength summary</h3>
                <p className="list-item-card__body">{result.strengthSummary}</p>
              </article>
            ) : null}
            {result.weaknessSummary ? (
              <article className="feedback-card feedback-card--improving">
                <h3 className="list-item-card__title">Weakness summary</h3>
                <p className="list-item-card__body">{result.weaknessSummary}</p>
              </article>
            ) : null}
            {result.recommendedNextStep ? (
              <article className="feedback-card feedback-card--neutral">
                <h3 className="list-item-card__title">Recommended next step</h3>
                <p className="list-item-card__body">{result.recommendedNextStep}</p>
              </article>
            ) : null}
          </div>

          <div className="stack-list">
            <PointList items={result.strengthPoints} title="What went well" tone="positive" />
            <PointList items={result.improvementPoints} title="What to improve" tone="warning" />
            <PointList items={result.missedPoints} title="What you missed" tone="neutral" />
          </div>
        </div>
      )}
    </section>
  );
}
