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
        <SectionPanel className="workspace-note-card workspace-note-card--accent" variant="muted">
          <span className="page-card__label">Discovery</span>
          <h2 className="page-card__title">Read the market before choosing the next branch to practice</h2>
          <p className="page-card__body">
            Popular, trending, and company-related groups should feel like distinct signals, not one endless question stream.
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
