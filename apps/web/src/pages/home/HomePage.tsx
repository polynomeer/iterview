import { useHomeQuery } from "../../features/home/api/useHomeQuery";
import { routeConfig } from "../../shared/config/routes";
import { ApiClientError, getErrorDetails } from "../../shared/api/errors";
import { EmptyStateCard } from "../../shared/ui/EmptyStateCard";
import { ErrorStateCard } from "../../shared/ui/ErrorStateCard";
import { useLocale } from "../../shared/i18n";
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
  const { locale } = useLocale();
  const isKorean = locale === "ko";
  const { isDesktop } = useLayoutMode();
  const homeData = homeQuery.data;
  const isUnauthorized = homeQuery.error instanceof ApiClientError && homeQuery.error.status === 401;
  const pageTitle = isUnauthorized
    ? isKorean
      ? "이력서 기반 면접 준비를 간결하게 시작하세요"
      : "Resume-grounded interview prep, kept simple"
    : isKorean
      ? "이력서 기반 DFS 면접 연습"
      : "Resume-grounded DFS interview practice";
  const pageDescription = isUnauthorized
    ? isKorean
      ? "이력서에서 분명한 기준 문서를 만들고, 모든 주장에 방어 논리가 생길 때까지 DFS 방식 꼬리질문을 연습하세요."
      : "Build a clear source of truth from your resume, then rehearse DFS-style follow-up questions until every claim is defensible."
    : isKorean
      ? "이력서를 기준 문서로 삼고, 꼬리질문 압박과 재도전, 복구 흐름을 하나의 작업공간에서 이어가세요."
      : "Use your resume as source of truth, then move through follow-up pressure, retries, and recovery from one workspace.";
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
      eyebrow={isKorean ? "오늘의 루프" : "Daily loop"}
      introVariant={isUnauthorized ? "hidden" : "minimal"}
      title={pageTitle}
    >
      {!isUnauthorized ? (
        <section className="page-card home-workspace-surface">
          <div className="home-workspace-surface__header">
            <div className="home-workspace-surface__intro">
              <div className="home-workspace-surface__eyebrow-row">
                <span className="page-card__label">{isKorean ? "오늘의 작업공간" : "Daily workspace"}</span>
                <span className="question-status-badge question-status-badge--accent">{isKorean ? "집중 모드" : "Focus mode"}</span>
              </div>
              <p className="home-workspace-surface__breadcrumbs">
                {isKorean ? "이력서 기준 문서" : "Resume source of truth"}
                <span>/</span>
                {isKorean ? "DFS 꼬리질문 압박" : "DFS follow-up pressure"}
                <span>/</span>
                {isKorean ? "복구 루프" : "Recovery loop"}
              </p>
              <h2 className="home-workspace-surface__title">
                {isKorean ? "이력서를 한 분기씩 방어하세요" : "Defend your resume one branch at a time"}
              </h2>
              <p className="home-workspace-surface__body">
                {isKorean
                  ? "활성 이력서 주장부터 시작해 다음 질문으로 더 깊게 내려가고, 재도전과 이력서 리스크를 가까이에 두어 약한 분기를 빠르게 복구하세요."
                  : "Start from the active resume claim, follow the next question deeper, and keep retries and resume risks close enough to recover weak branches fast."}
              </p>
            </div>
            <div className="home-workspace-surface__stats">
              <article className="home-workspace-surface__stat">
                <span>{isKorean ? "오늘의 분기" : "Today branch"}</span>
                <strong>{homeData?.todayQuestion ? 1 : 0}</strong>
              </article>
              <article className="home-workspace-surface__stat">
                <span>{isKorean ? "재도전" : "Retries"}</span>
                <strong>{retryCount}</strong>
              </article>
              <article className="home-workspace-surface__stat">
                <span>{isKorean ? "보조 노트" : "Support notes"}</span>
                <strong>{materialCount}</strong>
              </article>
              <article className="home-workspace-surface__stat">
                <span>{isKorean ? "이력서 리스크" : "Resume risks"}</span>
                <strong>{riskCount}</strong>
              </article>
            </div>
          </div>
          <div className="home-workspace-surface__chips">
            <span className="detail-chip">{isKorean ? `요약 ${summaryCount}` : `Summary ${summaryCount}`}</span>
            {homeData?.todayQuestion ? (
              <span className="detail-chip detail-chip--accent">{isKorean ? "활성 분기 준비 완료" : "Active branch ready"}</span>
            ) : null}
            {retryCount > 0 ? <span className="detail-chip">{isKorean ? "재도전 복구 진행 중" : "Retry recovery live"}</span> : null}
            {materialCount > 0 ? <span className="detail-chip">{isKorean ? "증빙 보조 자료 준비됨" : "Evidence support loaded"}</span> : null}
          </div>
          <div className="home-workspace-surface__guidance">
            <article className="home-workspace-surface__guidance-card">
              <span>{isKorean ? "기준 문서" : "Source of truth"}</span>
              <strong>{isKorean ? "방어 가능한 이력서 스토리 하나를 활성 상태로 유지하세요." : "Keep one defendable resume story active."}</strong>
            </article>
            <article className="home-workspace-surface__guidance-card">
              <span>{isKorean ? "탐색" : "Traversal"}</span>
              <strong>{isKorean ? "오늘의 질문으로 다음 DFS 분기에 진입하세요." : "Use today&apos;s question to enter the next DFS branch."}</strong>
            </article>
            <article className="home-workspace-surface__guidance-card">
              <span>{isKorean ? "복구" : "Recovery"}</span>
              <strong>{isKorean ? "범위를 넓히기 전에 재도전과 이력서 리스크를 먼저 정리하세요." : "Clear retries and resume risks before broadening scope."}</strong>
            </article>
          </div>
        </section>
      ) : null}
      {homeQuery.isLoading ? (
        <LoadingStateCard
          body={
            isKorean
              ? "오늘의 질문, 재도전 큐, 학습 자료, 진행 요약을 불러오는 중입니다."
              : "Fetching today&apos;s question, retry queue, learning materials, and progress summary."
          }
          title={isKorean ? "홈 화면을 준비하는 중입니다" : "Preparing your home screen"}
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
              : isKorean
                ? "홈 화면을 불러오지 못했습니다."
                : "The home screen could not be loaded."
          }
          details={getErrorDetails(homeQuery.error)}
          onAction={() => {
            void homeQuery.refetch();
          }}
          title={isKorean ? "홈 화면을 불러올 수 없습니다" : "Unable to load your home screen"}
        />
      ) : null}

      {isEmpty ? (
        <EmptyStateCard
          action={{
            label: isKorean ? "연습 질문 둘러보기" : "Browse practice questions",
            to: routeConfig.practice.buildPath(),
          }}
          body={
            isKorean
              ? "아직 오늘의 질문이나 재도전 작업이 없습니다. 연습 목록에서 시작해 큐를 만들어보세요."
              : "No daily question or retry work is available yet. Start from the practice list to build your queue."
          }
          title={isKorean ? "오늘 예정된 작업이 없습니다" : "Nothing scheduled for today"}
        />
      ) : null}

      {!homeQuery.isLoading && !homeQuery.isError && homeData
        ? (() => {
            const todaySection = homeData.todayQuestion ? (
              <TodayQuestionCard question={homeData.todayQuestion} />
            ) : (
                <SectionEmptyState
                  action={{
                  label: isKorean ? "연습 질문 둘러보기" : "Browse practice questions",
                  to: routeConfig.practice.buildPath(),
                  variant: "secondary",
                }}
                body={isKorean ? "아직 오늘의 메인 질문이 배정되지 않았습니다." : "Today&apos;s main question is not available yet."}
                label={isKorean ? "오늘" : "Today"}
                title={isKorean ? "오늘의 질문이 없습니다" : "No daily question assigned"}
              />
            );

            const retrySection =
              homeData.retryQuestions.length > 0 ? (
                <RetryQuestionList questions={homeData.retryQuestions} />
              ) : (
                <SectionEmptyState
                  body={isKorean ? "현재는 재도전 큐를 모두 비웠습니다." : "You have cleared your retry queue for now."}
                  label={isKorean ? "재도전 큐" : "Retry queue"}
                  title={isKorean ? "대기 중인 재도전 질문이 없습니다" : "No retry questions pending"}
                />
              );

            const materialsSection =
              homeData.learningMaterials.length > 0 ? (
                <LearningMaterialList materials={homeData.learningMaterials} />
              ) : (
                <SectionEmptyState
                  body={isKorean ? "오늘의 세트에 연결된 보조 학습 자료가 없습니다." : "There are no supporting learning materials attached to today&apos;s set."}
                  label={isKorean ? "학습 자료" : "Learning materials"}
                  title={isKorean ? "사용 가능한 자료가 없습니다" : "No materials available"}
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
                  body={
                    isKorean
                      ? "현재 이력서 리스크가 없습니다. 활성 이력서 버전을 업로드하거나 분석해 방어 포인트를 드러내세요."
                      : "No resume risks are available right now. Upload or analyze your active resume version to surface defense points."
                  }
                  label={isKorean ? "이력서 리스크" : "Resume risks"}
                  title={isKorean ? "활성 이력서 리스크가 없습니다" : "No active resume risks"}
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
