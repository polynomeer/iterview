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
            const weakestDimension = resultQuery.data.dimensions.reduce<(typeof resultQuery.data.dimensions)[number] | null>(
              (currentWeakest, dimension) => {
                const dimensionValue = Number(dimension.value);
                const currentValue = currentWeakest ? Number(currentWeakest.value) : Number.POSITIVE_INFINITY;

                if (Number.isNaN(dimensionValue)) {
                  return currentWeakest;
                }

                return !currentWeakest || dimensionValue < currentValue ? dimension : currentWeakest;
              },
              null,
            );
            const strongestSignals =
              resultQuery.data.strengthPoints.length +
              resultQuery.data.feedbackItems.filter((item) => item.tone === "positive").length;
            const improvementSignals =
              resultQuery.data.improvementPoints.length +
              resultQuery.data.weakPatterns.length +
              resultQuery.data.missedPoints.length;
            const workspaceSummary = (
              <section className="page-card result-analysis-workspace-surface">
                <div className="result-analysis-workspace-surface__header">
                  <div className="result-analysis-workspace-surface__intro">
                    <div className="result-analysis-workspace-surface__eyebrow-row">
                      <span className="page-card__label">Result workspace</span>
                      <span className="question-status-badge question-status-badge--accent">Review loop</span>
                    </div>
                    <p className="result-analysis-workspace-surface__breadcrumbs">
                      Score verdict
                      <span>/</span>
                      Weakest dimension
                      <span>/</span>
                      Next simulation
                    </p>
                    <h2 className="result-analysis-workspace-surface__title">
                      Turn this evaluation into the next stronger answer
                    </h2>
                    <p className="result-analysis-workspace-surface__body">
                      Read the verdict, isolate the weakest branch, and decide whether the next loop should be an
                      immediate retry or a deeper follow-up question.
                    </p>
                  </div>
                  <div className="result-analysis-workspace-surface__stats">
                    <article className="result-analysis-workspace-surface__stat">
                      <span>Total score</span>
                      <strong>{`${resultQuery.data.totalScore} / 100`}</strong>
                    </article>
                    <article className="result-analysis-workspace-surface__stat">
                      <span>Weakest dimension</span>
                      <strong>{weakestDimension ? `${weakestDimension.label} ${weakestDimension.value}` : "Pending"}</strong>
                    </article>
                    <article className="result-analysis-workspace-surface__stat">
                      <span>Improvement signals</span>
                      <strong>{improvementSignals}</strong>
                    </article>
                    <article className="result-analysis-workspace-surface__stat">
                      <span>Next prompts</span>
                      <strong>{resultQuery.data.followUpRecommendations.length}</strong>
                    </article>
                  </div>
                </div>
                <div className="result-analysis-workspace-surface__chips">
                  {resultQuery.data.progressStatusLabel ? (
                    <span className="detail-chip">{`Status ${resultQuery.data.progressStatusLabel}`}</span>
                  ) : null}
                  {resultQuery.data.archiveDecisionLabel ? (
                    <span className="detail-chip detail-chip--accent">
                      {`Decision ${resultQuery.data.archiveDecisionLabel}`}
                    </span>
                  ) : null}
                  {resultQuery.data.nextReviewLabel ? (
                    <span className="detail-chip">Next review {resultQuery.data.nextReviewLabel}</span>
                  ) : (
                    <span className="detail-chip">Retry ready</span>
                  )}
                  <span className="detail-chip">Strength signals {strongestSignals}</span>
                </div>
              </section>
            );
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
                  workspaceSummary={workspaceSummary}
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
                workspaceSummary={workspaceSummary}
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
