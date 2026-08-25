import type { ReactNode } from "react";
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
  return (
    <div className="question-detail-layout question-detail-layout--desktop">
      <section className="question-detail-layout__workspace-summary">{workspaceSummary}</section>
      <section className="question-detail-layout__workspace-summary">{insightSummary}</section>
      <div className="question-detail-layout__hero">
        {headerSection}
        <SectionPanel className="workspace-note-card workspace-note-card--accent question-detail-layout__hero-note" variant="muted">
          <div className="question-detail-layout__note-header">
            <span className="page-card__label">Inspector rule</span>
            <span className="detail-chip detail-chip--accent">Entry lane</span>
          </div>
          <h2 className="page-card__title">Keep the prompt dominant, then read only the context needed for the next decision</h2>
          <p className="page-card__body">
            The question stays central. History, support, and follow-up branches should sharpen the next step instead of turning this page into a detached reading screen.
          </p>
          <div className="question-detail-layout__note-rules">
            <div className="question-detail-layout__note-rule">
              <strong>1. Core claim</strong>
              <span>Decide the main answer line before opening the deeper tree.</span>
            </div>
            <div className="question-detail-layout__note-rule">
              <strong>2. Evidence check</strong>
              <span>Keep resume facts and support material in view while tightening the branch.</span>
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
              <span className="page-card__label">Inspector lane</span>
              <span className="detail-chip">Decision rail</span>
            </div>
            <h2 className="page-card__title">Use this rail to decide whether the node is ready for another pass</h2>
            <p className="page-card__body">
              Progress, metadata, company context, and related roles belong in one decision lane so the next answer can stay specific instead of drifting into generic prep.
            </p>
            <div className="question-detail-layout__note-rules">
              <div className="question-detail-layout__note-rule">
                <strong>Retry signal</strong>
                <span>Return to this node when the answer is broad, weakly sourced, or under-scoped.</span>
              </div>
              <div className="question-detail-layout__note-rule">
                <strong>Next action</strong>
                <span>Choose whether to answer now, study support first, or open the follow-up tree.</span>
              </div>
            </div>
          </SectionPanel>
        </div>
      </aside>
    </div>
  );
}
