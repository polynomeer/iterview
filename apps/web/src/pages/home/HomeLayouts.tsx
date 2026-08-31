import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { routeConfig } from "../../shared/config/routes";
import { useLocale } from "../../shared/i18n";
import { SectionPanel } from "../../shared/ui/layout";

type HomeLayoutProps = {
  todaySection: ReactNode;
  todayContextSection: ReactNode;
  retrySection: ReactNode;
  materialsSection: ReactNode;
  summarySection: ReactNode;
  nextActionSection: ReactNode;
  radarSection: ReactNode;
  weakSkillsSection: ReactNode;
  resumeRiskSection: ReactNode;
};

function ReviewQueuePanel() {
  const { locale } = useLocale();
  const isKorean = locale === "ko";

  return (
    <SectionPanel className="home-layout__review-panel home-layout__review-panel--contrast">
      <div className="home-layout__review-panel-header">
        <div>
          <span className="page-card__label">{isKorean ? "재도전 복구" : "Retry recovery"}</span>
          <h2 className="page-card__title">{isKorean ? "메인 흐름을 끊지 않고 재도전만 정리하세요" : "Clear retries without breaking the main run"}</h2>
        </div>
        <span className="detail-chip detail-chip--accent">{isKorean ? "복구 레인" : "Recovery lane"}</span>
      </div>
      <p className="page-card__body">
        {isKorean
          ? "약한 답변을 짧게 연속 정리할 때 이 큐를 사용하세요."
          : "Open the dedicated review queue when you want to tighten several weak answers back-to-back."}
      </p>
      <div className="page-card__actions">
        <Link className="primary-button" to={routeConfig.reviewQueue.buildPath()}>
          {isKorean ? "복구 큐 열기" : "Open recovery queue"}
        </Link>
      </div>
    </SectionPanel>
  );
}

export function HomeMobileLayout({
  todaySection,
  todayContextSection,
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
      <section className="home-layout__stage home-layout__stage--mobile">
        <div className="home-layout__stage-main">{todaySection}</div>
        <aside className="home-layout__stage-rail">
          {todayContextSection}
          {nextActionSection}
        </aside>
      </section>
      <section className="home-layout__band home-layout__band--summary">
        {summarySection}
        {radarSection}
      </section>
      <section className="home-layout__band home-layout__band--intelligence">
        {weakSkillsSection}
        {materialsSection}
      </section>
      <section className="home-layout__band home-layout__band--practice">
        <ReviewQueuePanel />
        {retrySection}
      </section>
      <section className="home-layout__band home-layout__band--resume">
        {resumeRiskSection}
      </section>
    </div>
  );
}

export function HomeDesktopLayout({
  todaySection,
  todayContextSection,
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
      <section className="home-layout__stage">
        <div className="home-layout__stage-main">
          <section className="home-layout__hero">{todaySection}</section>
          <section className="home-layout__hero-side">{nextActionSection}</section>
        </div>
        <aside className="home-layout__stage-rail">{todayContextSection}</aside>
      </section>
      <div className="home-layout__workspace">
        <section className="home-layout__band home-layout__band--summary">
          {summarySection}
          {radarSection}
          {weakSkillsSection}
        </section>
        <section className="home-layout__band home-layout__band--cards">
          <ReviewQueuePanel />
          {retrySection}
          {materialsSection}
          {resumeRiskSection}
        </section>
      </div>
    </div>
  );
}
