import type { LearningMaterialModel } from "../../entities/home/model";
import { useLocale } from "../../shared/i18n";

type LearningMaterialListProps = {
  materials: LearningMaterialModel[];
};

export function LearningMaterialList({ materials }: LearningMaterialListProps) {
  const { locale } = useLocale();
  const isKorean = locale === "ko";

  return (
    <section className="page-card home-collection-card home-collection-card--materials">
      <div className="section-heading">
        <div>
          <p className="section-heading__eyebrow">{isKorean ? "학습 자료" : "Learning materials"}</p>
          <h2 className="page-card__title">{isKorean ? "오늘 바로 꺼내볼 자료" : "Materials worth opening today"}</h2>
        </div>
        <span className="section-heading__count">{materials.length}</span>
      </div>
      <div className="stack-list">
        {materials.map((material) => (
          <article className="list-item-card" key={material.id}>
            <div className="list-item-card__content">
              <div className="list-item-card__meta">
                <span>{material.resourceTypeLabel}</span>
              </div>
              <h3 className="list-item-card__title">{material.title}</h3>
              {material.description ? (
                <p className="list-item-card__body home-collection-card__item-body">{material.description}</p>
              ) : null}
            </div>
            {material.url ? (
              <a
                className="secondary-button home-collection-card__action"
                href={material.url}
                rel="noreferrer"
                target="_blank"
              >
                {isKorean ? "링크 열기" : "Open link"}
              </a>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}
