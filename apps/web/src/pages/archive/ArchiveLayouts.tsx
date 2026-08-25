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
        <SectionPanel className="workspace-note-card archive-workspace-note" variant="muted">
          <div className="archive-workspace-note__header">
            <span className="page-card__label">Archive review</span>
            <span className="detail-chip">Mobile library</span>
          </div>
          <h2 className="page-card__title">Treat the archive as a compact answer shelf</h2>
          <p className="page-card__body">
            Filtering comes after the mastered list on mobile so the screen stays focused on what you can reopen, revisit, or map back to interview sessions.
          </p>
          <div className="archive-workspace-note__rules">
            <article className="archive-workspace-note__rule">
              <span>Keep</span>
              <strong>Only reusable answers with stable reasoning</strong>
            </article>
            <article className="archive-workspace-note__rule">
              <span>Reopen</span>
              <strong>Trace difficult wins back to the source session before interviews</strong>
            </article>
          </div>
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
            <SectionPanel className="workspace-note-card archive-workspace-note" variant="muted">
              <div className="archive-workspace-note__header">
                <span className="page-card__label">Archive browsing</span>
                <span className="detail-chip detail-chip--accent">Pinned rail</span>
              </div>
              <h2 className="page-card__title">Use the extra space to scan proven work without losing context</h2>
              <p className="page-card__body">
                Desktop should keep filters and reopened-session context visible while the main column stays focused on high-signal summaries.
              </p>
              <div className="archive-workspace-note__rules">
                <article className="archive-workspace-note__rule">
                  <span>Shelf quality</span>
                  <strong>Archive only answers you can defend without rereading the prompt</strong>
                </article>
                <article className="archive-workspace-note__rule">
                  <span>Session linkage</span>
                  <strong>Use linked sessions to recover the follow-up chain, not just the final score</strong>
                </article>
              </div>
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
