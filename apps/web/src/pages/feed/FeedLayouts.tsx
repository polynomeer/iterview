import type { ReactNode } from "react";
import { useLocale } from "../../shared/i18n";
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
  const { t } = useLocale();
  const [featuredSection, ...otherSections] = sections;

  return (
    <div className="feed-layout feed-layout--desktop">
      <div className="feed-layout__hero">
        <SectionPanel className="workspace-note-card workspace-note-card--accent feed-workspace-note" variant="muted">
          <div className="feed-workspace-note__header">
            <span className="page-card__label">{t("feed.entrySupport")}</span>
            <span className="detail-chip detail-chip--accent">{t("feed.leadLane")}</span>
          </div>
          <h2 className="page-card__title">{t("feed.desktopNoteTitle")}</h2>
          <p className="page-card__body">{t("feed.desktopNoteBody")}</p>
          <p className="feed-workspace-note__body">{t("feed.desktopNoteTail")}</p>
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
