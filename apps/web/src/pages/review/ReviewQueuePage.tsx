import { useMemo, useState } from "react";
import type { ReviewQueueItemModel } from "../../entities/review-queue/model";
import { useReviewQueueActionMutation } from "../../features/review-queue/api/useReviewQueueActionMutation";
import { useReviewQueueQuery } from "../../features/review-queue/api/useReviewQueueQuery";
import { getErrorDetails, optionalErrorMessage, userFacingErrorMessage } from "../../shared/api/errors";
import { routeConfig } from "../../shared/config/routes";
import { useLocale, type AppLocale } from "../../shared/i18n";
import { difficultyLabel } from "../../shared/lib/labels";
import {
  Badge,
  Button,
  ButtonLink,
  Callout,
  Card,
  CardHeader,
  EmptyState,
  ErrorState,
  ListRow,
  PageHeader,
  PageSkeleton,
  Segmented,
} from "../../shared/ui/primitives";
import { daysUntil, weekLoad } from "../../entities/review-queue/dueDates";
import "./review.css";

type SortMode = "due" | "priority";

function DueBadge({ scheduledAt, locale }: { scheduledAt: string | null; locale: AppLocale }) {
  const { t } = useLocale();
  const days = daysUntil(scheduledAt);
  if (days === null) {
    return null;
  }
  if (days < 0) {
    return <Badge tone="danger">{t("reviewQueue.overdueDays", { days: -days })}</Badge>;
  }
  if (days === 0) {
    return <Badge tone="danger">{t("reviewQueue.today")}</Badge>;
  }
  const date = new Date(scheduledAt as string);
  return <Badge>{date.toLocaleDateString(locale === "ko" ? "ko-KR" : "en-US", { month: "short", day: "numeric" })}</Badge>;
}

function sortItems(items: ReviewQueueItemModel[], mode: SortMode) {
  return [...items].sort((left, right) => {
    if (mode === "priority") {
      return (right.priority ?? 0) - (left.priority ?? 0);
    }
    const leftDue = left.scheduledAt ? new Date(left.scheduledAt).getTime() : Number.POSITIVE_INFINITY;
    const rightDue = right.scheduledAt ? new Date(right.scheduledAt).getTime() : Number.POSITIVE_INFINITY;
    return leftDue - rightDue || (right.priority ?? 0) - (left.priority ?? 0);
  });
}

export function ReviewQueuePage() {
  const { locale, t } = useLocale();
  const queueQuery = useReviewQueueQuery();
  const skipMutation = useReviewQueueActionMutation("skip");
  const doneMutation = useReviewQueueActionMutation("done");
  const [sortMode, setSortMode] = useState<SortMode>("due");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const items = useMemo(() => sortItems(queueQuery.data?.items ?? [], sortMode), [queueQuery.data, sortMode]);
  const dueNow = items.filter((item) => (daysUntil(item.scheduledAt) ?? 0) <= 0);
  const week = weekLoad(items.map((item) => item.scheduledAt));
  const actionError = optionalErrorMessage(skipMutation.error ?? doneMutation.error, t("reviewQueue.actionError"));

  async function act(item: ReviewQueueItemModel, action: "skip" | "done") {
    setStatus(null);
    setPendingId(item.id);
    try {
      await (action === "skip" ? skipMutation : doneMutation).mutateAsync(item.id);
      setStatus(
        action === "skip"
          ? t("reviewQueue.movedLater", { title: item.questionTitle })
          : t("reviewQueue.markedDone", { title: item.questionTitle }),
      );
    } catch {
      // Rendered through actionError.
    } finally {
      setPendingId(null);
    }
  }

  if (queueQuery.isLoading) {
    return <PageSkeleton label={t("reviewQueue.loading")} />;
  }

  if (queueQuery.isError) {
    return (
      <ErrorState
        actions={
          <Button onClick={() => void queueQuery.refetch()} variant="primary">
            {t("reviewQueue.tryAgain")}
          </Button>
        }
        body={userFacingErrorMessage(queueQuery.error, t("reviewQueue.loadErrorBody"))}
        details={getErrorDetails(queueQuery.error)}
        size="page"
        title={t("reviewQueue.loadErrorTitle")}
      />
    );
  }

  const first = dueNow[0] ?? items[0] ?? null;

  return (
    <div className="ui-page review-page">
      <PageHeader
        actions={
          first ? (
            <ButtonLink icon="arrowRight" to={routeConfig.answerEditor.buildPath({ questionId: first.questionId })} variant="primary">
              {dueNow.length > 0 ? t("reviewQueue.startTodayReviews", { count: dueNow.length }) : t("reviewQueue.startNextReview")}
            </ButtonLink>
          ) : null
        }
        description={t("reviewQueue.description")}
        title={t("reviewQueue.title")}
      />

      <ol aria-label={t("reviewQueue.weekLabel")} className="review-week">
        {week.map((day) => (
          <li className={`review-week__day${day.isToday ? " review-week__day--today" : ""}`} key={day.date.toISOString()}>
            <span>{day.isToday ? t("reviewQueue.today") : day.date.toLocaleDateString(locale === "ko" ? "ko-KR" : "en-US", { weekday: "short" })}</span>
            <strong>{day.count}</strong>
            <span className="review-week__bar" style={{ width: `${Math.min(100, day.count * 20)}%` }} />
          </li>
        ))}
      </ol>

      <div aria-live="polite" className="review-status">
        {status ? <Callout tone="success">{status}</Callout> : null}
        {actionError ? (
          <Callout title={t("reviewQueue.actionFailedTitle")} tone="danger">
            {actionError}
          </Callout>
        ) : null}
      </div>

      <Card aria-labelledby="review-list-title">
        <CardHeader
          actions={
            <Segmented
              items={[
                { id: "due", label: t("reviewQueue.sortByDue") },
                { id: "priority", label: t("reviewQueue.sortByPriority") },
              ]}
              label={t("reviewQueue.sort")}
              onChange={setSortMode}
              value={sortMode}
            />
          }
          meta={items.length > 0 ? <Badge tone="danger">{items.length}</Badge> : null}
          title={<span id="review-list-title">{t("reviewQueue.listTitle")}</span>}
        />
        {items.length === 0 ? (
          <EmptyState
            actions={
              <ButtonLink to={routeConfig.practice.buildPath()}>{t("reviewQueue.browseQuestions")}</ButtonLink>
            }
            body={t("reviewQueue.emptyBody")}
            icon="check"
            title={t("reviewQueue.emptyTitle")}
          />
        ) : (
          items.map((item) => (
            <ListRow
              key={item.id}
              meta={[item.reasonTypeLabel, difficultyLabel(item.difficulty, locale)].filter(Boolean).join(" · ")}
              title={item.questionTitle}
              trailing={
                <>
                  <DueBadge locale={locale} scheduledAt={item.scheduledAt} />
                  <ButtonLink size="sm" to={routeConfig.answerEditor.buildPath({ questionId: item.questionId })}>
                    {t("reviewQueue.answer")}
                  </ButtonLink>
                  <Button disabled={pendingId === item.id} onClick={() => void act(item, "skip")} size="sm" variant="ghost">
                    {t("reviewQueue.later")}
                  </Button>
                  <Button disabled={pendingId === item.id} onClick={() => void act(item, "done")} size="sm" variant="ghost">
                    {t("reviewQueue.done")}
                  </Button>
                </>
              }
            />
          ))
        )}
      </Card>
    </div>
  );
}
