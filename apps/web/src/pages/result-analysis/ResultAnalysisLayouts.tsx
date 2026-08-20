import type { ReactNode } from "react";
import { ContentGrid } from "../../shared/ui/layout";

type ResultAnalysisLayoutProps = {
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
      {scoreSection}
      <div className="result-analysis-layout__group">
        {dimensionSection}
        {detailedFeedbackSection}
      </div>
      <div className="result-analysis-layout__group">
        {insightSection}
        {nextActionSection}
      </div>
      <div className="result-analysis-layout__group">
        {recommendationSection}
        {modelAnswerSection}
        {feedbackSection}
      </div>
    </div>
  );
}

export function ResultAnalysisDesktopLayout({
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
      <div className="result-analysis-layout__hero">{scoreSection}</div>
      <ContentGrid columns="two">
        <div className="page-stack result-analysis-layout__panel">
          {dimensionSection}
          {detailedFeedbackSection}
          {insightSection}
        </div>
        <div className="page-stack result-analysis-layout__panel">
          {nextActionSection}
          {recommendationSection}
          {modelAnswerSection}
        </div>
      </ContentGrid>
      <div className="result-analysis-layout__feedback workspace-band">{feedbackSection}</div>
    </div>
  );
}
