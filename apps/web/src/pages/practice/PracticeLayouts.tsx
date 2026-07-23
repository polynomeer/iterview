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
    <div className="page-stack">
      {searchControl}
      {reviewQueueCard}
      {filterControls}
      {resultsContent}
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
      <SplitLayout
        main={
          <div className="page-stack">
            {searchControl}
            {resultsContent}
          </div>
        }
        aside={
          <div className="page-stack">
            <FilterPanel description="Keep filters pinned while scanning a larger desktop result set.">
              {filterControls}
            </FilterPanel>
            {reviewQueueCard}
            <SectionPanel variant="muted">
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
