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
            <span className="page-card__label">Discovery</span>
            <span className="detail-chip detail-chip--accent">Lead signal</span>
          </div>
          <h2 className="page-card__title">Read the market before choosing the next branch to practice</h2>
          <p className="page-card__body">
            Popular, trending, and company-related groups should feel like distinct signals, not one endless question stream.
          </p>
          <p className="feed-workspace-note__body">
            Start with the lead section, then compare only the adjacent signals needed to decide
            your next answer path.
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
