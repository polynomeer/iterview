import type { ResultDimensionModel } from "../../entities/result/model";

type DimensionScoreListProps = {
  dimensions: ResultDimensionModel[];
};

export function DimensionScoreList({ dimensions }: DimensionScoreListProps) {
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
            <span className="score-row__label">{dimension.label}</span>
            <strong className="score-row__value">{dimension.value}</strong>
          </article>
        ))}
      </div>
    </section>
  );
}
