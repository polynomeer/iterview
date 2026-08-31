import type { ReactNode } from "react";
import { SectionPanel } from "../../shared/ui/layout";
import { useLocale } from "../../shared/i18n";

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
  const { locale } = useLocale();
  const isKorean = locale === "ko";

  return (
    <div className="resume-layout resume-layout--mobile">
      <section className="resume-layout__workspace-main">
        {overviewCard}
        <SectionPanel className="workspace-note-card workspace-note-card--accent" variant="muted">
          <span className="page-card__label">{isKorean ? "기준 문서" : "Source of truth"}</span>
          <h2 className="page-card__title">{isKorean ? "각 이력서 버전을 저장소가 아니라 근거로 다루세요" : "Treat each resume version as evidence, not storage"}</h2>
          <p className="page-card__body">
            {isKorean
              ? "활성 버전은 하나로 유지하고, 추출된 주장들을 점검하면서 질문 트리가 깊어질 때 방어해야 하는 문장을 다듬으세요."
              : "Keep one active version, inspect extracted claims, and tighten every line you may need to defend when the question tree drills deeper."}
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
  const { locale } = useLocale();
  const isKorean = locale === "ko";

  return (
    <div className="resume-layout resume-layout--desktop">
      <div className="resume-layout__workspace">
        <div className="resume-layout__workspace-main">
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
        <aside className="resume-layout__workspace-side">
          {overviewCard}
          {profileCard}
          <SectionPanel className="workspace-note-card workspace-note-card--accent resume-layout__source-note" variant="muted">
            <span className="page-card__label">{isKorean ? "기준 문서" : "Source of truth"}</span>
            <h2 className="page-card__title">{isKorean ? "활성 버전 하나를 면접의 단일 기준 문서로 유지하세요" : "Keep one active version as the interview source of truth"}</h2>
            <p className="page-card__body">
              {isKorean
                ? "업로드 수를 늘리는 대신 현재 버전의 주장, 근거, 추출 결과를 먼저 단단하게 만든 뒤 DFS 질문 트리로 내려가세요."
                : "Instead of adding more uploads, harden the current version's claims, evidence, and extraction before going deeper into the DFS question tree."}
            </p>
          </SectionPanel>
          <SectionPanel className="workspace-note-card" variant="muted">
            <span className="page-card__label">{isKorean ? "이력서 워크플로우" : "Resume workflow"}</span>
            <h2 className="page-card__title">{isKorean ? "생성, 업로드, 활성화 후 한 버전씩 점검하세요" : "Create, upload, activate, then inspect one version at a time"}</h2>
            <p className="page-card__body">
              {isKorean
                ? "아래의 구조화 추출, 리스크, 섹션별 근거를 점검하면서 활성 인터뷰 컨텍스트 하나를 안정화하세요."
                : "Stabilize one active interview context while you inspect structured extraction, risks, and section-level evidence below."}
            </p>
          </SectionPanel>
        </aside>
      </div>
    </div>
  );
}
