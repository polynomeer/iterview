import type { ReactNode } from "react";
import { ContentGrid, SectionPanel } from "../../shared/ui/layout";

type FeedLayoutProps = {
  sections: ReactNode[];
};

export function FeedMobileLayout({ sections }: FeedLayoutProps) {
  const [featuredSection, ...otherSections] = sections;

  return (
    <div className="feed-layout feed-layout--mobile">
      {featuredSection ? <section className="feed-layout__hero">{featuredSection}</section> : null}
      {otherSections.length > 0 ? <div className="feed-layout__sections">{otherSections}</div> : null}
    </div>
  );
}

export function FeedDesktopLayout({ sections }: FeedLayoutProps) {
  const [featuredSection, ...otherSections] = sections;

  return (
    <div className="feed-layout feed-layout--desktop">
      <div className="feed-layout__hero">
        <SectionPanel className="workspace-note-card workspace-note-card--accent feed-workspace-note" variant="muted">
          <div className="feed-workspace-note__header">
            <span className="page-card__label">Entry support</span>
            <span className="detail-chip detail-chip--accent">Lead lane</span>
          </div>
          <h2 className="page-card__title">Use external signal to narrow the next question, not to open endless browsing</h2>
          <p className="page-card__body">
            Keep popular, trend, and company groups visually separate so the next branch choice comes from contrast, not noise.
          </p>
          <p className="feed-workspace-note__body">
            Start with the lead lane, compare one adjacent signal, and exit as soon as the next DFS answer path becomes clear.
          </p>
        </SectionPanel>
        {featuredSection}
      </div>
      {otherSections.length > 0 ? (
        <div className="feed-layout__sections">
          <ContentGrid columns={otherSections.length >= 3 ? "three" : "two"}>{otherSections}</ContentGrid>
        </div>
      ) : null}
    </div>
  );
}
