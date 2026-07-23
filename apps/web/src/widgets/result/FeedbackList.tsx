import type { ResultFeedbackItemModel } from "../../entities/result/model";

type FeedbackListProps = {
  items: ResultFeedbackItemModel[];
};

export function FeedbackList({ items }: FeedbackListProps) {
  return (
    <section className="page-card">
      <div className="section-heading">
        <div>
          <p className="section-heading__eyebrow">Legacy feedback</p>
          <h2 className="page-card__title">Scoring rule feedback</h2>
        </div>
      </div>
      {items.length === 0 ? (
        <p className="page-card__body">No legacy feedback items are available for this attempt.</p>
      ) : (
        <div className="stack-list">
          {items.map((item) => (
            <article className={`feedback-card feedback-card--${item.tone}`} key={item.id}>
              <h3 className="list-item-card__title">{item.title}</h3>
              <p className="list-item-card__body">{item.description}</p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
