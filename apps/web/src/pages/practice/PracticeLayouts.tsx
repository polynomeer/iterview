import type { ReactNode } from "react";
import { FilterPanel, SectionPanel, SplitLayout } from "../../shared/ui/layout";

type PracticeLayoutProps = {
  searchControl: ReactNode;
  filterControls: ReactNode;
  reviewQueueCard: ReactNode;
  resultsContent: ReactNode;
};

export function PracticeMobileLayout({
  searchControl,
  filterControls,
  reviewQueueCard,
  resultsContent,
}: PracticeLayoutProps) {
  return (
    <div className="practice-layout practice-layout--mobile">
      <section className="practice-layout__search">{searchControl}</section>
      <section className="practice-layout__cluster practice-layout__cluster--support">
        {reviewQueueCard}
        {filterControls}
      </section>
      <section className="practice-layout__results">{resultsContent}</section>
    </div>
  );
}

export function PracticeDesktopLayout({
  searchControl,
  filterControls,
  reviewQueueCard,
  resultsContent,
}: PracticeLayoutProps) {
  return (
    <div className="practice-layout practice-layout--desktop">
      <div className="practice-layout__search practice-layout__search--desktop">{searchControl}</div>
      <SplitLayout
        main={
          <div className="page-stack practice-layout__results">
            {resultsContent}
          </div>
        }
        aside={
          <div className="page-stack practice-layout__cluster practice-layout__cluster--rail">
            <FilterPanel description="Keep filters pinned while scanning a larger desktop result set.">
              {filterControls}
            </FilterPanel>
            {reviewQueueCard}
            <SectionPanel className="workspace-note-card" variant="muted">
              <span className="page-card__label">Desktop browsing</span>
              <h2 className="page-card__title">Scan, filter, and act without context switching</h2>
              <p className="page-card__body">
                Desktop keeps the search and results in the main workspace while filters stay visible in a dedicated rail.
              </p>
            </SectionPanel>
          </div>
        }
      />
    </div>
  );
}
