import { useState } from "react";
import { routeConfig } from "../../shared/config/routes";
import { getErrorDetails } from "../../shared/api/errors";
import { EmptyStateCard } from "../../shared/ui/EmptyStateCard";
import { ErrorStateCard } from "../../shared/ui/ErrorStateCard";
import { FeedbackNotice } from "../../shared/ui/FeedbackNotice";
import { LoadingStateCard } from "../../shared/ui/LoadingStateCard";
import { useLayoutMode } from "../../shared/ui/layout";
import { PageContainer } from "../../shared/ui/PageContainer";
import { useReviewQueueActionMutation } from "../../features/review-queue/api/useReviewQueueActionMutation";
import { useReviewQueueQuery } from "../../features/review-queue/api/useReviewQueueQuery";
import { ReviewQueueDesktopLayout, ReviewQueueMobileLayout } from "./ReviewQueueLayouts";
import { ReviewQueueList } from "../../widgets/review-queue";

export function ReviewQueuePage() {
  const reviewQueueQuery = useReviewQueueQuery();
  const { isDesktop } = useLayoutMode();
  const skipMutation = useReviewQueueActionMutation("skip");
  const doneMutation = useReviewQueueActionMutation("done");
  const [pendingItemId, setPendingItemId] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<"skip" | "done" | null>(null);
  const [actionStatus, setActionStatus] = useState<string | null>(null);

  async function handleSkip(queueItemId: string) {
    setActionStatus(null);
    setPendingItemId(queueItemId);
    setPendingAction("skip");
    try {
      await skipMutation.mutateAsync(queueItemId);
      setActionStatus("Queue item skipped for later.");
    } finally {
      setPendingItemId(null);
      setPendingAction(null);
    }
  }

  async function handleDone(queueItemId: string) {
    setActionStatus(null);
    setPendingItemId(queueItemId);
    setPendingAction("done");
    try {
      await doneMutation.mutateAsync(queueItemId);
      setActionStatus("Queue item marked done.");
    } finally {
      setPendingItemId(null);
      setPendingAction(null);
    }
  }

  const actionError =
    skipMutation.error instanceof Error
      ? skipMutation.error.message
      : doneMutation.error instanceof Error
        ? doneMutation.error.message
        : null;
  const actionErrorContent = actionError ? (
    <ErrorStateCard
      body={actionError}
      details={
        skipMutation.error instanceof Error
          ? getErrorDetails(skipMutation.error)
          : doneMutation.error instanceof Error
            ? getErrorDetails(doneMutation.error)
            : []
      }
      title="Queue action failed"
    />
  ) : null;
  const listContent = !reviewQueueQuery.isLoading && !reviewQueueQuery.isError && reviewQueueQuery.data && reviewQueueQuery.data.items.length > 0 ? (
    <ReviewQueueList
      items={reviewQueueQuery.data.items}
      layout={isDesktop ? "grid" : "stack"}
      onDone={(queueItemId) => {
        void handleDone(queueItemId);
      }}
      onSkip={(queueItemId) => {
        void handleSkip(queueItemId);
      }}
      pendingAction={pendingAction}
      pendingItemId={pendingItemId}
    />
  ) : null;

  return (
    <PageContainer
      description="Work through the retry queue, skip items for later, or mark them done and return to focused practice."
      eyebrow="Review Queue"
      title="Review queue"
    >
      {actionStatus ? <FeedbackNotice message={actionStatus} tone="success" /> : null}

      {reviewQueueQuery.isLoading ? (
        <LoadingStateCard
          body="Loading the queued review items."
          title="Preparing review queue"
        />
      ) : null}

      {reviewQueueQuery.isError ? (
        <ErrorStateCard
          body={
            reviewQueueQuery.error instanceof Error
              ? reviewQueueQuery.error.message
              : "The review queue could not be loaded."
          }
          details={getErrorDetails(reviewQueueQuery.error)}
          onAction={() => {
            void reviewQueueQuery.refetch();
          }}
          title="Unable to load review queue"
        />
      ) : null}

      {actionErrorContent}

      {!reviewQueueQuery.isLoading && !reviewQueueQuery.isError && reviewQueueQuery.data && reviewQueueQuery.data.items.length === 0 ? (
        <EmptyStateCard
          action={{
            label: "Back to home",
            to: routeConfig.home.buildPath(),
          }}
          body="There are no queued review items right now."
          title="Queue is empty"
        />
      ) : null}

      {listContent
        ? isDesktop
          ? <ReviewQueueDesktopLayout actionError={null} listContent={listContent} />
          : <ReviewQueueMobileLayout actionError={null} listContent={listContent} />
        : null}
    </PageContainer>
  );
}
