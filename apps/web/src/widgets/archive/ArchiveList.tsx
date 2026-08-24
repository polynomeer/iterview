import type { ArchiveItemModel } from "../../entities/archive/model";
import { ArchiveListItem } from "./ArchiveListItem";

type ArchiveListProps = {
  items: ArchiveItemModel[];
  layout?: "stack" | "grid";
};

export function ArchiveList({ items, layout = "stack" }: ArchiveListProps) {
  const followUpCount = items.filter((item) => item.isFollowUp).length;
  const linkedSessionCount = items.filter((item) => Boolean(item.sourceSessionId)).length;

  return (
    <section className="page-card archive-list-card">
      <div className="section-heading">
        <div>
          <p className="section-heading__eyebrow">Archive</p>
          <h2 className="page-card__title">Mastered questions</h2>
          <p className="page-card__body">
            Reopen only the answers that already proved stable enough to keep as reusable interview material.
          </p>
        </div>
        <span className="section-heading__count">{items.length}</span>
      </div>
      <div className="archive-list-card__intro">
        <p className="archive-list-card__lead">
          Keep this shelf tight: every saved item should be something you can reopen quickly, explain consistently,
          and map back to the proof that made it trustworthy.
        </p>
        <div className="archive-list-card__summary">
          <article className="archive-list-card__summary-item">
            <span>Saved items</span>
            <strong>{items.length}</strong>
          </article>
          <article className="archive-list-card__summary-item">
            <span>Follow-up chains</span>
            <strong>{followUpCount}</strong>
          </article>
          <article className="archive-list-card__summary-item">
            <span>Session trace</span>
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
