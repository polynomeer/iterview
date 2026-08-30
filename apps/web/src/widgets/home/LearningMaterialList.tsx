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
          <h2 className="page-card__title">{isKorean ? "오늘 연습에 쓰일 자료" : "Resources for today&apos;s practice"}</h2>
          <p className="page-card__body home-collection-card__body">
            {isKorean
              ? "현재 답변 경로를 직접 강화하는 자료만 남겨두세요."
              : "Keep only the material that directly strengthens the current answer path."}
          </p>
        </div>
      </div>
      <div className="stack-list">
        {materials.map((material) => (
          <article className="list-item-card" key={material.id}>
            <div className="list-item-card__content">
              <div className="list-item-card__meta">
                <span>{material.resourceTypeLabel}</span>
              </div>
              <h3 className="list-item-card__title">{material.title}</h3>
              <p className="list-item-card__body">{material.description}</p>
            </div>
            {material.url ? (
              <a className="secondary-button" href={material.url} rel="noreferrer" target="_blank">
                {isKorean ? "링크 열기" : "Open link"}
              </a>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}
