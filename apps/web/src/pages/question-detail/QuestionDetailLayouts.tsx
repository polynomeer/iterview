import type { ReactNode } from "react";
import { useLocale } from "../../shared/i18n";
import { SectionPanel } from "../../shared/ui/layout";

type QuestionDetailLayoutProps = {
  workspaceSummary: ReactNode;
  insightSummary: ReactNode;
  headerSection: ReactNode;
  metadataSection: ReactNode;
  progressSection: ReactNode;
  answerHistorySection: ReactNode;
  materialsSection: ReactNode;
  recommendedSection: ReactNode;
};

export function QuestionDetailMobileLayout({
  workspaceSummary,
  insightSummary,
  headerSection,
  metadataSection,
  progressSection,
  answerHistorySection,
  materialsSection,
  recommendedSection,
}: QuestionDetailLayoutProps) {
  return (
    <div className="question-detail-layout question-detail-layout--mobile">
      <section className="question-detail-layout__workspace-summary">{workspaceSummary}</section>
      <section className="question-detail-layout__workspace-summary">{insightSummary}</section>
      <section className="question-detail-layout__hero">{headerSection}</section>
      <section className="question-detail-layout__sidebar">
        {progressSection}
        {metadataSection}
      </section>
      <section className="question-detail-layout__main">
        {materialsSection}
        {recommendedSection}
      </section>
      <section className="question-detail-layout__history">
        {answerHistorySection}
      </section>
    </div>
  );
}

export function QuestionDetailDesktopLayout({
  workspaceSummary,
  insightSummary,
  headerSection,
  metadataSection,
  progressSection,
  answerHistorySection,
  materialsSection,
  recommendedSection,
}: QuestionDetailLayoutProps) {
  const { locale } = useLocale();
  const isKorean = locale === "ko";

  return (
    <div className="question-detail-layout question-detail-layout--desktop">
      <section className="question-detail-layout__workspace-summary">{workspaceSummary}</section>
      <section className="question-detail-layout__workspace-summary">{insightSummary}</section>
      <div className="question-detail-layout__hero">
        {headerSection}
        <SectionPanel className="workspace-note-card workspace-note-card--accent question-detail-layout__hero-note" variant="muted">
          <div className="question-detail-layout__note-header">
            <span className="page-card__label">{isKorean ? "인스펙터 규칙" : "Inspector rule"}</span>
            <span className="detail-chip detail-chip--accent">{isKorean ? "진입 레인" : "Entry lane"}</span>
          </div>
          <h2 className="page-card__title">
            {isKorean
              ? "질문 문구를 중심에 두고 다음 결정을 위한 맥락만 읽으세요"
              : "Keep the prompt dominant, then read only the context needed for the next decision"}
          </h2>
          <p className="page-card__body">
            {isKorean
              ? "질문이 항상 중심에 있어야 합니다. 히스토리, 보조 자료, 후속 가지는 이 페이지를 읽기 전용 화면으로 만들기보다 다음 행동을 더 날카롭게 만드는 데 써야 합니다."
              : "The question stays central. History, support, and follow-up branches should sharpen the next step instead of turning this page into a detached reading screen."}
          </p>
          <div className="question-detail-layout__note-rules">
            <div className="question-detail-layout__note-rule">
              <strong>{isKorean ? "1. 핵심 주장" : "1. Core claim"}</strong>
              <span>{isKorean ? "더 깊은 트리를 열기 전에 주 답변 라인을 먼저 정하세요." : "Decide the main answer line before opening the deeper tree."}</span>
            </div>
            <div className="question-detail-layout__note-rule">
              <strong>{isKorean ? "2. 근거 점검" : "2. Evidence check"}</strong>
              <span>{isKorean ? "가지를 다듬는 동안 이력서 사실과 보조 자료를 계속 시야에 두세요." : "Keep resume facts and support material in view while tightening the branch."}</span>
            </div>
          </div>
        </SectionPanel>
      </div>
      <div className="question-detail-layout__main question-detail-layout__main--primary">
        <div className="page-stack question-detail-layout__cluster">
          {answerHistorySection}
          {recommendedSection}
        </div>
      </div>
      <div className="question-detail-layout__study-rail">
        <div className="page-stack question-detail-layout__cluster">
          {materialsSection}
        </div>
      </div>
      <aside className="question-detail-layout__sidebar">
        <div className="page-stack question-detail-layout__cluster">
          {progressSection}
          {metadataSection}
          <SectionPanel className="workspace-note-card question-detail-layout__inspector-note" variant="muted">
            <div className="question-detail-layout__note-header">
              <span className="page-card__label">{isKorean ? "인스펙터 레인" : "Inspector lane"}</span>
              <span className="detail-chip">{isKorean ? "판단 레일" : "Decision rail"}</span>
            </div>
            <h2 className="page-card__title">
              {isKorean
                ? "이 레일에서 이 노드를 다시 다듬을 준비가 되었는지 판단하세요"
                : "Use this rail to decide whether the node is ready for another pass"}
            </h2>
            <p className="page-card__body">
              {isKorean
                ? "진행 상태, 메타데이터, 회사 맥락, 관련 역할은 하나의 판단 레인에 모여 있어야 다음 답변이 일반론으로 흐르지 않고 구체성을 유지할 수 있습니다."
                : "Progress, metadata, company context, and related roles belong in one decision lane so the next answer can stay specific instead of drifting into generic prep."}
            </p>
            <div className="question-detail-layout__note-rules">
              <div className="question-detail-layout__note-rule">
                <strong>{isKorean ? "재도전 신호" : "Retry signal"}</strong>
                <span>{isKorean ? "답변이 넓고, 근거가 약하거나, 범위가 흐리면 이 노드로 돌아오세요." : "Return to this node when the answer is broad, weakly sourced, or under-scoped."}</span>
              </div>
              <div className="question-detail-layout__note-rule">
                <strong>{isKorean ? "다음 행동" : "Next action"}</strong>
                <span>{isKorean ? "지금 답할지, 먼저 자료를 볼지, 후속 질문 트리를 열지 선택하세요." : "Choose whether to answer now, study support first, or open the follow-up tree."}</span>
              </div>
            </div>
          </SectionPanel>
        </div>
      </aside>
    </div>
  );
}
