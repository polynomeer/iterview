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
  const sections = feedQuery.data?.sections.map((section) => (
    <FeedSection key={section.id} layout={isDesktop ? "grid" : "stack"} section={section} />
  )) ?? [];

  return (
    <PageContainer
      description="Browse popular, trending, and company-related question groups without losing the mobile browsing flow."
      eyebrow="Feed"
      title="Feed"
    >
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
