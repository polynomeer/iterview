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
      <section className="archive-layout__content">{listContent}</section>
      <section className="archive-layout__rail">
        {filterControls}
        <SectionPanel className="workspace-note-card" variant="muted">
          <span className="page-card__label">Archive review</span>
          <h2 className="page-card__title">Treat the archive as a compact review shelf, not a dumping ground</h2>
          <p className="page-card__body">
            Filtering comes after the mastered list on mobile so the screen stays focused on what you can reopen, revisit, or map back to interview sessions.
          </p>
        </SectionPanel>
      </section>
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
            <SectionPanel className="workspace-note-card" variant="muted">
              <span className="page-card__label">Archive browsing</span>
              <h2 className="page-card__title">Use the extra space to scan mastered work without losing context</h2>
              <p className="page-card__body">
                Desktop should keep filters and reopened-session context visible while the main column stays focused on high-signal summaries.
              </p>
            </SectionPanel>
            <FilterPanel description="Archive filters stay visible while you scan mastered questions and reopen summaries.">
              {filterControls}
            </FilterPanel>
          </div>
        }
      />
    </div>
  );
}
