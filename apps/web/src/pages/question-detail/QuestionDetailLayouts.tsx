import type { ReactNode } from "react";

type QuestionDetailLayoutProps = {
  headerSection: ReactNode;
  metadataSection: ReactNode;
  progressSection: ReactNode;
  answerHistorySection: ReactNode;
  materialsSection: ReactNode;
  recommendedSection: ReactNode;
};

export function QuestionDetailMobileLayout({
  headerSection,
  metadataSection,
  progressSection,
  answerHistorySection,
  materialsSection,
  recommendedSection,
}: QuestionDetailLayoutProps) {
  return (
    <div className="question-detail-layout question-detail-layout--mobile">
      <section className="question-detail-layout__hero">{headerSection}</section>
      <section className="question-detail-layout__main">
        {recommendedSection}
        {materialsSection}
      </section>
      <section className="question-detail-layout__sidebar">
        {metadataSection}
        {progressSection}
      </section>
      <section className="question-detail-layout__history">
        {answerHistorySection}
      </section>
    </div>
  );
}

export function QuestionDetailDesktopLayout({
  headerSection,
  metadataSection,
  progressSection,
  answerHistorySection,
  materialsSection,
  recommendedSection,
}: QuestionDetailLayoutProps) {
  return (
    <div className="question-detail-layout question-detail-layout--desktop">
      <div className="question-detail-layout__hero">{headerSection}</div>
      <div className="question-detail-layout__main question-detail-layout__main--primary">
        <div className="page-stack question-detail-layout__cluster">
          {recommendedSection}
          {answerHistorySection}
        </div>
      </div>
      <div className="question-detail-layout__study-rail">
        <div className="page-stack question-detail-layout__cluster">
          {materialsSection}
        </div>
      </div>
      <aside className="question-detail-layout__sidebar">
        <div className="page-stack question-detail-layout__cluster">
          {metadataSection}
          {progressSection}
        </div>
      </aside>
    </div>
  );
}
