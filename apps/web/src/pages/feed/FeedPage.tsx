import { useFeedQuery } from "../../features/feed/api/useFeedQuery";
import { ApiClientError, getErrorDetails } from "../../shared/api/errors";
import { routeConfig } from "../../shared/config/routes";
import { AuthRequiredStateCard } from "../../shared/ui/AuthRequiredStateCard";
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
      description="Browse popular, trending, and company-related question groups without losing the mobile browsing flow."
      eyebrow="Feed"
      title="Feed"
    >
      <section className="page-card feed-workspace-surface">
        <div className="feed-workspace-surface__header">
          <div className="feed-workspace-surface__intro">
            <div className="feed-workspace-surface__eyebrow-row">
              <span className="page-card__label">Discovery workspace</span>
              <span className="question-status-badge question-status-badge--accent">Scan mode</span>
            </div>
            <p className="feed-workspace-surface__breadcrumbs">
              Popular signal
              <span>/</span>
              Trending signal
              <span>/</span>
              Company signal
            </p>
            <h2 className="feed-workspace-surface__title">Question market scan</h2>
            <p className="feed-workspace-surface__body">
              Use the feed to compare what is currently surfacing across general demand, active trends, and company
              context before deciding which branch is worth practicing next.
            </p>
          </div>
          <div className="feed-workspace-surface__stats">
            <article className="feed-workspace-surface__stat">
              <span>Sections</span>
              <strong>{sectionCount}</strong>
            </article>
            <article className="feed-workspace-surface__stat">
              <span>Visible cards</span>
              <strong>{itemCount}</strong>
            </article>
            <article className="feed-workspace-surface__stat">
              <span>Company linked</span>
              <strong>{companySignalCount}</strong>
            </article>
            <article className="feed-workspace-surface__stat">
              <span>Primary lane</span>
              <strong>{feedQuery.data?.sections[0] ? "Lead section set" : "None"}</strong>
            </article>
          </div>
        </div>
        <div className="feed-workspace-surface__chips">
          <span className="detail-chip">{`Sections ${sectionCount}`}</span>
          {itemCount > 0 ? <span className="detail-chip detail-chip--accent">{`Visible cards ${itemCount}`}</span> : null}
          {companySignalCount > 0 ? <span className="detail-chip">Company-linked prompts</span> : null}
          {feedQuery.data?.sections[0] ? <span className="detail-chip">Lead section ready</span> : null}
        </div>
      </section>
      {feedQuery.isLoading ? (
        <LoadingStateCard
          body="Loading the current feed sections."
          title="Preparing feed"
        />
      ) : null}

      {feedQuery.isError && isUnauthorized ? (
        <AuthRequiredStateCard
          body="Login to see the personalized popular, trending, and company-related question feed."
          secondaryAction={{
            label: "Browse practice questions",
            to: routeConfig.practice.buildPath(),
          }}
          title="Your feed is available after sign-in"
        />
      ) : null}

      {feedQuery.isError && !isUnauthorized ? (
        <ErrorStateCard
          body={
            feedQuery.error instanceof Error
              ? feedQuery.error.message
              : "The feed could not be loaded."
          }
          details={getErrorDetails(feedQuery.error)}
          onAction={() => {
            void feedQuery.refetch();
          }}
          title="Unable to load feed"
        />
      ) : null}

      {!feedQuery.isLoading && !feedQuery.isError && feedQuery.data && feedQuery.data.sections.length === 0 ? (
        <EmptyStateCard
          body="No feed sections are available right now."
          title="Feed is empty"
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
