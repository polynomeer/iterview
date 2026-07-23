import type { PropsWithChildren } from "react";
import { SectionPanel } from "./SectionPanel";

type FilterPanelProps = PropsWithChildren<{
  title?: string;
  description?: string;
}>;

export function FilterPanel({
  children,
  title = "Filters",
  description,
}: FilterPanelProps) {
  return (
    <SectionPanel as="aside" className="filter-panel" variant="muted">
      <div className="section-heading">
        <div>
          <p className="section-heading__eyebrow">Filters</p>
          <h2 className="page-card__title">{title}</h2>
        </div>
      </div>
      {description ? <p className="page-card__body filter-panel__description">{description}</p> : null}
      <div className="filter-panel__content">{children}</div>
    </SectionPanel>
  );
}
