import { useNavigate, useParams } from "react-router-dom";
import { useResultAnalysisQuery } from "../../features/result/api/useResultAnalysisQuery";
import { routeConfig } from "../../shared/config/routes";
import { getErrorDetails } from "../../shared/api/errors";
import { ErrorStateCard } from "../../shared/ui/ErrorStateCard";
import { useLocale } from "../../shared/i18n";
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
  const { locale } = useLocale();
  const isKorean = locale === "ko";
  const resultQuery = useResultAnalysisQuery(answerAttemptId);

  if (!answerAttemptId) {
    return (
      <PageContainer
        description={isKorean ? "결과 경로에 답변 시도 식별자가 없습니다." : "The result route is missing the answer attempt identifier."}
        eyebrow={isKorean ? "결과" : "Results"}
        title={isKorean ? "결과를 찾을 수 없습니다" : "Result not found"}
      >
        <ErrorStateCard
          actionLabel={isKorean ? "연습으로 돌아가기" : "Back to practice"}
          body={isKorean ? "질문을 열고 답변을 제출한 뒤 결과를 확인하세요." : "Open a question and submit an answer before trying to view a result."}
          onAction={() => {
            navigate(routeConfig.practice.buildPath());
          }}
          title={isKorean ? "답변 시도 id가 없습니다" : "Missing answer attempt id"}
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer
      description={isKorean
        ? "답변에서 가장 약한 부분을 확인하고, 다음 재시도 방식를 정한 뒤, 점수를 더 선명한 다음 답변으로 바꾸세요."
        : "Review the weakest part of the answer, decide the next retry shape, and convert the score into a clearer next response."}
      eyebrow={isKorean ? "결과" : "Results"}
      title={isKorean ? "평가를 다음 답변으로 바꾸기" : "Turn evaluation into the next answer"}
    >
      {resultQuery.isLoading ? (
        <LoadingStateCard
          body={isKorean ? "이 답변 시도의 전체 평가 결과를 불러오고 있습니다." : "Loading the full evaluation result for this answer attempt."}
          title={isKorean ? "분석 준비 중" : "Preparing your analysis"}
        />
      ) : null}

      {resultQuery.isError ? (
        <ErrorStateCard
          body={
            resultQuery.error instanceof Error
              ? resultQuery.error.message
              : isKorean ? "답변 결과를 불러오지 못했습니다." : "The answer result could not be loaded."
          }
          details={getErrorDetails(resultQuery.error)}
          onAction={() => {
            void resultQuery.refetch();
          }}
          title={isKorean ? "결과 분석을 불러올 수 없습니다" : "Unable to load result analysis"}
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
                      <span className="page-card__label">{isKorean ? "결과 워크스페이스" : "Result workspace"}</span>
                      <span className="question-status-badge question-status-badge--accent">{isKorean ? "복습 루프" : "Review loop"}</span>
                    </div>
                    <p className="result-analysis-workspace-surface__breadcrumbs">
                      {isKorean ? "점수 판정" : "Score verdict"}
                      <span>/</span>
                      {isKorean ? "최약 차원" : "Weakest dimension"}
                      <span>/</span>
                      {isKorean ? "다음 재시도 루프" : "Next retry loop"}
                    </p>
                    <h2 className="result-analysis-workspace-surface__title">
                      {isKorean ? "이번 평가를 더 강한 다음 답변으로 바꾸세요" : "Turn this evaluation into the next stronger answer"}
                    </h2>
                    <p className="result-analysis-workspace-surface__body">
                      {isKorean
                        ? "판정을 읽고 가장 약한 가지를 분리한 뒤, 다음 루프를 즉시 재시도로 갈지 더 깊은 꼬리질문으로 갈지 결정하세요."
                        : "Read the verdict, isolate the weakest branch, and decide whether the next loop should be an immediate retry or a deeper follow-up question."}
                    </p>
                  </div>
                  <div className="result-analysis-workspace-surface__summary-row" role="list" aria-label={isKorean ? "결과 분석 시그널" : "Result analysis signals"}>
                    <span className="result-analysis-workspace-surface__summary-item" role="listitem">{isKorean ? `총점 ${resultQuery.data.totalScore} / 100` : `Total score ${resultQuery.data.totalScore} / 100`}</span>
                    <span className="result-analysis-workspace-surface__summary-item" role="listitem">
                      {weakestDimension
                        ? isKorean
                          ? `최약 ${weakestDimension.label} ${weakestDimension.value}`
                          : `Weakest ${weakestDimension.label} ${weakestDimension.value}`
                        : isKorean
                          ? "최약 차원 계산 중"
                          : "Weakest Pending"}
                    </span>
                    <span className="result-analysis-workspace-surface__summary-item" role="listitem">{isKorean ? `개선 시그널 ${improvementSignals}` : `Improvement signals ${improvementSignals}`}</span>
                    <span className="result-analysis-workspace-surface__summary-item result-analysis-workspace-surface__summary-item--accent" role="listitem">{isKorean ? `다음 프롬프트 ${resultQuery.data.followUpRecommendations.length}` : `Next prompts ${resultQuery.data.followUpRecommendations.length}`}</span>
                  </div>
                </div>
                <div className="result-analysis-workspace-surface__chips">
                  {resultQuery.data.progressStatusLabel ? (
                    <span className="detail-chip">{isKorean ? `상태 ${resultQuery.data.progressStatusLabel}` : `Status ${resultQuery.data.progressStatusLabel}`}</span>
                  ) : null}
                  {resultQuery.data.archiveDecisionLabel ? (
                    <span className="detail-chip detail-chip--accent">
                      {isKorean ? `판정 ${resultQuery.data.archiveDecisionLabel}` : `Decision ${resultQuery.data.archiveDecisionLabel}`}
                    </span>
                  ) : null}
                  {resultQuery.data.nextReviewLabel ? (
                    <span className="detail-chip">{isKorean ? `다음 복습 ${resultQuery.data.nextReviewLabel}` : `Next review ${resultQuery.data.nextReviewLabel}`}</span>
                  ) : (
                    <span className="detail-chip">{isKorean ? "재시도 준비됨" : "Retry ready"}</span>
                  )}
                  <span className="detail-chip">{isKorean ? `강점 시그널 ${strongestSignals}` : `Strength signals ${strongestSignals}`}</span>
                </div>
                <div className="result-analysis-workspace-surface__principles" role="list" aria-label={isKorean ? "결과 분석 원칙" : "Result analysis principles"}>
                  <span role="listitem">{isKorean ? "답변이 가장 쉽게 흔들린 차원부터 시작하세요." : "Start with the dimension that made the answer easiest to challenge."}</span>
                  <span role="listitem">{isKorean ? "더 긴 답변을 다시 쓰기 전에 재시도 깊이부터 정하세요." : "Choose retry depth before writing another longer answer."}</span>
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
