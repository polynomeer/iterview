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
          {overviewCard}
          <SectionPanel className="workspace-note-card workspace-note-card--accent resume-layout__source-note" variant="muted">
            <span className="page-card__label">{isKorean ? "기준 문서" : "Source of truth"}</span>
            <h2 className="page-card__title">{isKorean ? "모의 면접 전에 방어 가능한 이력서 컨텍스트 하나를 만드세요" : "Build one defendable resume context before mock interviews begin"}</h2>
            <p className="page-card__body">
              {isKorean
                ? "목표는 업로드 개수가 아닙니다. 더 깊은 꼬리질문을 버틸 만큼 근거, 추출 품질, 주장 범위가 갖춰진 활성 버전 하나입니다."
                : "The goal is not upload volume. It is one active version with evidence, extraction quality, and claim coverage strong enough to support deeper follow-up questions."}
            </p>
          </SectionPanel>
        </div>
        <div className="resume-layout__workspace-side">
          {profileCard}
          <SectionPanel className="workspace-note-card" variant="muted">
            <span className="page-card__label">{isKorean ? "이력서 워크플로우" : "Resume workflow"}</span>
            <h2 className="page-card__title">{isKorean ? "생성, 업로드, 활성화 후 한 버전씩 점검하세요" : "Create, upload, activate, then inspect one version at a time"}</h2>
            <p className="page-card__body">
              {isKorean
                ? "아래의 구조화 추출, 리스크, 섹션별 근거를 점검하면서 활성 인터뷰 컨텍스트 하나를 안정화하세요."
                : "Stabilize one active interview context while you inspect structured extraction, risks, and section-level evidence below."}
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
