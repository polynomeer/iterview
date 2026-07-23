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
    <div className="page-stack">
      {overviewCard}
      {profileCard}
      {notices}
      {libraryIntro}
      {listContent}
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
        </div>
        <div className="resume-layout__workspace-side">
          {profileCard}
          <SectionPanel variant="muted">
            <span className="page-card__label">Resume workflow</span>
            <h2 className="page-card__title">Create, upload, then inspect one version at a time</h2>
            <p className="page-card__body">
              Keep container creation and upload actions at the top, then move through the selected version details and parsed resume view below without losing context.
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
