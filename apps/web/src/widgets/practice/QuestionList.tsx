import type { PracticeQuestionItemModel } from "../../entities/practice/model";
import { QuestionListItem } from "./QuestionListItem";

type QuestionListProps = {
  items: PracticeQuestionItemModel[];
  hasMore: boolean;
  layout?: "stack" | "grid";
};

export function QuestionList({ items, hasMore, layout = "stack" }: QuestionListProps) {
  return (
    <section className="page-card">
      <div className="section-heading">
        <div>
          <p className="section-heading__eyebrow">Question list</p>
          <h2 className="page-card__title">Choose what to practice next</h2>
        </div>
        <span className="section-heading__count">{items.length}</span>
      </div>
      <div className={layout === "grid" ? "card-grid" : "stack-list"}>
        {items.map((item) => (
          <QuestionListItem item={item} key={item.id} />
        ))}
      </div>
      {hasMore ? (
        <p className="page-card__body">More questions are available when the backend exposes pagination controls.</p>
      ) : null}
    </section>
  );
}
