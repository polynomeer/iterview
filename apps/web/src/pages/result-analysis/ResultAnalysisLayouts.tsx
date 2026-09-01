import type { ReactNode } from "react";

type ResultAnalysisLayoutProps = {
  workspaceSummary: ReactNode;
  scoreSection: ReactNode;
  dimensionSection: ReactNode;
  detailedFeedbackSection: ReactNode;
  insightSection: ReactNode;
  modelAnswerSection: ReactNode;
  feedbackSection: ReactNode;
  nextActionSection: ReactNode;
  recommendationSection: ReactNode;
};

export function ResultAnalysisMobileLayout({
  workspaceSummary,
  scoreSection,
  dimensionSection,
  detailedFeedbackSection,
  insightSection,
  modelAnswerSection,
  feedbackSection,
  nextActionSection,
  recommendationSection,
}: ResultAnalysisLayoutProps) {
  return (
    <div className="result-analysis-layout result-analysis-layout--mobile">
      <section className="result-analysis-layout__workspace-summary">{workspaceSummary}</section>
      <section className="result-analysis-layout__hero">{scoreSection}</section>
      <section className="result-analysis-layout__group result-analysis-layout__group--priority">
        {nextActionSection}
        {recommendationSection}
      </section>
      <section className="result-analysis-layout__group result-analysis-layout__group--analysis">
        {dimensionSection}
        {insightSection}
        {detailedFeedbackSection}
      </section>
      <section className="result-analysis-layout__group result-analysis-layout__group--support">
        {modelAnswerSection}
        {feedbackSection}
      </section>
    </div>
  );
}

export function ResultAnalysisDesktopLayout({
  workspaceSummary,
  scoreSection,
  dimensionSection,
  detailedFeedbackSection,
  insightSection,
  modelAnswerSection,
  feedbackSection,
  nextActionSection,
  recommendationSection,
}: ResultAnalysisLayoutProps) {
  return (
    <div className="result-analysis-layout result-analysis-layout--desktop">
      <main className="result-analysis-layout__main">
        <div className="page-stack result-analysis-layout__panel result-analysis-layout__panel--primary">
          {workspaceSummary}
          {scoreSection}
          {dimensionSection}
          <div className="result-analysis-layout__insight-grid">
            {detailedFeedbackSection}
            {insightSection}
          </div>
          <div className="result-analysis-layout__follow-up">
            {recommendationSection}
          </div>
        </div>
      </main>
      <aside className="result-analysis-layout__side">
        <div className="page-stack result-analysis-layout__panel">
          {nextActionSection}
          {modelAnswerSection}
          {feedbackSection}
        </div>
      </aside>
    </div>
  );
}
