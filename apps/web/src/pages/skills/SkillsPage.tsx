import { mapHomeResponseDtoToModel } from "../../entities/home/model";
import { useSkillProgressQuery } from "../../features/skills/api/useSkillProgressQuery";
import { useSkillGapQuery } from "../../features/skills/api/useSkillGapQuery";
import { useSkillRadarQuery } from "../../features/skills/api/useSkillRadarQuery";
import { ApiClientError, getErrorDetails } from "../../shared/api/errors";
import { getHomeRequest } from "../../shared/api/homeApi";
import { routeConfig } from "../../shared/config/routes";
import { EmptyStateCard } from "../../shared/ui/EmptyStateCard";
import { ErrorStateCard } from "../../shared/ui/ErrorStateCard";
import { LoadingStateCard } from "../../shared/ui/LoadingStateCard";
import { MetricCard } from "../../shared/ui/MetricCard";
import { PageContainer } from "../../shared/ui/PageContainer";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../../shared/api/queryKeys";
import { GapAnalysisSection } from "../../widgets/skills/GapAnalysisSection";
import { SkillCategorySummaryCard } from "../../widgets/skills/SkillCategorySummaryCard";
import { SkillRadarChart } from "../../widgets/skills/SkillRadarChart";

export function SkillsPage() {
  const radarQuery = useSkillRadarQuery();
  const gapQuery = useSkillGapQuery();
  const progressQuery = useSkillProgressQuery();
  const homeFallbackQuery = useQuery({
    queryKey: [...queryKeys.skills.root, "home-fallback"],
    queryFn: async ({ signal }) => mapHomeResponseDtoToModel(await getHomeRequest(signal)),
  });
  const radarUnsupported = radarQuery.error instanceof ApiClientError && radarQuery.error.status === 404;
  const gapUnsupported = gapQuery.error instanceof ApiClientError && gapQuery.error.status === 404;
  const fallbackRadarItems = homeFallbackQuery.data?.skillRadarPreview ?? [];
  const fallbackGapItems = homeFallbackQuery.data?.skillGapPreview ?? [];

  return (
    <PageContainer
      description="Track your skill radar, gap analysis, and readiness signals in one workspace."
      eyebrow="Skills"
      title="Skill dashboard"
    >
      {radarQuery.isLoading || gapQuery.isLoading || progressQuery.isLoading ? (
        <LoadingStateCard
          body="Loading skill radar and gap analysis for your current interview profile."
          title="Preparing skill dashboard"
        />
      ) : null}

      {radarQuery.isError && !radarUnsupported ? (
        <ErrorStateCard
          body={radarQuery.error instanceof Error ? radarQuery.error.message : "The skill radar could not be loaded."}
          details={getErrorDetails(radarQuery.error)}
          onAction={() => {
            void radarQuery.refetch();
          }}
          title="Unable to load skill radar"
        />
      ) : null}

      {gapQuery.isError && !gapUnsupported ? (
        <ErrorStateCard
          body={gapQuery.error instanceof Error ? gapQuery.error.message : "The gap analysis could not be loaded."}
          details={getErrorDetails(gapQuery.error)}
          onAction={() => {
            void gapQuery.refetch();
          }}
          title="Unable to load gap analysis"
        />
      ) : null}

      {progressQuery.isError ? (
        <ErrorStateCard
          body={progressQuery.error instanceof Error ? progressQuery.error.message : "The skill progress snapshot could not be loaded."}
          details={getErrorDetails(progressQuery.error)}
          onAction={() => {
            void progressQuery.refetch();
          }}
          title="Unable to load skill progress"
        />
      ) : null}

      {!radarQuery.isLoading &&
      !gapQuery.isLoading &&
      !progressQuery.isLoading &&
      ((radarQuery.data && radarQuery.data.categories.length > 0) ||
        (gapQuery.data && gapQuery.data.items.length > 0) ||
        (progressQuery.data && progressQuery.data.items.length > 0)) ? (
        <div className="page-stack">
          <section className="page-card">
            <div className="section-heading">
              <div>
                <p className="section-heading__eyebrow">Readiness</p>
                <h2 className="page-card__title">Current interview readiness snapshot</h2>
              </div>
            </div>
            <div className="stats-grid">
              <MetricCard
                helperText={radarQuery.data?.updatedAtLabel ?? undefined}
                label="Radar updated"
                tone="accent"
                value={radarQuery.data?.updatedAtLabel ?? "-"}
              />
              <MetricCard
                label="Radar categories"
                tone="muted"
                value={String(radarQuery.data?.categories.length ?? 0)}
              />
              <MetricCard
                label="Tracked progress"
                tone="muted"
                value={String(progressQuery.data?.items.length ?? 0)}
              />
            </div>
          </section>
          {radarQuery.data ? <SkillRadarChart radar={radarQuery.data} /> : null}
          {radarQuery.data ? <SkillCategorySummaryCard radar={radarQuery.data} /> : null}
          {gapQuery.data ? <GapAnalysisSection gapModel={gapQuery.data} /> : null}
          {progressQuery.data ? (
            <section className="page-card">
              <div className="section-heading">
                <div>
                  <p className="section-heading__eyebrow">Progress</p>
                  <h2 className="page-card__title">Answered volume and weak-question load</h2>
                </div>
                <span className="section-heading__count">{progressQuery.data.items.length}</span>
              </div>
              <div className="stack-list">
                {progressQuery.data.items.map((item) => (
                  <article className="list-item-card" key={item.id}>
                    <div className="list-item-card__content">
                      <div className="list-item-card__meta">
                        <span>{item.scoreLabel}</span>
                        {item.benchmarkLabel ? <span>{item.benchmarkLabel}</span> : null}
                        {item.gapLabel ? <span>{item.gapLabel}</span> : null}
                      </div>
                      <h3 className="list-item-card__title">{item.label}</h3>
                      <p className="list-item-card__body">
                        Answered {item.answeredQuestionCountLabel} questions · Weak questions {item.weakQuestionCountLabel}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ) : null}
        </div>
      ) : null}

      {!radarQuery.isLoading &&
      !gapQuery.isLoading &&
      radarUnsupported &&
      gapUnsupported &&
      (fallbackRadarItems.length > 0 || fallbackGapItems.length > 0) ? (
        <div className="page-stack">
          <section className="page-card">
            <span className="page-card__label">Preview fallback</span>
            <h2 className="page-card__title">Dedicated skill endpoints are not available yet</h2>
            <p className="page-card__body">
              Showing the lighter-weight home preview instead so you can still see readiness and gap direction.
            </p>
          </section>
          <section className="page-card">
            <div className="section-heading">
              <div>
                <p className="section-heading__eyebrow">Home preview</p>
                <h2 className="page-card__title">Skill radar preview</h2>
              </div>
            </div>
            <div className="stats-grid">
              {fallbackRadarItems.map((item) => (
                <MetricCard key={item.id} label={item.label} tone="accent" value={item.scoreLabel} />
              ))}
            </div>
          </section>
          <section className="page-card">
            <div className="section-heading">
              <div>
                <p className="section-heading__eyebrow">Home preview</p>
                <h2 className="page-card__title">Gap preview</h2>
              </div>
            </div>
            <div className="stats-grid">
              {fallbackGapItems.map((item) => (
                <MetricCard
                  helperText={item.helperText}
                  key={item.id}
                  label={item.label}
                  tone="muted"
                  value={item.gapScoreLabel}
                />
              ))}
            </div>
          </section>
        </div>
      ) : null}

      {!radarQuery.isLoading &&
      !gapQuery.isLoading &&
      (radarQuery.data?.categories.length ?? 0) === 0 &&
      (gapQuery.data?.items.length ?? 0) === 0 &&
      !(radarUnsupported && gapUnsupported) ? (
        <EmptyStateCard
          action={{
            label: "Open practice",
            to: routeConfig.practice.buildPath(),
          }}
          body="Answer more questions to build out category scores, benchmark context, and explicit skill gaps."
          title="No skill intelligence yet"
        />
      ) : null}
    </PageContainer>
  );
}
