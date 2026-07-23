import type { ReactNode } from "react";
import { FilterPanel, SectionPanel, SplitLayout } from "../../shared/ui/layout";

type ArchiveLayoutProps = {
  filterControls: ReactNode;
  listContent: ReactNode;
};

export function ArchiveMobileLayout({
  filterControls,
  listContent,
}: ArchiveLayoutProps) {
  return (
    <div className="page-stack">
      {filterControls}
      {listContent}
    </div>
  );
}

export function ArchiveDesktopLayout({
  filterControls,
  listContent,
}: ArchiveLayoutProps) {
  return (
    <div className="archive-layout archive-layout--desktop">
      <SplitLayout
        main={listContent}
        aside={
          <div className="page-stack">
            <FilterPanel description="Archive filters stay visible while you scan mastered questions and reopen summaries.">
              {filterControls}
            </FilterPanel>
            <SectionPanel variant="muted">
              <span className="page-card__label">Archive browsing</span>
              <h2 className="page-card__title">Use the extra space for denser review</h2>
              <p className="page-card__body">
                Desktop surfaces more cards at once without stretching a single mobile column across the page.
              </p>
            </SectionPanel>
          </div>
        }
      />
    </div>
  );
}
