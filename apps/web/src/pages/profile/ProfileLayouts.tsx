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
          <h2 className="page-card__title">Keep profile details separate from workspace tools</h2>
        </div>
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
          <h2 className="page-card__title">Group practice defaults and appearance</h2>
          {desktop ? (
            <p className="page-card__body">
              Thresholds, retry behavior, language, and theme stay together so the screen reads more like settings than a dashboard.
            </p>
          ) : null}
        </div>
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
          <h2 className="page-card__title">Manage target companies separately from account edits</h2>
        </div>
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
      <div className="profile-layout__hero">{summaryCard}</div>
      <div className="profile-layout__main page-stack">
        <AccountCluster>{profileForm}</AccountCluster>
        <PreferencesCluster
          desktop={false}
          settingsForm={settingsForm}
          themeSettingsCard={themeSettingsCard}
        />
        <FocusCluster>{targetCompaniesForm}</FocusCluster>
        <div className="profile-layout__rail">{resumeCard}</div>
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
      <div className="profile-layout__hero">{summaryCard}</div>
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
            <SectionPanel className="profile-workspace-note workspace-note-card" variant="muted">
              <span className="page-card__label">Workspace depth</span>
              <h2 className="page-card__title">Keep resume tools one step away from account settings</h2>
              <p className="page-card__body">
                Use this rail as a launcher into resume, analysis, and interview workspaces without crowding the main settings surface.
              </p>
            </SectionPanel>
          </div>
        </DetailSidebar>
      </div>
    </div>
  );
}
