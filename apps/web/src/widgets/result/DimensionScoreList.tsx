import type { ResultDimensionModel } from "../../entities/result/model";

type DimensionScoreListProps = {
  dimensions: ResultDimensionModel[];
};

export function DimensionScoreList({ dimensions }: DimensionScoreListProps) {
  const numericValues = dimensions
    .map((dimension) => ({
      ...dimension,
      numericValue: Number(dimension.value),
    }))
    .filter((dimension) => !Number.isNaN(dimension.numericValue));
  const highestScore =
    numericValues.length > 0 ? Math.max(...numericValues.map((dimension) => dimension.numericValue)) : null;
  const lowestScore =
    numericValues.length > 0 ? Math.min(...numericValues.map((dimension) => dimension.numericValue)) : null;

  return (
    <section className="page-card">
      <div className="section-heading">
        <div>
          <p className="section-heading__eyebrow">Dimension scores</p>
          <h2 className="page-card__title">How the answer was evaluated</h2>
        </div>
      </div>
      <div className="stack-list">
        {dimensions.map((dimension) => (
          <article className="score-row" key={dimension.id}>
            <div className="score-row__content">
              <div className="score-row__heading">
                <span className="score-row__label">{dimension.label}</span>
                {dimension.value === `${lowestScore}` ? (
                  <span className="score-row__hint score-row__hint--warning">Weakest</span>
                ) : null}
                {dimension.value === `${highestScore}` && highestScore !== lowestScore ? (
                  <span className="score-row__hint score-row__hint--positive">Strongest</span>
                ) : null}
              </div>
              <div aria-hidden="true" className="score-row__meter">
                <span
                  className="score-row__meter-fill"
                  style={{ width: `${Math.max(0, Math.min(100, Number(dimension.value) || 0))}%` }}
                />
              </div>
            </div>
            <strong className="score-row__value">{dimension.value}</strong>
          </article>
        ))}
      </div>
    </section>
  );
}
