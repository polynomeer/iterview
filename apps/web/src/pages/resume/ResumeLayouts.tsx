import type { ReactNode } from "react";
import { SectionPanel } from "../../shared/ui/layout";

type ResumeLayoutProps = {
  notices: ReactNode;
  listContent: ReactNode;
  profileCard: ReactNode;
  overviewCard: ReactNode;
  libraryIntro: ReactNode;
};

export function ResumeMobileLayout({
  notices,
  listContent,
  profileCard,
  overviewCard,
  libraryIntro,
}: ResumeLayoutProps) {
  return (
    <div className="resume-layout resume-layout--mobile">
      <section className="resume-layout__workspace-main">
        {overviewCard}
        <SectionPanel className="workspace-note-card workspace-note-card--accent" variant="muted">
          <span className="page-card__label">Source of truth</span>
          <h2 className="page-card__title">Treat each resume version as evidence, not storage</h2>
          <p className="page-card__body">
            Keep one active version, inspect extracted claims, and tighten every line you may need to defend when the question tree drills deeper.
          </p>
        </SectionPanel>
      </section>
      <section className="resume-layout__workspace-side">{profileCard}</section>
      <section className="resume-layout__document">
        <div className="page-stack">
          {notices}
          {libraryIntro}
          {listContent}
        </div>
      </section>
    </div>
  );
}

export function ResumeDesktopLayout({
  notices,
  listContent,
  profileCard,
  overviewCard,
  libraryIntro,
}: ResumeLayoutProps) {
  return (
    <div className="resume-layout resume-layout--desktop">
      <div className="resume-layout__workspace">
        <div className="resume-layout__workspace-main">
          {overviewCard}
          <SectionPanel className="workspace-note-card workspace-note-card--accent resume-layout__source-note" variant="muted">
            <span className="page-card__label">Source of truth</span>
            <h2 className="page-card__title">Build one defendable resume context before mock interviews begin</h2>
            <p className="page-card__body">
              The goal is not upload volume. It is one active version with evidence, extraction quality, and claim coverage strong enough to support deeper follow-up questions.
            </p>
          </SectionPanel>
        </div>
        <div className="resume-layout__workspace-side">
          {profileCard}
          <SectionPanel className="workspace-note-card" variant="muted">
            <span className="page-card__label">Resume workflow</span>
            <h2 className="page-card__title">Create, upload, activate, then inspect one version at a time</h2>
            <p className="page-card__body">
              Stabilize one active interview context while you inspect structured extraction, risks, and section-level evidence below.
            </p>
          </SectionPanel>
        </div>
      </div>
      <div className="page-stack">
        {notices}
        {libraryIntro}
        <div className="resume-layout__document">
          <div className="page-stack">
            {listContent}
          </div>
        </div>
      </div>
    </div>
  );
}
