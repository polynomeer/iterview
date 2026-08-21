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
      <section className="practice-layout__results">{resultsContent}</section>
      <section className="practice-layout__cluster practice-layout__cluster--support">
        {filterControls}
        {reviewQueueCard}
      </section>
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
            {reviewQueueCard}
            <FilterPanel description="Keep filters pinned while scanning a larger desktop result set.">
              {filterControls}
            </FilterPanel>
            <SectionPanel className="workspace-note-card" variant="muted">
              <span className="page-card__label">Practice workflow</span>
              <h2 className="page-card__title">Filter once, then move through the queue with less branching</h2>
              <p className="page-card__body">
                Keep retry pressure and filters visible in one side rail while the main column stays focused on picking the next question.
              </p>
            </SectionPanel>
          </div>
        }
      />
    </div>
  );
}
