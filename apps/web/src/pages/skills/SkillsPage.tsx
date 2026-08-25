import { Link } from "react-router-dom";
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
  const radarCategoryCount = radarQuery.data?.categories.length ?? 0;
  const trackedProgressCount = progressQuery.data?.items.length ?? 0;
  const topGapItem = gapQuery.data?.items[0] ?? null;
  const weakestProgressItem =
    progressQuery.data?.items.reduce((weakest, item) => {
      if (!weakest) {
        return item;
      }

      const weakestWeakCount = Number.parseInt(weakest.weakQuestionCountLabel, 10) || 0;
      const itemWeakCount = Number.parseInt(item.weakQuestionCountLabel, 10) || 0;
      return itemWeakCount > weakestWeakCount ? item : weakest;
    }, progressQuery.data.items[0]) ?? null;
  const totalAnsweredQuestions =
    progressQuery.data?.items.reduce((sum, item) => {
      return sum + (Number.parseInt(item.answeredQuestionCountLabel, 10) || 0);
    }, 0) ?? 0;
  const totalWeakQuestions =
    progressQuery.data?.items.reduce((sum, item) => {
      return sum + (Number.parseInt(item.weakQuestionCountLabel, 10) || 0);
    }, 0) ?? 0;

  return (
    <PageContainer
      description="Use skill radar and gap signals only to decide which interview branch should be reinforced next."
      eyebrow="Support workspace"
      title="Turn skill signals into the next branch choice"
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
        <div className="page-stack skills-workspace">
          <section className="skills-workspace-surface">
            <div className="skills-workspace-surface__header">
              <div className="skills-workspace-surface__intro">
                <div className="skills-workspace-surface__eyebrow-row">
                  <p className="skills-workspace-surface__breadcrumbs">
                    <span>Skill signal</span>
                    <span>/</span>
                    <span>Gap pressure</span>
                    <span>/</span>
                    <span>Next branch</span>
                  </p>
                  <span className="question-status-badge question-status-badge--accent">
                    Practice companion
                  </span>
                </div>
                <h2 className="skills-workspace-surface__title">
                  Use skill signals only to choose the next branch worth defending
                </h2>
                <p className="skills-workspace-surface__body">
                  Radar, gap analysis, and progress only matter if they narrow what you should
                  defend next in the interview DFS loop.
                </p>
              </div>
              <div className="skills-workspace-surface__stats">
                <article className="skills-workspace-surface__stat">
                  <span>Radar updated</span>
                  <strong>{radarQuery.data?.updatedAtLabel ?? "-"}</strong>
                </article>
                <article className="skills-workspace-surface__stat">
                  <span>Radar categories</span>
                  <strong>{radarCategoryCount}</strong>
                </article>
                <article className="skills-workspace-surface__stat">
                  <span>Tracked progress</span>
                  <strong>{trackedProgressCount}</strong>
                </article>
                <article className="skills-workspace-surface__stat">
                  <span>Gap items</span>
                  <strong>{gapQuery.data?.items.length ?? 0}</strong>
                </article>
              </div>
            </div>
            <div className="skills-workspace-surface__chips">
              {topGapItem ? <span className="detail-chip">Top gap: {topGapItem.label}</span> : null}
              {weakestProgressItem ? (
                <span className="detail-chip">
                  Weak-question load: {weakestProgressItem.label}
                </span>
              ) : null}
              <span className="detail-chip detail-chip--accent">
                Goal: choose one branch to practice next
              </span>
            </div>
            <div className="skills-workspace-surface__guidance">
              <article className="skills-workspace-surface__guidance-card">
                <span>Primary branch today</span>
                <strong>
                  {topGapItem
                    ? `${topGapItem.label} should become the next defended branch.`
                    : "Wait for a clearer gap signal before broadening practice."}
                </strong>
              </article>
              <article className="skills-workspace-surface__guidance-card">
                <span>Before you broaden</span>
                <strong>
                  {weakestProgressItem
                    ? `Stabilize ${weakestProgressItem.label} first, because weak follow-up load is still the heaviest there.`
                    : "Build one answered streak so the page can identify unstable follow-up depth."}
                </strong>
              </article>
            </div>
            <div className="skills-workspace-surface__actions">
              <Link className="primary-button" to={routeConfig.practice.buildPath()}>
                Open practice workspace
              </Link>
              <Link className="secondary-button" to={routeConfig.reviewQueue.buildPath()}>
                Open review queue
              </Link>
            </div>
          </section>

          <section className="skills-priority-board">
            <article className="page-card skills-priority-board__main">
              <div className="section-heading">
                <div>
                  <p className="section-heading__eyebrow">Priority board</p>
                  <h2 className="page-card__title">What this signal set should drive</h2>
                </div>
              </div>
              <div className="skills-priority-list">
                <article className="skills-priority-item">
                  <div className="skills-priority-item__rank">1</div>
                  <div className="skills-priority-item__body">
                    <strong>Find the weakest defendable branch</strong>
                    <span>
                      Use gap and weak-question load together, not as separate dashboards.
                    </span>
                  </div>
                </article>
                <article className="skills-priority-item">
                  <div className="skills-priority-item__rank">2</div>
                  <div className="skills-priority-item__body">
                    <strong>Map it back to real interview evidence</strong>
                    <span>
                      Prefer skills that already produced weak answers or unstable follow-ups.
                    </span>
                  </div>
                </article>
                <article className="skills-priority-item">
                  <div className="skills-priority-item__rank">3</div>
                  <div className="skills-priority-item__body">
                    <strong>Convert it into the next practice run</strong>
                    <span>
                      This page should shorten the path to actual question practice, not become an
                      analytics dead end.
                    </span>
                  </div>
                </article>
              </div>
            </article>

            <article className="page-card page-card--muted skills-priority-board__side">
              <div className="section-heading">
                <div>
                  <p className="section-heading__eyebrow">Current focus</p>
                  <h2 className="page-card__title">Most actionable signal</h2>
                </div>
              </div>
              <div className="skills-signal-list">
                <div className="skills-signal-list__item">
                  <span>Top gap</span>
                  <strong>
                    {topGapItem
                      ? `${topGapItem.label} · ${topGapItem.gapScoreLabel}`
                      : "No explicit gap item is available yet."}
                  </strong>
                </div>
                <div className="skills-signal-list__item">
                  <span>Weak-question load</span>
                  <strong>
                    {weakestProgressItem
                      ? `${weakestProgressItem.label} · weak questions ${weakestProgressItem.weakQuestionCountLabel}`
                      : "No answered progress snapshot is available yet."}
                  </strong>
                </div>
                <div className="skills-signal-list__item">
                  <span>Next action</span>
                  <strong>Open practice and reinforce one weak branch before broadening coverage.</strong>
                </div>
              </div>
            </article>
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
              <div className="skills-progress-summary">
                <article className="skills-progress-summary__item">
                  <span>Total answered</span>
                  <strong>{totalAnsweredQuestions}</strong>
                </article>
                <article className="skills-progress-summary__item">
                  <span>Total weak questions</span>
                  <strong>{totalWeakQuestions}</strong>
                </article>
                <article className="skills-progress-summary__item">
                  <span>Priority recovery</span>
                  <strong>
                    {weakestProgressItem
                      ? `${weakestProgressItem.label} needs the next retry block.`
                      : "No weak-answer hotspot is available yet."}
                  </strong>
                </article>
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
