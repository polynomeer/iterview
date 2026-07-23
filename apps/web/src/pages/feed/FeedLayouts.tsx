import type { ReactNode } from "react";
import { ContentGrid, SectionPanel } from "../../shared/ui/layout";

type FeedLayoutProps = {
  sections: ReactNode[];
};

export function FeedMobileLayout({ sections }: FeedLayoutProps) {
  return <div className="page-stack">{sections}</div>;
}

export function FeedDesktopLayout({ sections }: FeedLayoutProps) {
  return (
    <div className="feed-layout feed-layout--desktop">
      <SectionPanel variant="muted">
        <span className="page-card__label">Discovery</span>
        <h2 className="page-card__title">Browse the current question landscape</h2>
        <p className="page-card__body">
          Desktop groups the feed into distinct discovery panels so popular, trending, and company-related sets can be compared side by side.
        </p>
      </SectionPanel>
      <ContentGrid columns={sections.length >= 3 ? "three" : "two"}>{sections}</ContentGrid>
    </div>
  );
}
