import type { LearningMaterialModel } from "../../entities/home/model";

type LearningMaterialListProps = {
  materials: LearningMaterialModel[];
};

export function LearningMaterialList({ materials }: LearningMaterialListProps) {
  return (
    <section className="page-card home-collection-card home-collection-card--materials">
      <div className="section-heading">
        <div>
          <p className="section-heading__eyebrow">Learning materials</p>
          <h2 className="page-card__title">Resources for today&apos;s practice</h2>
          <p className="page-card__body home-collection-card__body">
            Keep only the material that directly strengthens the current answer path.
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
                Open link
              </a>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}
