import type { PracticeQuestionItemModel } from "../../entities/practice/model";
import { QuestionListItem } from "./QuestionListItem";

type QuestionListProps = {
  items: PracticeQuestionItemModel[];
  hasMore: boolean;
  layout?: "stack" | "grid";
};

export function QuestionList({ items, hasMore, layout = "stack" }: QuestionListProps) {
  return (
    <section className="page-card practice-question-list">
      <div className="section-heading">
        <div>
          <p className="section-heading__eyebrow">질문 목록</p>
          <h2 className="page-card__title">다음에 연습할 질문을 고르세요</h2>
        </div>
        <span className="section-heading__count">{items.length}</span>
      </div>
      <p className="page-card__body practice-question-list__intro">
        지금 보완하려는 약점, 목표 회사, 다시 답해볼 꼬리질문 흐름에 맞는 항목을 빠르게 찾아 연습을 이어가세요.
      </p>
      <div className={layout === "grid" ? "card-grid practice-question-list__grid" : "stack-list practice-question-list__stack"}>
        {items.map((item) => (
          <QuestionListItem item={item} key={item.id} />
        ))}
      </div>
      {hasMore ? (
        <p className="page-card__body">백엔드 pagination이 연결되면 더 많은 질문을 이어서 불러올 수 있습니다.</p>
      ) : null}
    </section>
  );
}
