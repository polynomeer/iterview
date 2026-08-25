import { useState } from "react";
import { routeConfig } from "../../shared/config/routes";
import { getErrorDetails } from "../../shared/api/errors";
import { EmptyStateCard } from "../../shared/ui/EmptyStateCard";
import { ErrorStateCard } from "../../shared/ui/ErrorStateCard";
import { FeedbackNotice } from "../../shared/ui/FeedbackNotice";
import { LoadingStateCard } from "../../shared/ui/LoadingStateCard";
import { SectionPanel, useLayoutMode } from "../../shared/ui/layout";
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
  const queueItems = reviewQueueQuery.data?.items ?? [];
  const highPriorityCount = queueItems.filter((item) =>
    (item.priorityLabel ?? "").toLowerCase().includes("high"),
  ).length;
  const scheduledTodayCount = queueItems.filter((item) =>
    (item.scheduledLabel ?? "").toLowerCase().includes("today"),
  ).length;
  const itemsWithResultCount = queueItems.filter((item) => Boolean(item.sourceAnswerAttemptId)).length;
  const depthRepairCount = queueItems.filter((item) =>
    item.reasonTypeLabel.toLowerCase().includes("depth") ||
    item.reasonTypeLabel.toLowerCase().includes("skill"),
  ).length;
  const freshRetryCount = queueItems.filter((item) =>
    item.reasonTypeLabel.toLowerCase().includes("fresh") ||
    item.reasonTypeLabel.toLowerCase().includes("scheduled"),
  ).length;
  const executionMode =
    highPriorityCount > 0
      ? "Priority-first pass"
      : scheduledTodayCount > 0
        ? "Due-today cleanup"
        : "Steady queue maintenance";

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
  const decisionSupport = (
    <SectionPanel className="review-queue-insight-surface" variant="muted">
      <div className="review-queue-insight-surface__header">
        <div>
          <span className="page-card__label">Queue strategy</span>
          <h2 className="page-card__title">Separate answerable retries from branches that still need study</h2>
          <p className="page-card__body">
            Use the queue to decide whether the next move is answer, study, or defer.
          </p>
        </div>
        <span className="detail-chip detail-chip--accent">{executionMode}</span>
      </div>
      <div className="review-queue-insight-surface__stats">
        <article>
          <span>Result-backed</span>
          <strong>{itemsWithResultCount}</strong>
          <p>items with previous answer context to tighten immediately</p>
        </article>
        <article>
          <span>Depth repair</span>
          <strong>{depthRepairCount}</strong>
          <p>branches that likely need a more concrete follow-up explanation</p>
        </article>
      </div>
      <div className="review-queue-insight-surface__lanes">
        <div className="review-queue-insight-surface__lane">
          <strong>Answer now</strong>
          <span>Prefer items that already have result context or a sharply defined retry target.</span>
        </div>
        <div className="review-queue-insight-surface__lane">
          <strong>Study before retry</strong>
          <span>Use this lane for weak skill or shallow depth items where the explanation is still abstract.</span>
        </div>
      </div>
    </SectionPanel>
  );

  return (
    <PageContainer
      description="Resolve the highest-signal retry first, then return to fresh practice with fewer weak branches still open."
      eyebrow="Review Queue"
      introVariant="minimal"
      title="Resolve queued retry branches"
    >
      <section className="page-card review-queue-workspace-surface">
        <div className="review-queue-workspace-surface__header">
          <div className="review-queue-workspace-surface__intro">
            <div className="review-queue-workspace-surface__eyebrow-row">
              <span className="page-card__label">Queue workspace</span>
              <span className="question-status-badge question-status-badge--accent">Recovery execution</span>
            </div>
            <p className="review-queue-workspace-surface__breadcrumbs">
              Retry signal
              <span>/</span>
              Branch repair
              <span>/</span>
              Return to practice
            </p>
            <h2 className="review-queue-workspace-surface__title">Clear the smallest high-signal retry first</h2>
            <p className="review-queue-workspace-surface__body">
              Finish the retries that unblock the next branch, then return to open practice with fewer vague weak points.
            </p>
          </div>
          <div className="review-queue-workspace-surface__stats">
            <article className="review-queue-workspace-surface__stat">
              <span>Queued items</span>
              <strong>{queueItems.length}</strong>
            </article>
            <article className="review-queue-workspace-surface__stat">
              <span>High priority</span>
              <strong>{highPriorityCount}</strong>
            </article>
            <article className="review-queue-workspace-surface__stat">
              <span>Due today</span>
              <strong>{scheduledTodayCount}</strong>
            </article>
          </div>
        </div>
        <div className="review-queue-workspace-surface__guidance">
          <article className="review-queue-workspace-surface__guidance-card">
            <span>Execution rule</span>
            <strong>Clear the smallest high-signal retry first.</strong>
          </article>
          <article className="review-queue-workspace-surface__guidance-card">
            <span>Exit rule</span>
            <strong>Return to fresh practice only after the weak branch is less vague.</strong>
          </article>
        </div>
        <div className="review-queue-workspace-surface__chips">
          <span className="detail-chip detail-chip--accent">{executionMode}</span>
          {highPriorityCount > 0 ? <span className="detail-chip detail-chip--accent">High-priority items</span> : null}
          {scheduledTodayCount > 0 ? <span className="detail-chip">Due in current cycle</span> : null}
          {itemsWithResultCount > 0 ? <span className="detail-chip">Result context available</span> : null}
        </div>
      </section>
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
          ? <ReviewQueueDesktopLayout actionError={null} decisionSupport={decisionSupport} listContent={listContent} />
          : <ReviewQueueMobileLayout actionError={null} decisionSupport={decisionSupport} listContent={listContent} />
        : null}
    </PageContainer>
  );
}
