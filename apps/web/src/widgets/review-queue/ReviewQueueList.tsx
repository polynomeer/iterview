import type { ReviewQueueItemModel } from "../../entities/review-queue/model";
import { ReviewQueueItem } from "./ReviewQueueItem";

type ReviewQueueListProps = {
  items: ReviewQueueItemModel[];
  pendingItemId: string | null;
  pendingAction: "skip" | "done" | null;
  onSkip: (queueItemId: string) => void;
  onDone: (queueItemId: string) => void;
  layout?: "stack" | "grid";
};

export function ReviewQueueList({
  items,
  pendingItemId,
  pendingAction,
  onSkip,
  onDone,
  layout = "stack",
}: ReviewQueueListProps) {
  return (
    <section className="page-card review-queue-list-card">
      <div className="section-heading">
        <div>
          <p className="section-heading__eyebrow">Review queue</p>
          <h2 className="page-card__title">Questions ready for follow-up review</h2>
          <p className="page-card__body">
            Clear the highest-value retry items first, then shrink the queue before starting new
            practice.
          </p>
        </div>
        <span className="section-heading__count">{items.length}</span>
      </div>
      <div className={layout === "grid" ? "card-grid" : "stack-list"}>
        {items.map((item) => (
          <ReviewQueueItem
            item={item}
            key={item.id}
            onDone={() => onDone(item.id)}
            onSkip={() => onSkip(item.id)}
            pendingAction={pendingItemId === item.id ? pendingAction : null}
          />
        ))}
      </div>
    </section>
  );
}
