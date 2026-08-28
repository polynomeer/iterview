import type { ResultDimensionModel } from "../../entities/result/model";
import { useLocale } from "../../shared/i18n";

type DimensionScoreListProps = {
  dimensions: ResultDimensionModel[];
};

export function DimensionScoreList({ dimensions }: DimensionScoreListProps) {
  const { locale } = useLocale();
  const isKorean = locale === "ko";
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
    <section className="page-card result-analysis-section-card">
      <div className="section-heading">
        <div>
          <p className="section-heading__eyebrow">{isKorean ? "차원별 점수" : "Dimension scores"}</p>
          <h2 className="page-card__title">{isKorean ? "답변 평가 방식" : "How the answer was evaluated"}</h2>
          <p className="page-card__body">
            {isKorean
              ? "더 강한 부분을 손대기 전에 가장 낮은 차원부터 첫 수정 대상으로 삼으세요."
              : "Use the lowest dimension as the first edit target before touching stronger parts of the answer."}
          </p>
        </div>
        <span className="section-heading__count section-heading__count--text">
          {isKorean ? `${dimensions.length}개 항목` : `${dimensions.length} checks`}
        </span>
      </div>
      <div className="stack-list">
        {dimensions.map((dimension) => (
          <article className="score-row" key={dimension.id}>
            <div className="score-row__content">
              <div className="score-row__heading">
                <span className="score-row__label">{dimension.label}</span>
                {dimension.value === `${lowestScore}` ? (
                  <span className="score-row__hint score-row__hint--warning">{isKorean ? "가장 약함" : "Weakest"}</span>
                ) : null}
                {dimension.value === `${highestScore}` && highestScore !== lowestScore ? (
                  <span className="score-row__hint score-row__hint--positive">{isKorean ? "가장 강함" : "Strongest"}</span>
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
