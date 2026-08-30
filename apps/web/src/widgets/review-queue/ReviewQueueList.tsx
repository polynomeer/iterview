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
          <h2 className="page-card__title">{isKorean ? "꼬리질문 복습 준비가 된 질문" : "Questions ready for follow-up review"}</h2>
          <p className="page-card__body">
            {isKorean
              ? "가치가 가장 높은 재시도 항목부터 정리하고, 새 연습을 시작하기 전에 큐를 먼저 줄이세요."
              : "Clear the highest-value retry items first, then shrink the queue before starting new practice."}
          </p>
        </div>
        <span className="section-heading__count">{items.length}</span>
      </div>
      <p className="page-card__body review-queue-list-card__intro">
        {isKorean
          ? "위에서 아래로 처리하세요. 신호가 약한 재시도를 둘러보기 전에, 급하고 답할 수 있는 항목을 먼저 해결하세요."
          : "Work top-down: handle the items that are both urgent and answerable before spending time browsing lower-signal retries."}
      </p>
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
