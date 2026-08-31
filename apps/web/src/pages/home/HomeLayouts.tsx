import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { routeConfig } from "../../shared/config/routes";
import { useLocale } from "../../shared/i18n";
import { SectionPanel } from "../../shared/ui/layout";

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
  const { locale } = useLocale();
  const isKorean = locale === "ko";

  return (
    <SectionPanel className="home-layout__review-panel home-layout__review-panel--contrast">
      <div className="home-layout__review-panel-header">
        <div>
          <span className="page-card__label">{isKorean ? "재도전 복구" : "Retry recovery"}</span>
          <h2 className="page-card__title">{isKorean ? "메인 흐름을 끊지 않고 약한 분기를 정리하세요" : "Process weak branches without breaking the main run"}</h2>
        </div>
        <span className="detail-chip detail-chip--accent">{isKorean ? "복구 레인" : "Recovery lane"}</span>
      </div>
      <p className="page-card__body">
        {isKorean
          ? "약한 답변 여러 개를 연달아 보강하고 싶을 때 전용 복습 큐를 여세요."
          : "Open the dedicated review queue when you want to tighten several weak answers back-to-back."}
      </p>
      <p className="home-layout__review-panel-note">
        {isKorean
          ? "세션이나 결과 검토에서 얕은 분기가 드러난 직후에 가장 효과적입니다."
          : "Best used after a session or result review exposes shallow branches."}
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
        <aside className="home-layout__side-column">
          <section className="home-layout__band home-layout__band--practice">
            <ReviewQueuePanel />
            {retrySection}
          </section>
        </aside>
      </div>
    </div>
  );
}
