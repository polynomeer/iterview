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
    <SectionPanel className="home-layout__review-panel home-layout__review-panel--contrast">
      <div className="home-layout__review-panel-header">
        <div>
          <span className="page-card__label">Retry recovery</span>
          <h2 className="page-card__title">Process weak branches without breaking the main run</h2>
        </div>
        <span className="detail-chip detail-chip--accent">Recovery lane</span>
      </div>
      <p className="page-card__body">
        Open the dedicated review queue when you want to tighten several weak answers back-to-back.
      </p>
      <p className="home-layout__review-panel-note">
        Best used after a session or result review exposes shallow branches.
      </p>
      <div className="page-card__actions">
        <Link className="primary-button" to={routeConfig.reviewQueue.buildPath()}>
          Open recovery queue
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
    <div className="home-layout home-layout--mobile">
      <section className="home-layout__hero">{todaySection}</section>
      <section className="home-layout__band home-layout__band--primary">
        {nextActionSection}
        {summarySection}
      </section>
      <section className="home-layout__band home-layout__band--practice">
        <ReviewQueuePanel />
        {retrySection}
      </section>
      <section className="home-layout__band home-layout__band--intelligence">
        {radarSection}
        {weakSkillsSection}
      </section>
      <section className="home-layout__band home-layout__band--resume">
        {resumeRiskSection}
        {materialsSection}
      </section>
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
      <section className="home-layout__hero">{todaySection}</section>
      <div className="home-layout__workspace">
        <div className="home-layout__main-column">
          <section className="home-layout__band home-layout__band--primary">
            {nextActionSection}
            {summarySection}
          </section>
          <section className="home-layout__band home-layout__band--intelligence">
            {radarSection}
            {weakSkillsSection}
          </section>
          <section className="home-layout__band home-layout__band--resume">
            {resumeRiskSection}
            {materialsSection}
          </section>
        </div>
        <div className="home-layout__side-column">
          <section className="home-layout__band home-layout__band--practice">
            <ReviewQueuePanel />
            {retrySection}
          </section>
        </div>
      </div>
    </div>
  );
}
