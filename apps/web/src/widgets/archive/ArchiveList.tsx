import type { ArchiveItemModel } from "../../entities/archive/model";
import { useLocale } from "../../shared/i18n";
import { ArchiveListItem } from "./ArchiveListItem";

type ArchiveListProps = {
  items: ArchiveItemModel[];
  layout?: "stack" | "grid";
};

export function ArchiveList({ items, layout = "stack" }: ArchiveListProps) {
  const { locale } = useLocale();
  const isKorean = locale === "ko";
  const followUpCount = items.filter((item) => item.isFollowUp).length;
  const linkedSessionCount = items.filter((item) => Boolean(item.sourceSessionId)).length;

  return (
    <section className="page-card archive-list-card">
      <div className="section-heading">
        <div>
          <p className="section-heading__eyebrow">{isKorean ? "아카이브" : "Archive"}</p>
          <h2 className="page-card__title">{isKorean ? "정리된 질문" : "Mastered questions"}</h2>
          <p className="page-card__body">
            {isKorean
              ? "재사용 가능한 면접 자료로 남길 만큼 안정성이 검증된 답변만 다시 열어보세요."
              : "Reopen only the answers that already proved stable enough to keep as reusable interview material."}
          </p>
        </div>
        <span className="section-heading__count">{items.length}</span>
      </div>
      <div className="archive-list-card__intro">
        <p className="archive-list-card__lead">
          {isKorean
            ? "이 선반은 작고 단단하게 유지하세요. 저장된 모든 항목은 빠르게 다시 열 수 있고, 일관되게 설명할 수 있으며, 신뢰를 만든 근거로 되돌아갈 수 있어야 합니다."
            : "Keep this shelf tight: every saved item should be something you can reopen quickly, explain consistently, and map back to the proof that made it trustworthy."}
        </p>
        <div className="archive-list-card__summary">
          <article className="archive-list-card__summary-item">
            <span>{isKorean ? "저장 항목" : "Saved items"}</span>
            <strong>{items.length}</strong>
          </article>
          <article className="archive-list-card__summary-item">
            <span>{isKorean ? "꼬리질문 체인" : "Follow-up chains"}</span>
            <strong>{followUpCount}</strong>
          </article>
          <article className="archive-list-card__summary-item">
            <span>{isKorean ? "세션 추적" : "Session trace"}</span>
            <strong>{linkedSessionCount}</strong>
          </article>
        </div>
      </div>
      <div className={layout === "grid" ? "card-grid" : "stack-list"}>
        {items.map((item) => (
          <ArchiveListItem item={item} key={item.id} />
        ))}
      </div>
    </section>
  );
}
