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
      description="Keep today&apos;s main interview question front and center, then move through retries and learning support."
      eyebrow="Home"
      title="Your daily interview practice starts here"
    >
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
