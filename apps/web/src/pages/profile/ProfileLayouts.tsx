import type { ReactNode } from "react";
import { ContentGrid, DetailSidebar, SectionPanel } from "../../shared/ui/layout";

type ProfileLayoutProps = {
  summaryCard: ReactNode;
  resumeCard: ReactNode;
  profileForm: ReactNode;
  settingsForm: ReactNode;
  themeSettingsCard: ReactNode;
  targetCompaniesForm: ReactNode;
};

function AccountCluster({ children }: { children: ReactNode }) {
  return (
    <SectionPanel className="profile-section-cluster profile-section-cluster--account">
      <div className="section-heading profile-section-cluster__header">
        <div>
          <p className="section-heading__eyebrow">Identity lane</p>
          <h2 className="page-card__title">Edit personal identity without mixing in interview operations</h2>
          <p className="page-card__body">
            Keep only the stable account facts here so this lane reads quickly and never competes
            with practice controls.
          </p>
        </div>
        <span className="detail-chip">Account basics</span>
      </div>
      <div className="page-stack">{children}</div>
    </SectionPanel>
  );
}

function PreferencesCluster({
  settingsForm,
  themeSettingsCard,
  desktop,
}: {
  settingsForm: ReactNode;
  themeSettingsCard: ReactNode;
  desktop: boolean;
}) {
  return (
    <SectionPanel className="profile-section-cluster profile-section-cluster--preferences">
      <div className="section-heading profile-section-cluster__header">
        <div>
          <p className="section-heading__eyebrow">Practice defaults</p>
          <h2 className="page-card__title">Keep scoring defaults and visual preferences together</h2>
          <p className="page-card__body">
            Thresholds, retry behavior, language, and theme belong to one settings lane so the
            page reads like a clean control room instead of a mixed dashboard.
          </p>
        </div>
        <span className="detail-chip detail-chip--accent">System controls</span>
      </div>
      {desktop ? (
        <ContentGrid columns="two">
          {settingsForm}
          {themeSettingsCard}
        </ContentGrid>
      ) : (
        <div className="page-stack">
          {settingsForm}
          {themeSettingsCard}
        </div>
      )}
    </SectionPanel>
  );
}

function FocusCluster({ children }: { children: ReactNode }) {
  return (
    <SectionPanel className="profile-section-cluster profile-section-cluster--focus">
      <div className="section-heading profile-section-cluster__header">
        <div>
          <p className="section-heading__eyebrow">Targeting lane</p>
          <h2 className="page-card__title">Separate target company focus from personal account edits</h2>
          <p className="page-card__body">
            Company targeting changes often; keeping it isolated prevents the account surface from
            feeling noisy.
          </p>
        </div>
        <span className="detail-chip">Focus list</span>
      </div>
      <div className="page-stack">{children}</div>
    </SectionPanel>
  );
}

export function ProfileMobileLayout({
  summaryCard,
  resumeCard,
  profileForm,
  settingsForm,
  themeSettingsCard,
  targetCompaniesForm,
}: ProfileLayoutProps) {
  return (
    <div className="profile-layout">
      <div className="profile-layout__hero">
        {summaryCard}
        <SectionPanel className="workspace-note-card" variant="muted">
          <span className="page-card__label">Workspace map</span>
          <h2 className="page-card__title">Keep setup work separate from resume evidence and interview drills</h2>
          <p className="page-card__body">
            The account screen should stay calm. Resume parsing and mock interview depth belong in their own workspaces so this page remains easy to scan.
          </p>
        </SectionPanel>
      </div>
      <div className="profile-layout__main page-stack">
        <div className="profile-layout__rail">{resumeCard}</div>
        <AccountCluster>{profileForm}</AccountCluster>
        <PreferencesCluster
          desktop={false}
          settingsForm={settingsForm}
          themeSettingsCard={themeSettingsCard}
        />
        <FocusCluster>{targetCompaniesForm}</FocusCluster>
      </div>
    </div>
  );
}

export function ProfileDesktopLayout({
  summaryCard,
  resumeCard,
  profileForm,
  settingsForm,
  themeSettingsCard,
  targetCompaniesForm,
}: ProfileLayoutProps) {
  return (
    <div className="profile-layout profile-layout--desktop">
      <div className="profile-layout__hero">
        {summaryCard}
        <SectionPanel className="profile-workspace-note workspace-note-card" variant="muted">
          <span className="page-card__label">Workspace depth</span>
          <h2 className="page-card__title">Launch deeper workspaces without crowding the settings lane</h2>
          <p className="page-card__body">
            Use this rail as a controlled bridge into resume, analysis, and interview flows while the main surface stays focused on profile decisions.
          </p>
        </SectionPanel>
      </div>
      <div className="profile-layout__workspace">
        <div className="profile-layout__main page-stack">
          <AccountCluster>{profileForm}</AccountCluster>
          <PreferencesCluster
            desktop
            settingsForm={settingsForm}
            themeSettingsCard={themeSettingsCard}
          />
          <FocusCluster>{targetCompaniesForm}</FocusCluster>
        </div>
        <DetailSidebar>
          <div className="page-stack profile-layout__rail">
            {resumeCard}
          </div>
        </DetailSidebar>
      </div>
    </div>
  );
}
