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
            <FilterPanel
              description="Keep filters pinned while scanning a larger desktop result set."
              title="Practice control rail"
            >
              {filterControls}
            </FilterPanel>
            <SectionPanel className="workspace-note-card practice-workflow-note" variant="muted">
              <div className="practice-workflow-note__topline">
                <span className="page-card__label">Practice workflow</span>
                <span className="detail-chip">Control rail</span>
              </div>
              <h2 className="page-card__title">Filter once, then move through the queue with less branching</h2>
              <p className="page-card__body">
                Keep retry pressure and filters visible in one side rail while the main column stays focused on picking the next question.
              </p>
              <div className="practice-workflow-note__steps">
                <div className="practice-workflow-note__step">
                  <strong>1. Reduce noise</strong>
                  <span>Pin category, company, or status until the list becomes worth reviewing carefully.</span>
                </div>
                <div className="practice-workflow-note__step">
                  <strong>2. Commit to one node</strong>
                  <span>Start only the question that clearly improves the next answer or branch defense.</span>
                </div>
              </div>
            </SectionPanel>
          </div>
        }
      />
    </div>
  );
}
