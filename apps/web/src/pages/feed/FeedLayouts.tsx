import type { ReactNode } from "react";
import { ContentGrid, SectionPanel } from "../../shared/ui/layout";

type FeedLayoutProps = {
  sections: ReactNode[];
};

export function FeedMobileLayout({ sections }: FeedLayoutProps) {
  return <div className="feed-layout feed-layout--mobile">{sections}</div>;
}

export function FeedDesktopLayout({ sections }: FeedLayoutProps) {
  const [featuredSection, ...otherSections] = sections;

  return (
    <div className="feed-layout feed-layout--desktop">
      <div className="feed-layout__hero">
        <SectionPanel className="workspace-note-card workspace-note-card--accent" variant="muted">
          <span className="page-card__label">Discovery</span>
          <h2 className="page-card__title">Browse the current question landscape</h2>
          <p className="page-card__body">
            Popular, trending, and company-related sets should read as different angles on the same market, not one long list.
          </p>
        </SectionPanel>
        {featuredSection}
      </div>
      {otherSections.length > 0 ? (
        <ContentGrid columns={otherSections.length >= 3 ? "three" : "two"}>{otherSections}</ContentGrid>
      ) : null}
    </div>
  );
}
