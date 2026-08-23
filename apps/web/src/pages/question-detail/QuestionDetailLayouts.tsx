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
          <div className="question-detail-layout__note-header">
            <span className="page-card__label">Node workflow</span>
            <span className="detail-chip detail-chip--accent">Primary lane</span>
          </div>
          <h2 className="page-card__title">Anchor on the prompt, then inspect context before writing the next answer</h2>
          <p className="page-card__body">
            The main node stays dominant. Evidence, answer history, and follow-up branches stay near it so the question detail screen behaves like an inspector, not a detached reading page.
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
            <div className="question-detail-layout__note-header">
              <span className="page-card__label">Study rail</span>
              <span className="detail-chip">Support stack</span>
            </div>
            <h2 className="page-card__title">Keep source material beside the node instead of below the page</h2>
            <p className="page-card__body">
              Notes, references, and learning resources should act like a support rail that sharpens the next answer, not a separate page that breaks answer preparation.
            </p>
          </SectionPanel>
        </div>
      </div>
      <aside className="question-detail-layout__sidebar">
        <div className="page-stack question-detail-layout__cluster">
          {progressSection}
          {metadataSection}
          <SectionPanel className="workspace-note-card question-detail-layout__inspector-note" variant="muted">
            <div className="question-detail-layout__note-header">
              <span className="page-card__label">Inspector lane</span>
              <span className="detail-chip">Decision rail</span>
            </div>
            <h2 className="page-card__title">Use this rail to decide whether the node is ready for another pass</h2>
            <p className="page-card__body">
              Progress, metadata, company context, and related roles belong in one decision lane so the next answer can stay specific instead of drifting into generic prep.
            </p>
          </SectionPanel>
        </div>
      </aside>
    </div>
  );
}
