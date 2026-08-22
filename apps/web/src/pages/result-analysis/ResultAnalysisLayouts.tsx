import type { ReactNode } from "react";
import { ContentGrid } from "../../shared/ui/layout";

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
      <section className="result-analysis-layout__workspace-summary">{workspaceSummary}</section>
      <div className="result-analysis-layout__hero result-analysis-layout__hero-grid">
        <div className="result-analysis-layout__hero-score">{scoreSection}</div>
        <div className="result-analysis-layout__hero-action">
          {nextActionSection}
          {recommendationSection}
        </div>
      </div>
      <ContentGrid columns="two">
        <div className="page-stack result-analysis-layout__panel">
          {dimensionSection}
          {insightSection}
          {detailedFeedbackSection}
        </div>
        <div className="page-stack result-analysis-layout__panel">
          {modelAnswerSection}
          {feedbackSection}
        </div>
      </ContentGrid>
    </div>
  );
}
