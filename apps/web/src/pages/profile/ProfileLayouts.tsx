import type { ReactNode } from "react";
import { useLocale } from "../../shared/i18n";
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
  const { locale } = useLocale();
  const isKorean = locale === "ko";

  return (
    <SectionPanel className="profile-section-cluster profile-section-cluster--account">
      <div className="section-heading profile-section-cluster__header">
        <div>
          <p className="section-heading__eyebrow">{isKorean ? "정체성 레인" : "Identity lane"}</p>
          <h2 className="page-card__title">
            {isKorean
              ? "인터뷰 운영 설정을 섞지 않고 개인 정체성만 편집하세요"
              : "Edit personal identity without mixing in interview operations"}
          </h2>
          <p className="page-card__body">
            {isKorean
              ? "이 레인에는 변하지 않는 계정 정보만 남겨 두세요. 빠르게 읽히고 연습 제어와 경쟁하지 않아야 합니다."
              : "Keep only the stable account facts here so this lane reads quickly and never competes with practice controls."}
          </p>
        </div>
        <span className="detail-chip">{isKorean ? "기본 계정 정보" : "Account basics"}</span>
      </div>
      <div className="page-stack">{children}</div>
    </SectionPanel>
  );
}

function OperationsCluster({ children }: { children: ReactNode }) {
  const { locale } = useLocale();
  const isKorean = locale === "ko";

  return (
    <SectionPanel className="profile-section-cluster profile-section-cluster--preferences">
      <div className="section-heading profile-section-cluster__header">
        <div>
          <p className="section-heading__eyebrow">{isKorean ? "운영 레인" : "Operations lane"}</p>
          <h2 className="page-card__title">
            {isKorean
              ? "시스템 동작 방식을 바꾸는 워크스페이스를 여기서 여세요"
              : "Open the workspaces that change how the system behaves around you"}
          </h2>
          <p className="page-card__body">
            {isKorean
              ? "설정과 회사 타기팅은 이제 프로필 밖에 있습니다. 정체성 편집은 차분하게 유지하고, 운영 제어는 실제 영향을 주는 작업 가까이에 두세요."
              : "Settings and company targeting now live outside profile so identity editing stays calm while operational controls stay near the work they influence."}
          </p>
        </div>
        <span className="detail-chip detail-chip--accent">{isKorean ? "시스템 제어" : "System controls"}</span>
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
