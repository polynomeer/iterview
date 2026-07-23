import { useNavigate, useParams } from "react-router-dom";
import { useResultAnalysisQuery } from "../../features/result/api/useResultAnalysisQuery";
import { routeConfig } from "../../shared/config/routes";
import { getErrorDetails } from "../../shared/api/errors";
import { ErrorStateCard } from "../../shared/ui/ErrorStateCard";
import { useLayoutMode } from "../../shared/ui/layout";
import { LoadingStateCard } from "../../shared/ui/LoadingStateCard";
import { PageContainer } from "../../shared/ui/PageContainer";
import { ResultAnalysisDesktopLayout, ResultAnalysisMobileLayout } from "./ResultAnalysisLayouts";
import {
  AnalysisInsightSection,
  DetailedFeedbackSection,
  DimensionScoreList,
  FeedbackList,
  FollowUpRecommendationSection,
  ModelAnswerSection,
  NextActionCard,
  ScoreSummaryCard,
} from "../../widgets/result";

export function ResultAnalysisPage() {
  const navigate = useNavigate();
  const { answerAttemptId } = useParams<{ answerAttemptId: string }>();
  const { isDesktop } = useLayoutMode();
  const resultQuery = useResultAnalysisQuery(answerAttemptId);

  if (!answerAttemptId) {
    return (
      <PageContainer
        description="The result route is missing the answer attempt identifier."
        eyebrow="Results"
        title="Result not found"
      >
        <ErrorStateCard
          actionLabel="Back to practice"
          body="Open a question and submit an answer before trying to view a result."
          onAction={() => {
            navigate(routeConfig.practice.buildPath());
          }}
          title="Missing answer attempt id"
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer
      description="Review your total score, dimension-level breakdown, feedback, and the recommended next step."
      eyebrow="Results"
      title="Result analysis"
    >
      {resultQuery.isLoading ? (
        <LoadingStateCard
          body="Loading the full evaluation result for this answer attempt."
          title="Preparing your analysis"
        />
      ) : null}

      {resultQuery.isError ? (
        <ErrorStateCard
          body={
            resultQuery.error instanceof Error
              ? resultQuery.error.message
              : "The answer result could not be loaded."
          }
          details={getErrorDetails(resultQuery.error)}
          onAction={() => {
            void resultQuery.refetch();
          }}
          title="Unable to load result analysis"
        />
      ) : null}

      {!resultQuery.isLoading && !resultQuery.isError && resultQuery.data
        ? (() => {
            const nextActionCard = (
              <NextActionCard
                answerPath={routeConfig.answerEditor.buildPath({ questionId: resultQuery.data.questionId })}
                archivePath={routeConfig.archive.buildPath()}
                archiveDecisionLabel={resultQuery.data.archiveDecisionLabel}
                nextReviewLabel={resultQuery.data.nextReviewLabel}
                progressStatusLabel={resultQuery.data.progressStatusLabel}
                questionPath={routeConfig.questionDetail.buildPath({ questionId: resultQuery.data.questionId })}
              />
            );

            if (!isDesktop) {
              return (
                <ResultAnalysisMobileLayout
                  detailedFeedbackSection={<DetailedFeedbackSection result={resultQuery.data} />}
                  dimensionSection={<DimensionScoreList dimensions={resultQuery.data.dimensions} />}
                  feedbackSection={<FeedbackList items={resultQuery.data.feedbackItems} />}
                  insightSection={<AnalysisInsightSection result={resultQuery.data} />}
                  modelAnswerSection={<ModelAnswerSection result={resultQuery.data} />}
                  nextActionSection={nextActionCard}
                  recommendationSection={
                    <FollowUpRecommendationSection items={resultQuery.data.followUpRecommendations ?? []} />
                  }
                  scoreSection={<ScoreSummaryCard result={resultQuery.data} />}
                />
              );
            }

            return (
              <ResultAnalysisDesktopLayout
                detailedFeedbackSection={<DetailedFeedbackSection result={resultQuery.data} />}
                dimensionSection={<DimensionScoreList dimensions={resultQuery.data.dimensions} />}
                feedbackSection={<FeedbackList items={resultQuery.data.feedbackItems} />}
                insightSection={<AnalysisInsightSection result={resultQuery.data} />}
                modelAnswerSection={<ModelAnswerSection result={resultQuery.data} />}
                nextActionSection={nextActionCard}
                recommendationSection={
                  <FollowUpRecommendationSection items={resultQuery.data.followUpRecommendations ?? []} />
                }
                scoreSection={<ScoreSummaryCard result={resultQuery.data} />}
              />
            );
          })()
        : null}
    </PageContainer>
  );
}
