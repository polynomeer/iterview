import { useHomeQuery } from "../../features/home/api/useHomeQuery";
import { routeConfig } from "../../shared/config/routes";
import { ApiClientError, getErrorDetails } from "../../shared/api/errors";
import { EmptyStateCard } from "../../shared/ui/EmptyStateCard";
import { ErrorStateCard } from "../../shared/ui/ErrorStateCard";
import { useLayoutMode } from "../../shared/ui/layout";
import { LoadingStateCard } from "../../shared/ui/LoadingStateCard";
import { PageContainer } from "../../shared/ui/PageContainer";
import { SectionEmptyState } from "../../shared/ui/SectionEmptyState";
import { HomeDesktopLayout, HomeMobileLayout } from "./HomeLayouts";
import {
  GuestHomeIntro,
  HomeNextActionCard,
  LearningMaterialList,
  ResumeRiskPreviewList,
  RetryQuestionList,
  SkillRadarPreviewCard,
  SummaryStatsCard,
  TodayQuestionCard,
  WeakSkillPreviewCard,
} from "../../widgets/home";

export function HomePage() {
  const homeQuery = useHomeQuery();
  const { isDesktop } = useLayoutMode();
  const homeData = homeQuery.data;
  const isUnauthorized = homeQuery.error instanceof ApiClientError && homeQuery.error.status === 401;
  const pageTitle = isUnauthorized
    ? "Resume-grounded interview prep, kept simple"
    : "Your daily interview practice starts here";
  const pageDescription = isUnauthorized
    ? "Build a clear source of truth from your resume, then rehearse DFS-style follow-up questions until every claim is defensible."
    : "Keep today's main interview question front and center, then move through retries and learning support.";
  const summaryCount = homeData?.summaryStats?.length ?? 0;
  const retryCount = homeData?.retryQuestions?.length ?? 0;
  const materialCount = homeData?.learningMaterials?.length ?? 0;
  const riskCount = homeData?.resumeRiskPreview?.length ?? 0;
  const isEmpty =
    homeData !== undefined &&
    homeData.todayQuestion === null &&
    homeData.retryQuestions.length === 0 &&
    homeData.learningMaterials.length === 0 &&
    homeData.summaryStats.length === 0 &&
    (homeData.skillRadarPreview ?? []).length === 0 &&
    (homeData.skillGapPreview ?? []).length === 0 &&
    (homeData.resumeRiskPreview ?? []).length === 0;

  return (
    <PageContainer
      description={pageDescription}
      eyebrow="Home"
      introVariant={isUnauthorized ? "hidden" : "minimal"}
      title={pageTitle}
    >
      {!isUnauthorized ? (
        <section className="page-card home-workspace-surface">
          <div className="home-workspace-surface__header">
            <div className="home-workspace-surface__intro">
              <div className="home-workspace-surface__eyebrow-row">
                <span className="page-card__label">Daily workspace</span>
                <span className="question-status-badge question-status-badge--accent">Focus mode</span>
              </div>
              <p className="home-workspace-surface__breadcrumbs">
                Today&apos;s prompt
                <span>/</span>
                Retry pressure
                <span>/</span>
                Resume defense
              </p>
              <h2 className="home-workspace-surface__title">Daily command center</h2>
              <p className="home-workspace-surface__body">
                Keep the main question, the retry queue, and the current resume risks in one place so the next hour of
                practice moves in a single direction.
              </p>
            </div>
            <div className="home-workspace-surface__stats">
              <article className="home-workspace-surface__stat">
                <span>Today card</span>
                <strong>{homeData?.todayQuestion ? 1 : 0}</strong>
              </article>
              <article className="home-workspace-surface__stat">
                <span>Retries</span>
                <strong>{retryCount}</strong>
              </article>
              <article className="home-workspace-surface__stat">
                <span>Materials</span>
                <strong>{materialCount}</strong>
              </article>
              <article className="home-workspace-surface__stat">
                <span>Resume risks</span>
                <strong>{riskCount}</strong>
              </article>
            </div>
          </div>
          <div className="home-workspace-surface__chips">
            <span className="detail-chip">{`Summary ${summaryCount}`}</span>
            {homeData?.todayQuestion ? (
              <span className="detail-chip detail-chip--accent">Daily prompt active</span>
            ) : null}
            {retryCount > 0 ? <span className="detail-chip">Retry queue live</span> : null}
            {materialCount > 0 ? <span className="detail-chip">Learning support loaded</span> : null}
          </div>
        </section>
      ) : null}
      {homeQuery.isLoading ? (
        <LoadingStateCard
          body="Fetching today&apos;s question, retry queue, learning materials, and progress summary."
          title="Preparing your home screen"
        />
      ) : null}

      {homeQuery.isError && isUnauthorized ? (
        <GuestHomeIntro />
      ) : null}

      {homeQuery.isError && !isUnauthorized ? (
        <ErrorStateCard
          body={
            homeQuery.error instanceof Error
              ? homeQuery.error.message
              : "The home screen could not be loaded."
          }
          details={getErrorDetails(homeQuery.error)}
          onAction={() => {
            void homeQuery.refetch();
          }}
          title="Unable to load your home screen"
        />
      ) : null}

      {isEmpty ? (
        <EmptyStateCard
          action={{
            label: "Browse practice questions",
            to: routeConfig.practice.buildPath(),
          }}
          body="No daily question or retry work is available yet. Start from the practice list to build your queue."
          title="Nothing scheduled for today"
        />
      ) : null}

      {!homeQuery.isLoading && !homeQuery.isError && homeData
        ? (() => {
            const todaySection = homeData.todayQuestion ? (
              <TodayQuestionCard question={homeData.todayQuestion} />
            ) : (
              <SectionEmptyState
                action={{
                  label: "Browse practice questions",
                  to: routeConfig.practice.buildPath(),
                  variant: "secondary",
                }}
                body="Today&apos;s main question is not available yet."
                label="Today"
                title="No daily question assigned"
              />
            );

            const retrySection =
              homeData.retryQuestions.length > 0 ? (
                <RetryQuestionList questions={homeData.retryQuestions} />
              ) : (
                <SectionEmptyState
                  body="You have cleared your retry queue for now."
                  label="Retry queue"
                  title="No retry questions pending"
                />
              );

            const materialsSection =
              homeData.learningMaterials.length > 0 ? (
                <LearningMaterialList materials={homeData.learningMaterials} />
              ) : (
                <SectionEmptyState
                  body="There are no supporting learning materials attached to today&apos;s set."
                  label="Learning materials"
                  title="No materials available"
                />
              );

            const radarSection = (
              <SkillRadarPreviewCard items={homeData.skillRadarPreview ?? []} />
            );

            const weakSkillsSection = (
              <WeakSkillPreviewCard items={homeData.skillGapPreview ?? []} />
            );

            const resumeRiskSection =
              (homeData.resumeRiskPreview ?? []).length > 0 ? (
                <ResumeRiskPreviewList items={homeData.resumeRiskPreview ?? []} />
              ) : (
                <SectionEmptyState
                  body="No resume risks are available right now. Upload or analyze your active resume version to surface defense points."
                  label="Resume risks"
                  title="No active resume risks"
                />
              );

            if (!isDesktop) {
              return (
                <HomeMobileLayout
                  materialsSection={materialsSection}
                  nextActionSection={<HomeNextActionCard home={homeData} />}
                  radarSection={radarSection}
                  retrySection={retrySection}
                  resumeRiskSection={resumeRiskSection}
                  summarySection={
                    homeData.summaryStats.length > 0 ? <SummaryStatsCard stats={homeData.summaryStats} /> : null
                  }
                  todaySection={todaySection}
                  weakSkillsSection={weakSkillsSection}
                />
              );
            }

            return (
              <HomeDesktopLayout
                materialsSection={materialsSection}
                nextActionSection={<HomeNextActionCard home={homeData} />}
                radarSection={radarSection}
                retrySection={retrySection}
                resumeRiskSection={resumeRiskSection}
                summarySection={
                  homeData.summaryStats.length > 0 ? <SummaryStatsCard stats={homeData.summaryStats} /> : null
                }
                todaySection={todaySection}
                weakSkillsSection={weakSkillsSection}
              />
            );
          })()
        : null}
    </PageContainer>
  );
}
