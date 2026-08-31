import type { ReactNode } from "react";
import { useLocale } from "../../shared/i18n";
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
      <section className="question-detail-layout__hero">{headerSection}</section>
      <section className="question-detail-layout__workspace-summary">{insightSummary}</section>
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
  useLocale();

  return (
    <div className="question-detail-layout question-detail-layout--desktop">
      <aside className="question-detail-layout__study-rail">
        <div className="page-stack question-detail-layout__cluster">
          <section className="question-detail-layout__workspace-summary">{workspaceSummary}</section>
          {progressSection}
        </div>
      </aside>
      <div className="question-detail-layout__main question-detail-layout__main--primary">
        <div className="question-detail-layout__hero">{headerSection}</div>
        <div className="page-stack question-detail-layout__cluster">
          {answerHistorySection}
          {recommendedSection}
        </div>
      </div>
      <aside className="question-detail-layout__sidebar">
        <div className="page-stack question-detail-layout__cluster">
          <section className="question-detail-layout__workspace-summary">{insightSummary}</section>
          {metadataSection}
          {materialsSection}
        </div>
      </aside>
    </div>
  );
}
