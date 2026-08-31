import type { ReactNode } from "react";
import type { PracticeQuestionItemModel } from "../../entities/practice/model";
import { QuestionListItem } from "./QuestionListItem";

type QuestionListProps = {
  items: PracticeQuestionItemModel[];
  hasMore: boolean;
  layout?: "stack" | "grid";
  selectedQuestionId?: string | null;
  onSelectQuestion?: (questionId: string) => void;
  searchControl?: ReactNode;
};

export function QuestionList({
  items,
  hasMore,
  layout = "stack",
  selectedQuestionId = null,
  onSelectQuestion,
  searchControl,
}: QuestionListProps) {
  return (
    <section className="page-card practice-question-list practice-browser">
      <div className="practice-browser__header">
        <div>
          <p className="section-heading__eyebrow">질문 목록</p>
          <h2 className="page-card__title">All Questions</h2>
        </div>
        <div className="practice-question-list__summary practice-browser__count">
          <span className="section-heading__count">{items.length}</span>
        </div>
      </div>
      <div className="practice-browser__toolbar">
        <div className="practice-browser__search">{searchControl}</div>
        <div className="practice-browser__toolbar-actions">
          <button className="secondary-button secondary-button--static" type="button">태그</button>
          <button className="secondary-button secondary-button--static" type="button">정렬: 최근</button>
          <button className="secondary-button secondary-button--static" type="button">
            {layout === "grid" ? "그리드" : "리스트"}
          </button>
        </div>
      </div>
      <div className={layout === "grid" ? "card-grid practice-question-list__grid" : "stack-list practice-question-list__stack"}>
        {items.map((item) => (
          <QuestionListItem
            isSelected={selectedQuestionId === item.id}
            item={item}
            key={item.id}
            onSelect={onSelectQuestion ? () => onSelectQuestion(item.id) : undefined}
          />
        ))}
      </div>
      <div className="practice-browser__footer">
        <div className="practice-browser__pagination">
          <button className="secondary-button secondary-button--static" type="button">‹</button>
          <button className="secondary-button secondary-button--static" type="button">1</button>
          <button className="secondary-button secondary-button--static" type="button">2</button>
          <button className="secondary-button secondary-button--static" type="button">3</button>
          <button className="secondary-button secondary-button--static" type="button">›</button>
        </div>
        <p className="page-card__body practice-browser__page-copy">
          {hasMore ? `1-${items.length} of many` : `1-${items.length} of ${items.length}`}
        </p>
      </div>
    </section>
  );
}
