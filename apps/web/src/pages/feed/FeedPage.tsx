import { useFeedQuery } from "../../features/feed/api/useFeedQuery";
import { ApiClientError, getErrorDetails } from "../../shared/api/errors";
import { routeConfig } from "../../shared/config/routes";
import { AuthRequiredStateCard } from "../../shared/ui/AuthRequiredStateCard";
import { useLocale } from "../../shared/i18n";
import { useLayoutMode } from "../../shared/ui/layout";
import { EmptyStateCard } from "../../shared/ui/EmptyStateCard";
import { ErrorStateCard } from "../../shared/ui/ErrorStateCard";
import { LoadingStateCard } from "../../shared/ui/LoadingStateCard";
import { PageContainer } from "../../shared/ui/PageContainer";
import { FeedDesktopLayout, FeedMobileLayout } from "./FeedLayouts";
import { FeedSection } from "../../widgets/feed";

export function FeedPage() {
  const feedQuery = useFeedQuery();
  const { isDesktop } = useLayoutMode();
  const { t } = useLocale();
  const isUnauthorized = feedQuery.error instanceof ApiClientError && feedQuery.error.status === 401;
  const sectionCount = feedQuery.data?.sections.length ?? 0;
  const itemCount = feedQuery.data?.sections.reduce((sum, section) => sum + section.items.length, 0) ?? 0;
  const companySignalCount =
    feedQuery.data?.sections.find((section) => section.id === "companyRelated")?.items.length ?? 0;
  const sections = feedQuery.data?.sections.map((section) => (
    <FeedSection key={section.id} layout={isDesktop ? "grid" : "stack"} section={section} />
  )) ?? [];

  return (
    <PageContainer
      description={t("feed.pageDescription")}
      eyebrow={t("feed.pageEyebrow")}
      title={t("feed.pageTitle")}
    >
      <section className="page-card feed-workspace-surface">
        <div className="feed-workspace-surface__header">
          <div className="feed-workspace-surface__intro">
            <div className="feed-workspace-surface__eyebrow-row">
              <span className="page-card__label">{t("feed.signalScan")}</span>
              <span className="question-status-badge question-status-badge--accent">{t("feed.branchPressure")}</span>
            </div>
            <p className="feed-workspace-surface__breadcrumbs">
              {t("feed.externalDemand")}
              <span>/</span>
              {t("feed.activeTrend")}
              <span>/</span>
              {t("feed.companyPressure")}
            </p>
            <h2 className="feed-workspace-surface__title">{t("feed.workspaceTitleLong")}</h2>
            <p className="feed-workspace-surface__body">{t("feed.workspaceBodyLong")}</p>
          </div>
          <div className="feed-workspace-surface__stats">
            <article className="feed-workspace-surface__stat">
              <span>{t("feed.signalLanes")}</span>
              <strong>{sectionCount}</strong>
            </article>
            <article className="feed-workspace-surface__stat">
              <span>{t("feed.visiblePrompts")}</span>
              <strong>{itemCount}</strong>
            </article>
            <article className="feed-workspace-surface__stat">
              <span>{t("feed.companyPressure")}</span>
              <strong>{companySignalCount}</strong>
            </article>
            <article className="feed-workspace-surface__stat">
              <span>{t("feed.entryLane")}</span>
              <strong>{feedQuery.data?.sections[0] ? t("feed.leadSectionSet") : t("feed.none")}</strong>
            </article>
          </div>
        </div>
        <div className="feed-workspace-surface__guidance" aria-label={t("feed.guidanceLabel")}>
          <article className="feed-workspace-surface__guidance-card">
            <span>{t("feed.selectionRule")}</span>
            <strong>{t("feed.selectionRuleBody")}</strong>
          </article>
          <article className="feed-workspace-surface__guidance-card">
            <span>{t("feed.comparisonRule")}</span>
            <strong>{t("feed.comparisonRuleBody")}</strong>
          </article>
          <article className="feed-workspace-surface__guidance-card">
            <span>{t("feed.exitRule")}</span>
            <strong>{t("feed.exitRuleBody")}</strong>
          </article>
        </div>
        <div className="feed-workspace-surface__chips">
          <span className="detail-chip">{`${t("feed.signalLanes")} ${sectionCount}`}</span>
          {itemCount > 0 ? <span className="detail-chip detail-chip--accent">{`${t("feed.visiblePrompts")} ${itemCount}`}</span> : null}
          {companySignalCount > 0 ? <span className="detail-chip">{t("feed.companyPressureLoaded")}</span> : null}
          {feedQuery.data?.sections[0] ? <span className="detail-chip">{t("feed.entryLaneReady")}</span> : null}
        </div>
      </section>
      {feedQuery.isLoading ? (
        <LoadingStateCard
          body={t("feed.loadingBody")}
          title={t("feed.loadingTitle")}
        />
      ) : null}

      {feedQuery.isError && isUnauthorized ? (
        <AuthRequiredStateCard
          body={t("feed.authBody")}
          secondaryAction={{
            label: t("feed.browsePracticeQuestions"),
            to: routeConfig.practice.buildPath(),
          }}
          title={t("feed.authTitle")}
        />
      ) : null}

      {feedQuery.isError && !isUnauthorized ? (
        <ErrorStateCard
          body={
            feedQuery.error instanceof Error
              ? feedQuery.error.message
              : t("feed.loadErrorBody")
          }
          details={getErrorDetails(feedQuery.error)}
          onAction={() => {
            void feedQuery.refetch();
          }}
          title={t("feed.loadErrorTitle")}
        />
      ) : null}

      {!feedQuery.isLoading && !feedQuery.isError && feedQuery.data && feedQuery.data.sections.length === 0 ? (
        <EmptyStateCard
          body={t("feed.emptyBody")}
          title={t("feed.emptyTitle")}
        />
      ) : null}

      {!feedQuery.isLoading && !feedQuery.isError && feedQuery.data
        ? isDesktop
          ? <FeedDesktopLayout sections={sections} />
          : <FeedMobileLayout sections={sections} />
        : null}
    </PageContainer>
  );
}
