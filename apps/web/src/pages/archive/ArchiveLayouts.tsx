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
    <div className="archive-layout archive-layout--mobile">
      <section className="archive-layout__rail">{filterControls}</section>
      <section className="archive-layout__content">{listContent}</section>
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
        main={<div className="archive-layout__content">{listContent}</div>}
        aside={
          <div className="page-stack archive-layout__rail">
            <FilterPanel description="Archive filters stay visible while you scan mastered questions and reopen summaries.">
              {filterControls}
            </FilterPanel>
            <SectionPanel className="workspace-note-card" variant="muted">
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
