import type { ReactNode } from "react";
import { ContentGrid, DetailSidebar, SectionPanel } from "../../shared/ui/layout";

type ProfileLayoutProps = {
  summaryCard: ReactNode;
  overviewCard: ReactNode;
  resumeCard: ReactNode;
  contextRailCard: ReactNode;
  profileForm: ReactNode;
  operationsCard: ReactNode;
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

function OperationsCluster({ children }: { children: ReactNode }) {
  return (
    <SectionPanel className="profile-section-cluster profile-section-cluster--preferences">
      <div className="section-heading profile-section-cluster__header">
        <div>
          <p className="section-heading__eyebrow">Operations lane</p>
          <h2 className="page-card__title">Open the workspaces that change how the system behaves around you</h2>
          <p className="page-card__body">
            Settings and company targeting now live outside profile so identity editing stays calm
            while operational controls stay near the work they influence.
          </p>
        </div>
        <span className="detail-chip detail-chip--accent">System controls</span>
      </div>
      <div className="page-stack">{children}</div>
    </SectionPanel>
  );
}

export function ProfileMobileLayout({
  summaryCard,
  overviewCard,
  resumeCard,
  contextRailCard,
  profileForm,
  operationsCard,
}: ProfileLayoutProps) {
  return (
    <div className="profile-layout">
      <div className="profile-layout__hero">
        {summaryCard}
        {overviewCard}
      </div>
      <div className="profile-layout__main page-stack">
        <div className="profile-layout__rail">
          {resumeCard}
          {contextRailCard}
        </div>
        <AccountCluster>{profileForm}</AccountCluster>
        <OperationsCluster>{operationsCard}</OperationsCluster>
      </div>
    </div>
  );
}

export function ProfileDesktopLayout({
  summaryCard,
  overviewCard,
  resumeCard,
  contextRailCard,
  profileForm,
  operationsCard,
}: ProfileLayoutProps) {
  return (
    <div className="profile-layout profile-layout--desktop">
      <div className="profile-layout__hero">
        {summaryCard}
        {overviewCard}
      </div>
      <div className="profile-layout__workspace">
        <div className="profile-layout__main page-stack">
          <AccountCluster>{profileForm}</AccountCluster>
          <OperationsCluster>{operationsCard}</OperationsCluster>
        </div>
        <DetailSidebar>
          <div className="page-stack profile-layout__rail">
            {resumeCard}
            {contextRailCard}
          </div>
        </DetailSidebar>
      </div>
    </div>
  );
}
