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
      description="Compare public demand, active trends, and company signal to choose the next interview branch with less guesswork."
      eyebrow="Branch feed"
      title="Scan external signal before opening the next branch"
    >
      <section className="page-card feed-workspace-surface">
        <div className="feed-workspace-surface__header">
          <div className="feed-workspace-surface__intro">
            <div className="feed-workspace-surface__eyebrow-row">
              <span className="page-card__label">Signal scan</span>
              <span className="question-status-badge question-status-badge--accent">Branch pressure</span>
            </div>
            <p className="feed-workspace-surface__breadcrumbs">
              External demand
              <span>/</span>
              Active trend
              <span>/</span>
              Company pressure
            </p>
            <h2 className="feed-workspace-surface__title">Use the feed to decide which interview branch deserves practice next</h2>
            <p className="feed-workspace-surface__body">
              Treat each section as a signal lane. Compare only enough public demand, trend movement, and company context
              to pick one defendable branch, then move back into focused DFS practice.
            </p>
          </div>
          <div className="feed-workspace-surface__stats">
            <article className="feed-workspace-surface__stat">
              <span>Signal lanes</span>
              <strong>{sectionCount}</strong>
            </article>
            <article className="feed-workspace-surface__stat">
              <span>Visible prompts</span>
              <strong>{itemCount}</strong>
            </article>
            <article className="feed-workspace-surface__stat">
              <span>Company pressure</span>
              <strong>{companySignalCount}</strong>
            </article>
            <article className="feed-workspace-surface__stat">
              <span>Entry lane</span>
              <strong>{feedQuery.data?.sections[0] ? "Lead section set" : "None"}</strong>
            </article>
          </div>
        </div>
        <div className="feed-workspace-surface__guidance" aria-label="Feed branch selection guidance">
          <article className="feed-workspace-surface__guidance-card">
            <span>Selection rule</span>
            <strong>Pick the section that sharpens one concrete follow-up branch.</strong>
          </article>
          <article className="feed-workspace-surface__guidance-card">
            <span>Comparison rule</span>
            <strong>Check adjacent lanes only until the next answer path is obvious.</strong>
          </article>
          <article className="feed-workspace-surface__guidance-card">
            <span>Exit rule</span>
            <strong>Leave the feed once one prompt is strong enough to enter DFS practice.</strong>
          </article>
        </div>
        <div className="feed-workspace-surface__chips">
          <span className="detail-chip">{`Signal lanes ${sectionCount}`}</span>
          {itemCount > 0 ? <span className="detail-chip detail-chip--accent">{`Visible prompts ${itemCount}`}</span> : null}
          {companySignalCount > 0 ? <span className="detail-chip">Company pressure loaded</span> : null}
          {feedQuery.data?.sections[0] ? <span className="detail-chip">Entry lane ready</span> : null}
        </div>
      </section>
      {feedQuery.isLoading ? (
        <LoadingStateCard
          body="Loading the latest signal lanes for the next branch decision."
          title="Preparing branch feed"
        />
      ) : null}

      {feedQuery.isError && isUnauthorized ? (
        <AuthRequiredStateCard
          body="Login to compare personalized public, trend, and company signal before choosing the next branch."
          secondaryAction={{
            label: "Browse practice questions",
            to: routeConfig.practice.buildPath(),
          }}
          title="Your branch feed unlocks after sign-in"
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
          body="No external signal lanes are available right now."
          title="Branch feed is empty"
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
