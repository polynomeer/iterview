import type { ReactNode } from "react";
import type { PracticeQuestionItemModel } from "../../entities/practice/model";
import { useLocale } from "../../shared/i18n";
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
  const { locale } = useLocale();
  const isKorean = locale === "ko";

  return (
    <section className="page-card practice-question-list practice-browser">
      <div className="practice-browser__header">
        <div>
          <p className="section-heading__eyebrow">{isKorean ? "질문 브라우저" : "Question browser"}</p>
          <h2 className="page-card__title">{isKorean ? "연습 질문" : "All Questions"}</h2>
        </div>
        <div className="practice-question-list__summary practice-browser__count">
          <span className="section-heading__count">{items.length}</span>
        </div>
      </div>
      <div className="practice-browser__toolbar">
        <div className="practice-browser__search">{searchControl}</div>
        <div className="practice-browser__toolbar-actions">
          <button className="secondary-button secondary-button--static" type="button">{isKorean ? "태그" : "Tags"}</button>
          <button className="secondary-button secondary-button--static" type="button">{isKorean ? "정렬: 최근" : "Sort: Recent"}</button>
          <button className="secondary-button secondary-button--static" type="button">
            {layout === "grid" ? (isKorean ? "그리드" : "Grid") : isKorean ? "리스트" : "List"}
          </button>
        </div>
      </div>
      <div className="practice-browser__table-head" aria-hidden="true">
        <span>{isKorean ? "질문" : "Question"}</span>
        <span>{isKorean ? "숙련도" : "Mastery"}</span>
        <span>{isKorean ? "최근 시도" : "Last attempt"}</span>
        <span>{isKorean ? "실행" : "Action"}</span>
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
          {hasMore
            ? isKorean
              ? `1-${items.length} / 더 많은 결과`
              : `1-${items.length} of many`
            : isKorean
              ? `1-${items.length} / 총 ${items.length}`
              : `1-${items.length} of ${items.length}`}
        </p>
      </div>
    </section>
  );
}
