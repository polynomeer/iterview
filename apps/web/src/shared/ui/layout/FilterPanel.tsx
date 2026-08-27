import type { PropsWithChildren } from "react";
import { useLocale } from "../../i18n";
import { SectionPanel } from "./SectionPanel";

type FilterPanelProps = PropsWithChildren<{
  title?: string;
  description?: string;
}>;

export function FilterPanel({
  children,
  title,
  description,
}: FilterPanelProps) {
  const { locale } = useLocale();
  const resolvedTitle = title ?? (locale === "ko" ? "필터" : "Filters");

  return (
    <SectionPanel as="aside" className="filter-panel" variant="muted">
      <div className="section-heading">
        <div>
          <p className="section-heading__eyebrow">{resolvedTitle}</p>
          <h2 className="page-card__title">{resolvedTitle}</h2>
        </div>
      </div>
      {description ? <p className="page-card__body filter-panel__description">{description}</p> : null}
      <div className="filter-panel__content">{children}</div>
    </SectionPanel>
  );
}
