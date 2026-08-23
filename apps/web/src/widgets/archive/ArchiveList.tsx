import type { ArchiveItemModel } from "../../entities/archive/model";
import { ArchiveListItem } from "./ArchiveListItem";

type ArchiveListProps = {
  items: ArchiveItemModel[];
  layout?: "stack" | "grid";
};

export function ArchiveList({ items, layout = "stack" }: ArchiveListProps) {
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
      <div className={layout === "grid" ? "card-grid" : "stack-list"}>
        {items.map((item) => (
          <ArchiveListItem item={item} key={item.id} />
        ))}
      </div>
    </section>
  );
}
