import type { ReviewQueueItemModel } from "../../entities/review-queue/model";
import { useLocale } from "../../shared/i18n";
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
  const { locale } = useLocale();
  const isKorean = locale === "ko";
  return (
    <section className="page-card review-queue-list-card">
      <div className="section-heading">
        <div>
          <p className="section-heading__eyebrow">{isKorean ? "복습 큐" : "Review queue"}</p>
          <h2 className="page-card__title">{isKorean ? "지금 정리할 재도전 항목" : "Retry items to clear now"}</h2>
        </div>
        <span className="section-heading__count">{items.length}</span>
      </div>
      <div className={layout === "grid" ? "card-grid review-queue-list-card__grid" : "stack-list review-queue-list-card__stack"}>
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
