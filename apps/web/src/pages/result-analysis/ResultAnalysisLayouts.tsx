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
      <aside className="result-analysis-layout__workspace-summary">
        <div className="page-stack">
          {workspaceSummary}
          {scoreSection}
          {nextActionSection}
        </div>
      </aside>
      <div className="result-analysis-layout__main">
        <div className="page-stack result-analysis-layout__panel">
          {dimensionSection}
          {insightSection}
          {detailedFeedbackSection}
          {recommendationSection}
        </div>
      </div>
      <aside className="result-analysis-layout__side">
        <div className="page-stack result-analysis-layout__panel">
          {modelAnswerSection}
          {feedbackSection}
        </div>
      </aside>
    </div>
  );
}
