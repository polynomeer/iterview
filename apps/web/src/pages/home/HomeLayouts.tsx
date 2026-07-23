import { Link } from "react-router-dom";
import type { ReactNode } from "react";
import { routeConfig } from "../../shared/config/routes";
import { ContentGrid, SectionPanel } from "../../shared/ui/layout";

type HomeLayoutProps = {
  todaySection: ReactNode;
  retrySection: ReactNode;
  materialsSection: ReactNode;
  summarySection: ReactNode;
  nextActionSection: ReactNode;
  radarSection: ReactNode;
  weakSkillsSection: ReactNode;
  resumeRiskSection: ReactNode;
};

function ReviewQueuePanel() {
  return (
    <SectionPanel className="home-layout__review-panel">
      <span className="page-card__label">Review queue</span>
      <h2 className="page-card__title">Move through scheduled follow-up practice</h2>
      <p className="page-card__body">
        Open the dedicated review queue to skip or complete retry items without losing your place.
      </p>
      <div className="page-card__actions">
        <Link className="primary-button" to={routeConfig.reviewQueue.buildPath()}>
          Open review queue
        </Link>
      </div>
    </SectionPanel>
  );
}

export function HomeMobileLayout({
  todaySection,
  retrySection,
  materialsSection,
  summarySection,
  nextActionSection,
  radarSection,
  weakSkillsSection,
  resumeRiskSection,
}: HomeLayoutProps) {
  return (
    <div className="page-stack">
      {todaySection}
      {nextActionSection}
      {summarySection}
      <ReviewQueuePanel />
      {retrySection}
      {radarSection}
      {weakSkillsSection}
      {resumeRiskSection}
      {materialsSection}
    </div>
  );
}

export function HomeDesktopLayout({
  todaySection,
  retrySection,
  materialsSection,
  summarySection,
  nextActionSection,
  radarSection,
  weakSkillsSection,
  resumeRiskSection,
}: HomeLayoutProps) {
  return (
    <div className="home-layout home-layout--desktop">
      <div className="home-layout__hero">{todaySection}</div>
      <div className="home-layout__top-strip">
        <div className="page-stack home-layout__top-card">
          {nextActionSection}
        </div>
        {summarySection ? <div className="page-stack home-layout__top-card">{summarySection}</div> : null}
        <div className="page-stack home-layout__top-card">
          <ReviewQueuePanel />
        </div>
      </div>
      <div className="home-layout__content">
        <div className="page-stack home-layout__main-panel">
          {retrySection}
          {radarSection}
        </div>
        <div className="page-stack home-layout__side-panel">
          {weakSkillsSection}
          {resumeRiskSection}
          {materialsSection}
        </div>
      </div>
    </div>
  );
}
