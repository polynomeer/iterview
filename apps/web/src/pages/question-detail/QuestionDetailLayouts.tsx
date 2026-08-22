import type { ReactNode } from "react";
import { SectionPanel } from "../../shared/ui/layout";

type QuestionDetailLayoutProps = {
  workspaceSummary: ReactNode;
  headerSection: ReactNode;
  metadataSection: ReactNode;
  progressSection: ReactNode;
  answerHistorySection: ReactNode;
  materialsSection: ReactNode;
  recommendedSection: ReactNode;
};

export function QuestionDetailMobileLayout({
  workspaceSummary,
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
  headerSection,
  metadataSection,
  progressSection,
  answerHistorySection,
  materialsSection,
  recommendedSection,
}: QuestionDetailLayoutProps) {
  return (
    <div className="question-detail-layout question-detail-layout--desktop">
      <section className="question-detail-layout__workspace-summary">{workspaceSummary}</section>
      <div className="question-detail-layout__hero">
        {headerSection}
        <SectionPanel className="workspace-note-card workspace-note-card--accent question-detail-layout__hero-note" variant="muted">
          <span className="page-card__label">Preparation flow</span>
          <h2 className="page-card__title">Anchor on the prompt, then defend it with evidence and past attempts</h2>
          <p className="page-card__body">
            The main prompt should stay dominant, while study materials, answer history, and follow-up branches remain close enough to support a deeper practice pass.
          </p>
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
          <SectionPanel className="workspace-note-card" variant="muted">
            <span className="page-card__label">Study rail</span>
            <h2 className="page-card__title">Keep source material beside the question instead of below it</h2>
            <p className="page-card__body">
              Notes, references, and learning resources should feel like a supporting rail, not a separate page that breaks the answer-preparation flow.
            </p>
          </SectionPanel>
        </div>
      </div>
      <aside className="question-detail-layout__sidebar">
        <div className="page-stack question-detail-layout__cluster">
          {progressSection}
          {metadataSection}
        </div>
      </aside>
    </div>
  );
}
